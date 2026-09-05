import { getCollection, type CollectionEntry } from 'astro:content';
import { projects, type Project } from '../data/projects';

export type WritingEntry = CollectionEntry<'writing'>;

// Newest first — shared by every design page so the ordering stays consistent.
export async function getSortedWriting(): Promise<WritingEntry[]> {
  const entries = await getCollection('writing');
  return entries.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

// Featured first, then most recent year first.
export function getProjects(): Project[] {
  return [...projects].sort((a, b) => {
    const feat = Number(!!b.featured) - Number(!!a.featured);
    return feat !== 0 ? feat : b.year - a.year;
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
