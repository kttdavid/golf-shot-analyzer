/* Backend for Golf Shot Data Interpreter.
   The browser sends { prompt, images:[{media_type,data}], tier, code }.
   This function adds the secret API key, calls the AI and returns { json }.
   AI provider: Claude by default. Gemini is used when AI_PROVIDER=gemini, or when only GEMINI_API_KEY is set.
   Nothing is stored or logged: prompts and images are never written anywhere. */

const SYSTEM = 'Return ONLY one valid JSON object. No markdown fences and no text before or after it.';
const MAX_IMAGES = 6;
const MAX_IMAGE_CHARS = 2_000_000;   // base64 characters per image (about 1.5 MB)
const MAX_PROMPT_CHARS = 200_000;
const hits = new Map();              // best-effort per-IP counter; resets on cold start

function ipOf(req) {
  const f = req.headers['x-forwarded-for'];
  return (f ? String(f).split(',')[0].trim() : req.socket && req.socket.remoteAddress) || 'unknown';
}
function overLimit(ip) {
  const limit = parseInt(process.env.DAILY_LIMIT_PER_IP || '60', 10);   // model calls per IP per day (one analysis uses about 5)
  const day = new Date().toISOString().slice(0, 10);
  const key = day + '|' + ip;
  for (const k of hits.keys()) if (!k.startsWith(day)) hits.delete(k);
  const n = (hits.get(key) || 0) + 1;
  hits.set(key, n);
  return n > limit;
}
function parseJson(text) {
  let t = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) return undefined;
  try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { return undefined; }
}

const GEMINI_FALLBACKS = ['gemini-3.8-flash', 'gemini-flash-lite-latest', 'gemini-flash-latest'];   // ordered so an overloaded model fails fast before a slow one
const sleep = ms => new Promise(r => setTimeout(r, ms));
function provider() {
  const p = String(process.env.AI_PROVIDER || '').toLowerCase();
  if (p === 'gemini' || p === 'claude') return p;
  return process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY ? 'gemini' : 'claude';
}
function keyFor(p) { return p === 'gemini' ? process.env.GEMINI_API_KEY : process.env.ANTHROPIC_API_KEY; }

/* Each caller returns { text } on success or { code, error, status } on failure. */
async function callClaude(key, prompt, images, complex) {
  const model = complex
    ? (process.env.MODEL_COMPLEX || process.env.MODEL_DEFAULT || 'claude-sonnet-5-5')
    : (process.env.MODEL_DEFAULT || 'claude-sonnet-5-5');
  const content = images.map(im => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: im.data } }));
  content.push({ type: 'text', text: prompt });
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: complex ? 6000 : 4096, system: SYSTEM, messages: [{ role: 'user', content }] })
    });
  } catch (e) { return { code: 502, error: 'upstream' }; }
  if (r.status === 429 || r.status === 529) return { code: 503, error: 'busy' };
  if (!r.ok) return { code: 502, error: 'upstream', status: r.status };
  let out; try { out = await r.json(); } catch (e) { return { code: 502, error: 'upstream' }; }
  return { text: (out.content || []).filter(c => c.type === 'text').map(c => c.text).join('') };
}

async function callGemini(key, prompt, images, complex) {
  const base = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  // Model names change often: try the configured one first, then fall back when a name is not found.
  const models = [...new Set([complex ? process.env.GEMINI_MODEL_COMPLEX : null, process.env.GEMINI_MODEL, ...GEMINI_FALLBACKS].filter(Boolean))];
  const parts = images.map(im => ({ inlineData: { mimeType: 'image/jpeg', data: im.data } }));
  parts.push({ text: prompt });
  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 16000 }   // roomy: some models spend output tokens on thinking
  });
  let last = { code: 502, error: 'upstream' };
  const deadline = Date.now() + 55000;                     // the function itself is cut off at 60 s
  for (let mi = 0; mi < models.length; mi++) {
    const model = models[mi];
    for (let attempt = 0; attempt < 2; attempt++) {
      const left = deadline - Date.now();
      if (left < 3000) return { code: 503, error: 'busy' };
      let r;
      try {
        r = await fetch(base + '/models/' + encodeURIComponent(model) + ':generateContent', {
          method: 'POST', headers: { 'x-goog-api-key': key, 'content-type': 'application/json' }, body: payload,
          signal: AbortSignal.timeout(mi < models.length - 1 ? Math.min(left, 22000) : left)   // a hung model must not use up the whole budget
        });
      } catch (e) { last = { code: 503, error: 'busy' }; break; }                              // timed out or unreachable: try the next model
      if (r.status === 404) { last = { code: 502, error: 'upstream', status: 404 }; break; }        // unknown model name: try the next one
      if (r.status === 503 || r.status === 500) { last = { code: 503, error: 'busy' }; break; }          // model overloaded: try the next one
      if (r.status === 429) {                                                                            // free-tier limit: wait once, then try the next model
        last = { code: 503, error: 'busy' };
        if (attempt === 0) { await sleep(5000); continue; }
        break;
      }
      if (!r.ok) return { code: 502, error: 'upstream', status: r.status };
      let out; try { out = await r.json(); } catch (e) { return { code: 502, error: 'upstream' }; }
      const c = out.candidates && out.candidates[0];
      const ps = c && c.content && c.content.parts || [];
      return { text: ps.filter(x => typeof x.text === 'string' && !x.thought).map(x => x.text).join('') };
    }
  }
  return last;
}

