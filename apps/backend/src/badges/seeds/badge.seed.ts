import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const mongo =
process.env.MONGO_DB_STRING_CONNECTION;

const badges = [

 // ============== SOCIAL & COMMUNITY ==============
  {
    badgeId: 'trendsetter',
    name: 'The Trendsetter',
    description: 'Have 10 people join an event you created',
    category: 'Social & Community',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_trendsetter.png',
  },
  {
    badgeId: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Attend 3 outings',
    category: 'Social & Community',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_social_butterfly.png',
  },
  {
    badgeId: 'inner-circle',
    name: 'Inner Circle',
    description: 'Complete 5 outings where the same 3+ friends were all present',
    category: 'Social & Community',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_inner_circle.png',
  },

  // ============== EXPLORATION & DISCOVERY ==============
  {
    badgeId: 'fresh-perspective-explorer',
    name: 'Fresh Perspective',
    description: 'Review 5 locations that have 0 existing reviews',
    category: 'Exploration & Discovery',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_fresh_perspective.png',
  },
  {
    badgeId: 'local-legend',
    name: 'Local Legend',
    description: 'Check into the same location 5 times in one month',
    category: 'Exploration & Discovery',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_local_legend.png',
  },
  {
    badgeId: 'caffeine-addict',
    name: 'Caffeine Addict',
    description: 'Visit 5 different coffee shops or cafes',
    category: 'Exploration & Discovery',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_caffeine_addict.png',
  },
  {
    badgeId: 'night-owl',
    name: 'Night Owl',
    description: 'Complete 3 outings that started after 10:00 PM',
    category: 'Exploration & Discovery',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_night_owl.png',
  },

  // ============== CONTRIBUTION ==============
  {
    badgeId: 'paparazzi',
    name: 'Paparazzi',
    description: 'Upload a photo with 10 different reviews',
    category: 'Contribution',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_paparazzi.png',
  },
  {
    badgeId: 'vibe-check',
    name: 'Vibe Check',
    description: 'Have your review liked by 20 other users',
    category: 'Contribution',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_vibe_check.png',
  },
  {
    badgeId: 'the-critic',
    name: 'The Critic',
    description: 'Write a review that is over 100 words long',
    category: 'Contribution',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_the_critic.png',
  },
  {
    badgeId: 'fresh-perspective-reviewer',
    name: 'Fresh Perspective',
    description: 'Be the very first person to review a newly added location',
    category: 'Contribution',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_fresh_perspective.png',
  },

  // ============== STREAKS & CONSISTENCY ==============
  {
    badgeId: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Go on an outing every Saturday for a month',
    category: 'Streaks & Consistency',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_weekend_warrior_v2.png',
  },
  {
    badgeId: 'monthly-streak',
    name: 'Monthly Streak',
    description: 'Create or join at least one event every month for 6 months',
    category: 'Streaks & Consistency',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_monthly_streak.png',
  },
  {
    badgeId: 'regular-bronze',
    name: 'The Regular',
    description: 'Hit your 10th total outing',
    category: 'Streaks & Consistency',
    tier: 'Bronze',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_bronze_the_regular.png',
  },
  {
    badgeId: 'regular-silver',
    name: 'The Regular',
    description: 'Hit your 50th total outing',
    category: 'Streaks & Consistency',
    tier: 'Silver',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_silver_the_regular.png',
  },
  {
    badgeId: 'regular-gold',
    name: 'The Regular',
    description: 'Hit your 100th total outing',
    category: 'Streaks & Consistency',
    tier: 'Gold',
    iconUrl: 'https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_gold_the_regular.png',
  },
];
async function seed(){

try{

if(!mongo){
throw new Error("Mongo connection missing");
}

await mongoose.connect(mongo);

console.log("Mongo connected");

const db = mongoose.connection.db;

if(!db){
throw new Error("Database not ready");
}

await db.collection("Badge").deleteMany({});

await db.collection("Badge").insertMany(badges);

console.log("Badges inserted successfully");

await mongoose.disconnect();

process.exit();

}
catch(error){

console.error("Seed failed:",error);

process.exit(1);

}

}

seed();