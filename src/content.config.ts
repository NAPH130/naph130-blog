import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    // 同时兼容 date 与 pubDate 两种时间书写习惯
    date: z.coerce.date().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
  }),
});

const moments = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/moments' }),
  schema: z.object({
    moments: z
      .array(
        z.object({
          date: z.string().optional(),
          year: z.number().optional(),
          month: z.number().optional(),
          day: z.number().optional(),
          time: z.string().optional(),
          content: z.string(),
          tags: z.array(z.string()).default([]),
          mood: z.string().optional(),
          images: z.array(z.string()).nullish().transform((val) => val ?? []),
        })
      )
      .default([]),
  }),
});

const friends = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/friends' }),
  schema: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    name: z.string().optional(),
    avatar: z.string().default(''),
    description: z.string().default(''),
    bio: z.string().default(''),
    url: z.string(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
  }),
});

export const collections = { posts, moments, friends };
