import rss from '@astrojs/rss';
import { site } from '../../site';
import { getPosts, postUrl } from '../../lib/posts';
import type { APIContext } from 'astro';
export async function GET(context: APIContext) {
  return rss({ title: site.en.name, description: site.en.description, site: context.site!, items: (await getPosts('en')).map(post => ({ title: post.data.title, description: post.data.description, pubDate: post.data.date, link: postUrl(post), categories: post.data.tags.map(tag => post.data.tagLabels[tag] || tag) })), customData: '<language>en</language>' });
}
