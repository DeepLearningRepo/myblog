import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const origin = process.env.SITE_URL || 'https://example.com';
async function files(dir) { const entries = await readdir(dir, { withFileTypes: true }); return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat(); }
const all = await files(root);
const htmlFiles = all.filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  assert.match(html, /lang="zh-CN"/, file);
  assert.ok(!html.includes('katex-error'), `Formula rendering error: ${file}`);
  for (const [, attr, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    const pathname = value.split(/[?#]/)[0];
    assert.ok(!base || pathname === base || pathname.startsWith(`${base}/`), `Missing base path: ${file} ${value}`);
    const rel = decodeURIComponent(pathname.slice(base.length)).replace(/^\//, '');
    let target = path.join(root, rel);
    if (pathname.endsWith('/')) target = path.join(target, 'index.html');
    assert.ok((await stat(target).catch(() => null))?.isFile(), `Broken ${attr}: ${file} ${value}`);
  }
}
const search = JSON.parse(await readFile(path.join(root, 'search-index.json'), 'utf8'));
assert.ok(search.length > 0, 'Search index is empty');
for (const entry of search) assert.ok(entry.url.startsWith(`${base}/posts/`), 'Incorrect search URL');
const rss = await readFile(path.join(root, 'rss.xml'), 'utf8');
assert.equal((rss.match(/<item>/g) || []).length, search.length, 'RSS and search disagree');
assert.ok(rss.includes(origin), 'RSS has incorrect origin');
const sitemap = await readFile(path.join(root, 'sitemap-0.xml'), 'utf8');
assert.ok(sitemap.includes(`${origin}${base}/`), 'Sitemap has incorrect deployment path');
assert.ok(all.some(file => file.endsWith('/404.html')), '404 page missing');
console.log(`Verified ${htmlFiles.length} pages, ${search.length} articles, internal links, assets, RSS, sitemap and base path (${base || '/'}).`);
