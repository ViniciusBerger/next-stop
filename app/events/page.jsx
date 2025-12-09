"use client";

import { useEffect, useState } from "react";
import { getAllEvents } from "../service/authService";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MOCK_EVENT = {
  id: "mock-1", 
  title: "✨ Demo: Midnight Stargazing",
  date: "2025-08-12",
  time: "23:00",
  location: "Nose Hill Park",
  description: "This is a hardcoded test event to show you how the design looks! We will watch the meteor shower.",
  userId: "demo"
};

export default function EventsPage() {
  const [events, setEvents] = useState([MOCK_EVENT]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAllEvents().then((realEvents) => {
      setEvents([MOCK_EVENT, ...realEvents]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen w-screen bg-white text-gray-900 relative">

      <button
        onClick={() => router.push("/dashboard")}
        className="absolute top-4 left-4 text-black text-3xl font-light hover:text-gray-700 transition sm:top-6 sm:left-6 z-10"
      >
        ←
      </button>

      {/* HEADER */}
      <div className="w-full h-40 sm:h-48 bg-gradient-to-b from-indigo-500 to-blue-700 flex items-center justify-center px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md tracking-wide">
          Events
        </h1>
      </div>

      <div className="max-w-5xl mx-auto -mt-10 sm:-mt-12 px-4 sm:px-6 pb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-6 sm:p-8 min-h-[300px]">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wide text-indigo-400 font-semibold">
                All Events
              </p>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">Your planned adventures</h2>
            </div>
            
            <Link href="/events/create">
              <button className="inline-flex items-center justify-center rounded-full px-5 sm:px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-md hover:opacity-95 transition">
                + Create Event
              </button>
            </Link>
          </div>

            <div className="space-y-4">
              
              {/* EVENT LIST */}
              {events.map((evt) => (
                <Link key={evt.id} href={`/events/${evt.id}`}>
                  <div className="border rounded-2xl p-5 sm:p-6 transition cursor-pointer shadow-sm group border-emerald-200 bg-emerald-50/30 mb-2">
                    
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold group-hover:text-indigo-600 transition">
                        {evt.title}
                      </h3>
                      <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-fullbg-emerald-100 text-emerald-600">
                        {evt.date}
                      </span>
                    </div>

                    {evt.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                        {evt.description}
                      </p>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                        <span>📍 {evt.location || "Location TBD"}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* EMPTY STATE */}
              {events.length === 0 && (
                <div className="border border-dashed border-indigo-200 rounded-2xl p-10 text-center text-gray-500 text-sm">
                  <p className="mb-2">No events found.</p>
                  <Link href="/events/create">
                    <span className="text-indigo-500 font-bold hover:underline cursor-pointer">
                      Plan your first date now →
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