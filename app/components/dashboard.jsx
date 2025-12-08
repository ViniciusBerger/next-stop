"use client";

import { firebaseSignOut } from "../service/authService";
import { useRouter } from "next/navigation";

// MOCK DATA
const ACTIVITY_FEED = [
  {
    id: 1,
    user: "Sarah J.",
    action: "visited",
    target: "River Café",
    time: "2h ago",
    avatarColor: "bg-emerald-100 text-emerald-600"
  },
  {
    id: 2,
    user: "Mike T.",
    action: "reviewed",
    target: "Ten Foot Henry",
    rating: 5,
    time: "4h ago",
    avatarColor: "bg-blue-100 text-blue-600"
  },
  {
    id: 3,
    user: "Jessica L.",
    action: "added",
    target: "Central Library",
    time: "Yesterday",
    avatarColor: "bg-purple-100 text-purple-600"
  },
  {
    id: 4,
    user: "David B.",
    action: "visited",
    target: "Village Ice Cream",
    time: "Yesterday",
    avatarColor: "bg-orange-100 text-orange-600"
  }
];

export default function Dashboard() {
  const router = useRouter();

  const handleSignOut = async () => {
    await firebaseSignOut();
    router.push("/");
  };

  const goToEventsPage = () => {
    router.push("/events");
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <div className="relative w-full bg-gradient-to-b from-indigo-500 to-blue-700
                      flex flex-col items-center justify-start px-4 pt-16 pb-10 rounded-b-3xl">

        <button
          className="absolute top-4 right-4 text-xs font-semibold text-white rounded-full py-2 px-4 
                     bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-md"
          onClick={handleSignOut}
        >
          Sign out
        </button>

        <div className="text-center mt-4">
          <h1 className="text-4xl font-extrabold tracking-wide text-white drop-shadow-md">
            next<span className="text-emerald-300">-stop</span>
          </h1>
          <p className="mt-2 text-sm text-indigo-100">
            Plan the perfect date, one stop at a time.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 -mt-6 sm:-mt-12 md:-mt-16">
        <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-6 sm:p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-wide text-indigo-400 font-semibold mt-2">
                Dashboard
              </p>
              <h2 className="text-2xl font-bold mt-5">
                Welcome back, romantic traveler 💘
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                See your upcoming dates and what the community is up to.
              </p>
            </div>

            <button
              onClick={goToEventsPage}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-md hover:opacity-95 transition mt-5"
            >
              + Plan a New Date
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* LEFT COLUMN: UPCOMING DATES */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Upcoming dates</h3>
                <button className="text-xs text-indigo-500 hover:underline">
                  View calendar
                </button>
              </div>

              <div className="space-y-3">
                {/* Date Card 1 */}
                <div className="border border-indigo-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-indigo-50/50 transition">
                  <div>
                    <p className="text-xs font-semibold uppercase text-indigo-400">
                      Friday · 7:30 PM
                    </p>
                    <p className="font-semibold mt-1">
                      Sunset picnic at Riverfront Park
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Bring snacks, blanket, and portable speaker.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Mood</p>
                    <p className="text-sm font-semibold text-emerald-500">
                      Chill & Romantic
                    </p>
                  </div>
                </div>

                {/* Date Card 2 */}
                <div className="border border-indigo-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-indigo-50/50 transition">
                  <div>
                    <p className="text-xs font-semibold uppercase text-indigo-400">
                      Saturday · 2:00 PM
                    </p>
                    <p className="font-semibold mt-1">
                      Museum crawl + coffee
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      3 stops · modern art, local history, café.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="text-sm font-semibold text-blue-500">
                      Confirmed
                    </p>
                  </div>
                </div>

                <div className="border border-dashed border-indigo-200 rounded-2xl p-4 text-center text-sm text-gray-500">
                  Want to add another adventure?{" "}
                  <button onClick={goToEventsPage} className="text-indigo-500 font-semibold hover:underline">
                    Create a new date
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIVITY FEED */}
            <div className="space-y-4">
              
              <div className="rounded-2xl border border-indigo-50 bg-gray-50/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">
                    Friends Activity
                  </h3>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>

                <div className="space-y-5">
                  {ACTIVITY_FEED.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {/* Avatar Circle */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.avatarColor}`}>
                        {item.user.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="text-sm">
                        <p className="text-gray-900 leading-snug">
                          <span className="font-semibold">{item.user}</span>
                          {" "}
                          <span className="text-gray-500">
                            {item.action === 'visited' && 'checked in at'}
                            {item.action === 'reviewed' && 'left a review for'}
                            {item.action === 'added' && 'wants to go to'}
                          </span>
                          {" "}
                          <span className="font-semibold text-indigo-600">
                            {item.target}
                          </span>
                        </p>
                        
                        {item.action === 'reviewed' && (
                           <div className="flex text-yellow-400 text-xs mt-0.5">
                             {"★".repeat(item.rating)}
                           </div>
                        )}

                        <p className="text-xs text-gray-400 mt-1 font-medium">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-2 text-xs font-semibold text-indigo-500 hover:text-indigo-600 border border-indigo-100 rounded-xl hover:bg-white transition">
                  View all activity
                </button>
              </div>

              {/* Featured Route (Kept this as it fits nicely below feed) */}
              {/* <div className="rounded-2xl border border-indigo-50 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 p-[1px]">
                <div className="rounded-2xl bg-white/95 p-4">
                  <p className="text-xs uppercase font-semibold text-indigo-400">
                    Featured route
                  </p>
                  <p className="mt-1 font-semibold">“Downtown Night Walk”</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Rooftop view → arcade bar → dessert spot.
                  </p>
                </div> */}
              {/* </div> */}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}