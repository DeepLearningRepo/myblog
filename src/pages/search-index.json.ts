import { getPosts, postUrl } from '../lib/posts';
export async function GET() {
  const posts = await getPosts();
  return new Response(JSON.stringify(posts.map(post => ({ title: post.data.title, description: post.data.description, tags: post.data.tags, body: post.body || '', url: postUrl(post) }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
