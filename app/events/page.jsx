"use client";

import { useEffect, useState } from "react";
import { getAllEvents } from "../service/authService";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    getAllEvents().then(setEvents);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-white text-gray-900 relative">

      {/* Mobile-friendly back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute top-4 left-4 text-black text-3xl font-light hover:text-gray-700 transition sm:top-6 sm:left-6"
      >
        ←
      </button>

      {/* Header */}
      <div className="w-full h-40 sm:h-48 bg-gradient-to-b from-indigo-500 to-blue-700 flex items-center justify-center px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md tracking-wide">
          Events
        </h1>
      </div>

      <div className="max-w-5xl mx-auto -mt-10 sm:-mt-12 px-4 sm:px-6 pb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-6 sm:p-8">

          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wide text-indigo-400 font-semibold">
                All Events
              </p>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">Your planned adventures</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Browse, review, or update your date plans.
              </p>
            </div>

            <Link href="/events/create">
              <button className="inline-flex items-center justify-center rounded-full px-5 sm:px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-md hover:opacity-95 transition">
                + Create Event
              </button>
            </Link>
          </div>

          {/* Events list */}
          <div className="space-y-4">
            {events.map(evt => (
              <Link key={evt.id} href={`/events/${evt.id}`}>
                <div className="border border-indigo-50 rounded-2xl p-5 sm:p-6 hover:bg-indigo-50/50 transition cursor-pointer shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold">{evt.title}</h3>
                    <span className="text-xs sm:text-sm text-indigo-500 font-semibold">
                      {evt.date} · {evt.time}
                    </span>
                  </div>

                  {evt.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      {evt.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}

            {events.length === 0 && (
              <div className="border border-dashed border-indigo-200 rounded-2xl p-6 text-center text-gray-500 text-sm">
                No events yet — ready to plan something magical?
                <Link href="/events/create">
                  <span className="text-indigo-500 font-semibold hover:underline ml-1">
                    Create your first event
                  </span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
