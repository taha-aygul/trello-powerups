import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.json': 'application/json',
};
const ROOT = process.cwd();
const PORT = 8765;

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (relative.includes('..')) {
    response.writeHead(400).end('bad path');
    return;
  }
  try {
    const body = await readFile(join(ROOT, relative));
    response.writeHead(200, {
      'content-type': TYPES[extname(relative)] ?? 'application/octet-stream',
      'access-control-allow-origin': '*',
    });
    response.end(body);
  } catch {
    response.writeHead(404).end('not found');
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
