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

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

/** One line of the letter's "Recently" list. */
export interface RecentItem {
  date: Date;
  /** How the date reads in the list: "Aug 2026" for an essay, "2026" for a project. */
  when: string;
  title: string;
  /** What it is, lower-case: "essay", or a project's status ("building", "shipped"…). */
  kind: string;
  href: string;
}

/**
 * The newest things across the site, essays and projects together. Projects
 * carry only a year, so each is dated to the middle of its year: a year's
 * essays then sort naturally around it. Links go to the section pages, since
 * essays have no pages of their own yet.
 */
export async function getRecent(limit = 4): Promise<RecentItem[]> {
  const essays: RecentItem[] = (await getSortedWriting()).map((p) => ({
    date: p.data.date,
    when: formatMonthYear(p.data.date),
    title: p.data.title,
    kind: 'essay',
    href: '/writing',
  }));
  const work: RecentItem[] = projects.map((p) => ({
    date: new Date(p.year, 6, 1),
    when: p.when ?? String(p.year),
    title: p.name,
    kind: p.status.toLowerCase(),
    href: '/projects',
  }));
  return [...essays, ...work].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
