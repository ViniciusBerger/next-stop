import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const mongo =
process.env.MONGO_DB_STRING_CONNECTION;

const badges = [

{
badgeId:"trendsetter",
name:"The Trendsetter",
description:"Have 10 people join an event you created",
category:"Social & Community",
iconUrl:"https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_trendsetter.svg"
},

{
badgeId:"social-butterfly",
name:"Social Butterfly",
description:"Attend 3 outings",
category:"Social & Community",
iconUrl:"https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_social_butterfly.svg"
},

{
badgeId:"inner-circle",
name:"Inner Circle",
description:"Complete 5 outings with same friends",
category:"Social & Community",
iconUrl:"https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_inner_circle.svg"
},

{
badgeId:"night-owl",
name:"Night Owl",
description:"Complete 3 outings after 10PM",
category:"Exploration",
iconUrl:"https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_night_owl.svg"
},

{
badgeId:"monthly-streak",
name:"Monthly Streak",
description:"Join event every month for 6 months",
category:"Consistency",
iconUrl:"https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_monthly_streak.svg"
},

{
badgeId:"regular-gold",
name:"The Regular",
description:"Complete 100 outings",
category:"Consistency",
tier:"Gold",
iconUrl:"https://nooqsabykmeoajdgefhg.supabase.co/storage/v1/object/public/badges/badge_gold_the_regular.svg"
}

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