import { createClient, type SanityClient } from '@sanity/client';
import type { Locale } from '@/i18n/config';

export interface Partner {
  _id: string;
  name: string;
  logo?: { asset: { url: string } };
  url?: string;
  blurb?: Record<string, string>;
  order?: number;
}

export interface LatestPost {
  _id: string;
  image: { asset: { url: string } };
  caption: string;
  instagramUrl?: string;
  publishedAt: string;
}

export interface Person {
  _id: string;
  name: string;
  role?: Record<Locale, string>;
  bio?: Record<Locale, string>;
  photo?: { asset: { url: string } };
  category: 'team' | 'board';
  order?: number;
}

let cachedClient: SanityClient | null = null;

function getClient(): SanityClient | null {
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return null;
  if (cachedClient) return cachedClient;
  cachedClient = createClient({
    projectId,
    dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
  });
  return cachedClient;
}

export async function getLatestPosts(limit = 3): Promise<LatestPost[] | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch<LatestPost[]>(
    `*[_type == "latestPost"] | order(publishedAt desc)[0...$limit]{
      _id,
      "image": image{asset->{url}},
      caption,
      instagramUrl,
      publishedAt
    }`,
    { limit }
  );
}

export async function getPartners(): Promise<Partner[] | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch<Partner[]>(
    `*[_type == "partner"] | order(order asc, name asc){
      _id,
      name,
      "logo": logo{asset->{url}},
      url,
      blurb,
      order
    }`
  );
}

async function getPeople(category: 'team' | 'board'): Promise<Person[] | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch<Person[]>(
    `*[_type == "person" && category == $category] | order(order asc, name asc){
      _id,
      name,
      role,
      bio,
      "photo": photo{asset->{url}},
      category,
      order
    }`,
    { category }
  );
}

export const getTeam = () => getPeople('team');
export const getBoard = () => getPeople('board');
