export interface BeholdPost {
  id: string;
  timestamp: string;
  permalink: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  prunedCaption: string;
  altText?: string;
  sizes?: {
    small?: { mediaUrl: string };
    medium?: { mediaUrl: string };
    large?: { mediaUrl: string };
    full?: { mediaUrl: string };
  };
}

interface BeholdFeed {
  username: string;
  posts: BeholdPost[];
}

export async function getInstagramPosts(limit = 3): Promise<BeholdPost[] | null> {
  // Local preview / demo mode — returns realistic fixture data so we can
  // show the auto-pull UI before the NGO signs up for Behold.
  if (import.meta.env.INSTAGRAM_MOCK === 'true') {
    const { mockInstagramPosts } = await import('./instagram-fixtures');
    return mockInstagramPosts.slice(0, limit);
  }

  const feedId = import.meta.env.PUBLIC_BEHOLD_FEED_ID;
  if (!feedId) return null;
  try {
    const res = await fetch(`https://feeds.behold.so/${feedId}`);
    if (!res.ok) return null;
    const data = (await res.json()) as BeholdFeed;
    if (!Array.isArray(data.posts)) return null;
    return data.posts.slice(0, limit);
  } catch {
    return null;
  }
}
