/* Backend for Golf Shot Data Interpreter.
   The browser sends { prompt, images:[{media_type,data}], tier, code }.
   This function adds the secret API key, calls the Claude API and returns { json }.
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

module.exports = async function handler(req, res) {
  const send = (code, obj) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(obj)); };
  if (req.method !== 'POST') return send(405, { error: 'method' });
  const key = process.env.ANTHROPIC_API_KEY;
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

  const model = body.tier === 'complex'
    ? (process.env.MODEL_COMPLEX || process.env.MODEL_DEFAULT || 'claude-sonnet-5-5')
    : (process.env.MODEL_DEFAULT || 'claude-sonnet-5-5');
  const content = images.map(im => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: im.data } }));
  content.push({ type: 'text', text: body.prompt });

  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: body.tier === 'complex' ? 6000 : 4096, system: SYSTEM, messages: [{ role: 'user', content }] })
    });
  } catch (e) { return send(502, { error: 'upstream' }); }
  if (r.status === 429 || r.status === 529) return send(503, { error: 'busy' });
  if (!r.ok) return send(502, { error: 'upstream', status: r.status });
  let out; try { out = await r.json(); } catch (e) { return send(502, { error: 'upstream' }); }
  const text = (out.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  const json = parseJson(text);
  if (json === undefined) return send(502, { error: 'bad_json' });
  return send(200, { json });
};
module.exports.config = { maxDuration: 60 };
