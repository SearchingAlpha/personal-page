import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getSortedWriting } from '../lib/content';
import { profile } from '../data/profile';

export async function GET(context: APIContext) {
  const posts = await getSortedWriting();
  return rss({
    title: `${profile.name} — Writing`,
    description: profile.tagline,
    site: context.site ?? 'https://example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/writing/${post.id}/`,
    })),
  });
}
