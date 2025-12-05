"use client";

import { useState } from "react";
import { createEvent } from "../../service/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEvent() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location_id: "auto-generated",
    privacy: "public",
    created_on: new Date(),
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    await createEvent(form);
    alert("Event created successfully!");
    router.push("/events");
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      
      {/* HEADER */}
      <div className="w-full h-40 sm:h-48 bg-gradient-to-b from-indigo-500 to-blue-700 
                      flex items-center justify-center px-4 rounded-b-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md tracking-wide">
          Create Event
        </h1>
      </div>

      {/* FORM CARD */}
      <div className="max-w-3xl mx-auto -mt-10 sm:-mt-12 px-4 pb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-6 sm:p-8">

          <div className="mb-8">
            <p className="text-sm uppercase tracking-wide text-indigo-400 font-semibold">
              New Event
            </p>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">Plan something amazing</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details for your new date or meetup.
            </p>
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-6">

            <div>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input
                name="title"
                onChange={handleChange}
                className="w-full border border-indigo-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Romantic picnic by the river"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                name="description"
                onChange={handleChange}
                className="w-full border border-indigo-100 rounded-xl px-4 py-3 text-sm h-28 focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Describe the date plans..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Date</label>
              <input
                type="date"
                name="date"
                onChange={handleChange}
                className="w-full border border-indigo-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Time</label>
              <input
                type="time"
                name="time"
                onChange={handleChange}
                className="w-full border border-indigo-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Privacy</label>
              <select
                name="privacy"
                onChange={handleChange}
                className="w-full border border-indigo-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="public">Public</option>
                <option value="friends-only">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-4">
              <Link href="/events">
                <button className="text-sm font-semibold text-indigo-500 hover:underline">
                  ← Cancel
                </button>
              </Link>

              <button
                onClick={handleSubmit}
                className="rounded-full px-6 py-3 text-sm font-semibold text-white 
                           bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 
                           shadow-md hover:opacity-95 transition"
              >
                Create Event
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
