import rss from '@astrojs/rss';
import { site } from '../site';
import { getPosts, postUrl } from '../lib/posts';
import type { APIContext } from 'astro';
export async function GET(context: APIContext) {
  return rss({ title: site.name, description: site.description, site: context.site!, items: (await getPosts()).map(post => ({ title: post.data.title, description: post.data.description, pubDate: post.data.date, link: postUrl(post), categories: post.data.tags })), customData: '<language>zh-cn</language>' });
}
