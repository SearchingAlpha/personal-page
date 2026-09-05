import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Long-form writing. Bodies are real Markdown so the chosen design can later
// grow into full per-article pages; the drafts only render title/date/excerpt.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    readingTime: z.string().optional(),
  }),
});

export const collections = { writing };
