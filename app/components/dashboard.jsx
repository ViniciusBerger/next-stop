"use client";

import { firebaseSignOut } from "../service/authService";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    const router = useRouter();

    const handleSignOut = async ()=> {
        console.log("signout button")
        await firebaseSignOut();

        router.push("/")


    }


  return (
    <div className="min-h-screen w-screen bg-white text-gray-900">
      {/* Top gradient bar */}
      <div className="w-full h-56 bg-gradient-to-b from-indigo-500 to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-wide text-white drop-shadow-md">
            next<span className="text-emerald-300">-stop</span>
          </h1>
          <p className="mt-2 text-sm text-indigo-100">
            Plan the perfect date, one stop at a time.
          </p>
        </div>
        <div>
            <button className="mt-3 w-full text-xs font-semibold text-white rounded-full py-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 ml-10"
            onClick={()=>handleSignOut()}
            >Sign out</button>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="max-w-5xl mx-auto -mt-16 px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-8">
          {/* Top row: greeting + quick button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-wide text-indigo-400 font-semibold">
                Dashboard
              </p>
              <h2 className="text-2xl font-bold mt-1">
                Welcome back, romantic traveler 💘
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                See your upcoming dates, ideas, and plans all in one place.
              </p>
            </div>

            <button className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-md hover:opacity-95 transition">
              + Plan a New Date
            </button>
          </div>

          {/* Grid: left = dates, right = ideas + summary */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Upcoming dates */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Upcoming dates</h3>
                <button className="text-xs text-indigo-500 hover:underline">
                  View calendar
                </button>
              </div>

              <div className="space-y-3">
                {/* Date card 1 */}
                <div className="border border-indigo-50 rounded-2xl p-4 flex items-center justify-between hover:bg-indigo-50/50 transition">
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

                {/* Date card 2 */}
                <div className="border border-indigo-50 rounded-2xl p-4 flex items-center justify-between hover:bg-indigo-50/50 transition">
                  <div>
                    <p className="text-xs font-semibold uppercase text-indigo-400">
                      Saturday · 2:00 PM
                    </p>
                    <p className="font-semibold mt-1">
                      Museum crawl + coffee
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      3 stops · modern art, local history, hidden café.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="text-sm font-semibold text-blue-500">
                      Confirmed
                    </p>
                  </div>
                </div>

                {/* Empty state / CTA */}
                <div className="border border-dashed border-indigo-200 rounded-2xl p-4 text-center text-sm text-gray-500">
                  Want to add another adventure?{" "}
                  <button className="text-indigo-500 font-semibold hover:underline">
                    Create a new date
                  </button>
                </div>
              </div>
            </div>

            {/* Right column: ideas + snapshot */}
            <div className="space-y-4">
              {/* Quick ideas */}
              <div className="rounded-2xl border border-indigo-50 bg-indigo-50/60 p-4">
                <h3 className="text-sm font-semibold text-indigo-700 mb-2">
                  Tonight’s quick ideas
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Cozy movie night with a themed snack board</li>
                  <li>• Stargazing drive just outside the city</li>
                  <li>• Dessert-only restaurant hop</li>
                </ul>
                <button className="mt-3 w-full text-xs font-semibold text-white rounded-full py-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400">
                  Shuffle more ideas
                </button>
              </div>

              {/* Snapshot / stats */}
              <div className="rounded-2xl border border-indigo-50 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold mb-3">This month at a glance</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Dates planned</span>
                    <span className="font-semibold">6</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">New locations</span>
                    <span className="font-semibold text-emerald-500">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Average “vibe” score</span>
                    <span className="font-semibold text-indigo-500">9.1 / 10</span>
                  </div>
                </div>
              </div>

              {/* Saved route */}
              <div className="rounded-2xl border border-indigo-50 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 p-[1px]">
                <div className="rounded-2xl bg-white/95 p-4">
                  <p className="text-xs uppercase font-semibold text-indigo-400">
                    Featured route
                  </p>
                  <p className="mt-1 font-semibold">
                    “Downtown Night Walk” · 4 stops
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Rooftop view → arcade bar → dessert spot → late-night walk.
                  </p>
                  <button className="mt-3 w-full text-xs font-semibold rounded-full py-2 text-white bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400">
                    Use this route
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}
