/* Local test server (no packages needed, Node 18+):  node dev.js
   Reads .env (ANTHROPIC_API_KEY, ACCESS_CODE, ...). MOCK=1 returns canned answers so you can test the whole page
   without spending API credit. */
const http = require('http'), fs = require('fs'), path = require('path');
try { fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(l => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }); } catch (e) {}
const handler = require('./api/analyze.js');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
function mock(prompt) {
  if (/Look again at the Apex/.test(prompt)) return { apex: [88, 90, 86] };
  if (/Read every golf shot/.test(prompt)) {
    const mk = i => ({ club: '7 iron', carry: 160 + i * 2, ball_speed: 115, club_speed: 83, launch_dir: 0.5 * i, spin_axis: i - 2, offline: i * 2 - 4, apex: 88 + i, face_angle: -0.5 + i * 0.4, path: -1 + i * 0.3, aoa: -4.5, dyn_loft: 22, spin_loft: 26, spin: 5600, launch: 17 });
    return { shots: [0, 1, 2, 3, 4].map(mk), notes: '', averages_only: false };
  }
  return { summary: 'Mock report', kpis: [], strengths: ['Mock strength'], weaknesses: [], limits: ['Mock run: no real analysis'], clubs: [] };
}
http.createServer((req, res) => {
  if (req.url.startsWith('/api/analyze')) {
    let raw = ''; req.on('data', d => raw += d); req.on('end', () => {
      try { req.body = JSON.parse(raw || '{}'); } catch (e) { req.body = null; }
      if (process.env.MOCK === '1') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ json: mock(req.body && req.body.prompt || '') })); }
      handler(req, res);
    }); return;
  }
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(__dirname, 'public', path.normalize(p).replace(/^(\.\.[\/\\])+/, ''));
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end('not found'); } res.setHeader('content-type', TYPES[path.extname(f)] || 'application/octet-stream'); res.end(d); });
}).listen(process.env.PORT || 3000, () => console.log('http://localhost:' + (process.env.PORT || 3000) + (process.env.MOCK === '1' ? '  (MOCK mode)' : '')));
