import { getCollection, type CollectionEntry } from 'astro:content';

export type Locale = 'zh' | 'en';
export type Post = CollectionEntry<'posts'> | CollectionEntry<'posts-en'>;
export async function getPosts(locale: Locale = 'zh') {
  return (await getCollection(locale === 'en' ? 'posts-en' : 'posts'))
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export function url(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
export function localeUrl(path = '', locale: Locale = 'zh') { return url(`${locale === 'en' ? 'en/' : ''}${path}`); }
export function postUrl(post: Post) { return localeUrl(`posts/${post.id}/`, post.collection === 'posts-en' ? 'en' : 'zh'); }
export function dateLabel(date: Date, locale: Locale = 'zh') {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en' : 'zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(date);
}
export function getTagLabels(posts: Post[]) { return Object.assign({}, ...posts.map(post => post.data.tagLabels)) as Record<string, string>; }
export function readingMinutes(body = '') {
  const chinese = (body.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (body.replace(/[\u3400-\u9fff]/g, '').match(/\b\w+\b/g) || []).length;
  return Math.max(1, Math.ceil(chinese / 350 + words / 200));
}
