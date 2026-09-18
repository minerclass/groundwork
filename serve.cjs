// Serves only this game directory on loopback. No installation or build required.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const allowed = new Set(['index.html', 'facilitator.html', 'styles.css', 'plots.js', 'story.js', 'voxel.js', 'game.js', 'vendor/three.min.js', 'vendor/three-license.txt']);
const server = http.createServer((request, response) => {
  const name = new URL(request.url, 'http://127.0.0.1').pathname.slice(1) || 'index.html';
  if (!allowed.has(name)) { response.writeHead(404); response.end('Not found'); return; }
  fs.readFile(path.join(__dirname, name), (error, data) => {
    if (error) { response.writeHead(500); response.end('Unable to load game file.'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(name)], 'Cache-Control': 'no-store' }); response.end(data);
  });
});
server.listen(4180, '127.0.0.1', () => console.log('Groundwork is ready at http://127.0.0.1:4180'));
