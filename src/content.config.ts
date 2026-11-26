import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const schema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    cover: z.enum(['mountains', 'orbit', 'windows']).default('mountains'),
    tagLabels: z.record(z.string()).default({}),
    sourceHash: z.string().optional(),
    translation: z.string().optional(),
  });
const posts = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts' }), schema });
const postsEn = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts-en' }), schema });

export const collections = { posts, 'posts-en': postsEn };
