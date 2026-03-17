/**
 * Badge Definitions Seed
 * Run this to populate the database with all available badges
 * 
 * To run: Create a seed script in package.json or run via NestJS CLI
 */

export const badgeDefinitions = [
  // ============== SOCIAL & COMMUNITY ==============
  {
    badgeId: 'trendsetter',
    name: 'The Trendsetter',
    description: 'Have 10 people join an event you created',
    category: 'Social & Community',
    iconUrl: '', // Will be updated when designer provides
  },
  {
    badgeId: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Attend 3 outings',
    category: 'Social & Community',
    iconUrl: '',
  },
  {
    badgeId: 'inner-circle',
    name: 'Inner Circle',
    description: 'Complete 5 outings where the same 3+ friends were all present',
    category: 'Social & Community',
    iconUrl: '',
  },

  // ============== EXPLORATION & DISCOVERY ==============
  {
    badgeId: 'fresh-perspective-explorer',
    name: 'Fresh Perspective',
    description: 'Review 5 locations that have 0 existing reviews',
    category: 'Exploration & Discovery',
    iconUrl: '',
  },
  {
    badgeId: 'local-legend',
    name: 'Local Legend',
    description: 'Check into the same location 5 times in one month',
    category: 'Exploration & Discovery',
    iconUrl: '',
  },
  {
    badgeId: 'caffeine-addict',
    name: 'Caffeine Addict',
    description: 'Visit 5 different coffee shops or cafes',
    category: 'Exploration & Discovery',
    iconUrl: '',
  },
  {
    badgeId: 'night-owl',
    name: 'Night Owl',
    description: 'Complete 3 outings that started after 10:00 PM',
    category: 'Exploration & Discovery',
    iconUrl: '',
  },

  // ============== CONTRIBUTION ==============
  {
    badgeId: 'paparazzi',
    name: 'Paparazzi',
    description: 'Upload a photo with 10 different reviews',
    category: 'Contribution',
    iconUrl: '',
  },
  {
    badgeId: 'vibe-check',
    name: 'Vibe Check',
    description: 'Have your review liked by 20 other users',
    category: 'Contribution',
    iconUrl: '',
  },
  {
    badgeId: 'the-critic',
    name: 'The Critic',
    description: 'Write a review that is over 100 words long',
    category: 'Contribution',
    iconUrl: '',
  },
  {
    badgeId: 'fresh-perspective-reviewer',
    name: 'Fresh Perspective',
    description: 'Be the very first person to review a newly added location',
    category: 'Contribution',
    iconUrl: '',
  },

  // ============== STREAKS & CONSISTENCY ==============
  {
    badgeId: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Go on an outing every Saturday for a month',
    category: 'Streaks & Consistency',
    iconUrl: '',
  },
  {
    badgeId: 'monthly-streak',
    name: 'Monthly Streak',
    description: 'Create or join at least one event every month for 6 months',
    category: 'Streaks & Consistency',
    iconUrl: '',
  },
  {
    badgeId: 'regular-bronze',
    name: 'The Regular',
    description: 'Hit your 10th total outing',
    category: 'Streaks & Consistency',
    tier: 'Bronze',
    iconUrl: '',
  },
  {
    badgeId: 'regular-silver',
    name: 'The Regular',
    description: 'Hit your 50th total outing',
    category: 'Streaks & Consistency',
    tier: 'Silver',
    iconUrl: '',
  },
  {
    badgeId: 'regular-gold',
    name: 'The Regular',
    description: 'Hit your 100th total outing',
    category: 'Streaks & Consistency',
    tier: 'Gold',
    iconUrl: '', //placeholdeeerrrrr
  },
];