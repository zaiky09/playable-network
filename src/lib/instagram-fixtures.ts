import type { BeholdPost } from './instagram';

/**
 * Fixture data matching Behold.so's JSON feed shape.
 * Used when INSTAGRAM_MOCK=true so we can demo the auto-pull UI
 * before the NGO signs up for Behold and connects their Instagram.
 */
export const mockInstagramPosts: BeholdPost[] = [
  {
    id: 'mock_1',
    timestamp: '2026-06-07T09:30:00Z',
    permalink: 'https://www.instagram.com/theplayablenetwork/',
    mediaType: 'IMAGE',
    mediaUrl: 'https://picsum.photos/seed/playable-pitch/800/800',
    caption:
      'Together for Turkana — Football for Youth Development. 2 days to go! ⚽ #TurkanaYouth #FootballForGood',
    prunedCaption:
      'Together for Turkana — Football for Youth Development. 2 days to go!',
    altText: 'Young players in football kits running on a dirt pitch in Turkana',
    sizes: {
      small: { mediaUrl: 'https://picsum.photos/seed/playable-pitch/320/320' },
      medium: { mediaUrl: 'https://picsum.photos/seed/playable-pitch/640/640' },
      large: { mediaUrl: 'https://picsum.photos/seed/playable-pitch/800/800' },
    },
  },
  {
    id: 'mock_2',
    timestamp: '2026-05-28T14:15:00Z',
    permalink: 'https://www.instagram.com/theplayablenetwork/',
    mediaType: 'IMAGE',
    mediaUrl: 'https://picsum.photos/seed/playable-match/800/800',
    caption:
      'Match day in Lodwar! The young players from our development program faced off in a tournament that brought the whole community together. 🏆 Thank you to Hillside FC for the partnership and every volunteer who made it possible.',
    prunedCaption:
      'Match day in Lodwar! Young players from our development program in a community tournament. 🏆',
    altText: 'Players celebrating after a goal',
    sizes: {
      small: { mediaUrl: 'https://picsum.photos/seed/playable-match/320/320' },
      medium: { mediaUrl: 'https://picsum.photos/seed/playable-match/640/640' },
      large: { mediaUrl: 'https://picsum.photos/seed/playable-match/800/800' },
    },
  },
  {
    id: 'mock_3',
    timestamp: '2026-05-19T11:00:00Z',
    permalink: 'https://www.instagram.com/theplayablenetwork/',
    mediaType: 'IMAGE',
    mediaUrl: 'https://picsum.photos/seed/playable-classroom/800/800',
    caption:
      'Off the pitch, on the books. Our Education & Life Skills sessions cover everything from financial literacy to nutrition. Football is the start — opportunity is the goal.',
    prunedCaption:
      'Off the pitch, on the books. Education & Life Skills sessions in session.',
    altText: 'Young people in a classroom listening to a facilitator',
    sizes: {
      small: { mediaUrl: 'https://picsum.photos/seed/playable-classroom/320/320' },
      medium: { mediaUrl: 'https://picsum.photos/seed/playable-classroom/640/640' },
      large: { mediaUrl: 'https://picsum.photos/seed/playable-classroom/800/800' },
    },
  },
];