/* Setup test (GET /api/analyze?test=1): one tiny text-only call per model name; reports the AI service's status and error text. */
async function testGemini(key) {
  const base = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const models = [...new Set([process.env.GEMINI_MODEL, ...GEMINI_FALLBACKS].filter(Boolean))];
  return Promise.all(models.map(async model => {
    const t0 = Date.now(); let status = 0, message = '';
    try {
      const r = await fetch(base + '/models/' + encodeURIComponent(model) + ':generateContent', {
        method: 'POST', headers: { 'x-goog-api-key': key, 'content-type': 'application/json' }, signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with the JSON {"ok":true}' }] }], generationConfig: { responseMimeType: 'application/json' } })
      });
      status = r.status;
      if (!r.ok) { try { const j = await r.json(); message = String(j && j.error && j.error.message || '').slice(0, 400); } catch (e) {} }
    } catch (e) { message = e && e.name === 'TimeoutError' ? 'no answer within 15 seconds' : 'network error'; }
    return { model, status, ms: Date.now() - t0, message };
  }));
}
async function testClaude(key) {
  const model = process.env.MODEL_DEFAULT || 'claude-sonnet-5-5';
  const t0 = Date.now(); let status = 0, message = '';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 20, messages: [{ role: 'user', content: 'Reply with the JSON {"ok":true}' }] })
    });
    status = r.status;
    if (!r.ok) { try { const j = await r.json(); message = String(j && j.error && j.error.message || '').slice(0, 400); } catch (e) {} }
  } catch (e) { message = 'network error'; }
  return [{ model, status, ms: Date.now() - t0, message }];
}

module.exports = async function handler(req, res) {
  const send = (code, obj) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(obj)); };
  const prov = provider();
  const key = keyFor(prov);
  if (req.method === 'GET') {                                                           // setup check; shows no secrets
    const info = { provider: prov, configured: !!key };
    if (key && /[?&]test=1/.test(req.url || '') && !overLimit(ipOf(req))) info.test = await (prov === 'gemini' ? testGemini : testClaude)(key);
    return send(200, info);
  }
  if (req.method !== 'POST') return send(405, { error: 'method' });
  if (!key) return send(500, { error: 'not_configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body.prompt !== 'string' || body.prompt.length > MAX_PROMPT_CHARS) return send(400, { error: 'bad_request' });

  const need = process.env.ACCESS_CODE;
  if (need && body.code !== need) return send(401, { error: 'access_code' });

  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length > MAX_IMAGES) return send(400, { error: 'too_many_images' });
  for (const im of images) {
    if (!im || im.media_type !== 'image/jpeg' || typeof im.data !== 'string' || im.data.length > MAX_IMAGE_CHARS) return send(400, { error: 'bad_image' });
  }
  if (overLimit(ipOf(req))) return send(429, { error: 'limit' });

  const out = await (prov === 'gemini' ? callGemini : callClaude)(key, body.prompt, images, body.tier === 'complex');
  if (out.text === undefined) return send(out.code, out.status ? { error: out.error, status: out.status } : { error: out.error });
  const json = parseJson(out.text);
  if (json === undefined) return send(502, { error: 'bad_json' });
  return send(200, { json });
};
module.exports.config = { maxDuration: 60 };
