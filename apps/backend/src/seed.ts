import mongoose from "mongoose";

async function seed() {
  try {
    await mongoose.connect(
      "mongodb+srv://anchal07012005_db_user:Test12345@cluster0a.amjv5md.mongodb.net/nextStop-database?retryWrites=true&w=majority"
    );

    console.log("Connected to MongoDB Atlas");

    const Users = mongoose.connection.collection("users");
    const Places = mongoose.connection.collection("places");
    const Events = mongoose.connection.collection("events");
    const Reviews = mongoose.connection.collection("reviews");
    const Favorites = mongoose.connection.collection("favorites");
    const Friends = mongoose.connection.collection("friendships");

    // USERS
    await Users.insertMany([
      { name: "Admin User", email: "admin@test.com", role: "admin", status: "ACTIVE" },
      { name: "John Walker", email: "john@test.com", role: "user", status: "ACTIVE" },
      { name: "Sarah Lee", email: "sarah@test.com", role: "user", status: "ACTIVE" },
      { name: "Mike Ross", email: "mike@test.com", role: "user", status: "ACTIVE" },
      { name: "Emma Stone", email: "emma@test.com", role: "user", status: "ACTIVE" },
    ]);

    console.log("Users created");

    // PLACES
    await Places.insertMany([
      { name: "Central Park", city: "New York" },
      { name: "CN Tower", city: "Toronto" },
      { name: "Banff National Park", city: "Alberta" },
      { name: "Stanley Park", city: "Vancouver" },
      { name: "Times Square", city: "New York" },
      { name: "Niagara Falls", city: "Ontario" },
      { name: "Golden Gate Bridge", city: "San Francisco" },
      { name: "Disneyland", city: "California" },
      { name: "Lake Louise", city: "Alberta" },
      { name: "Grand Canyon", city: "Arizona" },
    ]);

    console.log("Places created");

    // EVENTS
    await Events.insertMany([
      {
        title: "Food Festival",
        description: "Local food event",
        date: "2026-05-10",
        location: "Toronto",
      },
      {
        title: "Music Night",
        description: "Live bands",
        date: "2026-06-15",
        location: "Vancouver",
      },
    ]);

    console.log("Events created");

    // REVIEWS
    await Reviews.insertMany([
      {
        user: "john@test.com",
        place: "CN Tower",
        rating: 5,
        comment: "Amazing view!",
      },
      {
        user: "sarah@test.com",
        place: "Banff National Park",
        rating: 5,
        comment: "Beautiful nature!",
      },
    ]);

    console.log("Reviews created");

    // FAVORITES
    await Favorites.insertMany([
      {
        user: "john@test.com",
        place: "CN Tower",
      },
      {
        user: "emma@test.com",
        place: "Lake Louise",
      },
    ]);

    console.log("Favorites created");

    // FRIENDSHIPS
    await Friends.insertMany([
      {
        user1: "john@test.com",
        user2: "sarah@test.com",
        status: "accepted",
      },
      {
        user1: "mike@test.com",
        user2: "emma@test.com",
        status: "accepted",
      },
    ]);

    console.log("Friendships created");

    console.log("DATABASE SEEDED SUCCESSFULLY 🚀");

    process.exit();
  } catch (error) {
    console.error(error);
  }
}

seed();