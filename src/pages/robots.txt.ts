import type { APIContext } from 'astro';
import { url } from '../lib/posts';
export function GET(context: APIContext) {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(url('sitemap-index.xml'), context.site)}\n`, { headers: { 'Content-Type': 'text/plain' } });
}
