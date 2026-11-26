import { getPosts, postUrl } from '../../lib/posts';
export async function GET() {
  return new Response(JSON.stringify((await getPosts('en')).map(post => ({ title: post.data.title, description: post.data.description, tags: post.data.tags.map(tag => post.data.tagLabels[tag] || tag), body: post.body || '', url: postUrl(post) }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
