"use client";

import { useState } from "react";
import { createEvent } from "../../service/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LOCATION_DATA = [
  {
    category: "Parks",
    places: ["Prince's Island Park", "Bowness Park", "Fish Creek Park", "Nose Hill Park", "Central Memorial Park", "Riley Park"]
  },
  {
    category: "Dining",
    places: ["River Café", "Sky 360 (Calgary Tower)", "Ten Foot Henry", "Ship & Anchor Pub", "Village Ice Cream", "Higher Ground Cafe"]
  },
  {
    category: "Sights",
    places: ["The Calgary Zoo", "TELUS Spark", "Central Library", "Studio Bell", "Heritage Park", "Stephen Avenue"]
  },
  {
    category: "Other",
    places: ["Online / Virtual", "TBD / Decided Later"]
  }
];

export default function CreateEvent() {
  const router = useRouter();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "", 
    privacy: "public",
    created_on: new Date(),
  });

  const availablePlaces = LOCATION_DATA.find(c => c.category === selectedCategory)?.places || [];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCategoryChange(e) {
    setSelectedCategory(e.target.value);
    setForm({ ...form, location: "" }); 
  }

  async function handleSubmit() {
    if (!form.title || !form.date || !form.location) {
        alert("Please fill in the required fields.");
        return;
    }

    try {
      setIsSubmitting(true); 
      
      // 1. Send data to Firebase
      await createEvent(form);

      // 2. Show the Success
      setShowSuccess(true);

      // 3. Wait 2 seconds so user sees the success message, then redirect
      setTimeout(() => {
        router.push("/events");
      }, 2000);

    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 relative">
      
      {/* --- SUCCESS MODAL (Overlay) --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center transform scale-100 transition-all">
            {/* Green Check Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-500">
              Your event has been created. <br/> Redirecting you now...
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="w-full h-40 sm:h-48 bg-gradient-to-b from-indigo-500 to-blue-700 flex items-center justify-center px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md tracking-wide">
          Create Event
        </h1>
      </div>

      {/* FORM CONTAINER */}
      <div className="max-w-3xl mx-auto -mt-10 sm:-mt-12 px-4 pb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">

          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-purple-500 font-semibold">New Event</p>
            <h2 className="text-xl font-bold mt-1">Plan something in YYC</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details for your new date.</p>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Title</label>
              <input
                name="title"
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none disabled:opacity-50"
                placeholder="Ex: Sunset walk..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Description</label>
              <textarea
                name="description"
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base h-24 focus:ring-2 focus:ring-blue-400 outline-none resize-none disabled:opacity-50"
                placeholder="Add some details..."
              />
            </div>

            {/* LOCATION PICKER */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-sm font-semibold mb-3 text-gray-800">Location</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative w-full">
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    disabled={isSubmitting}
                    className="w-full max-w-full border border-gray-200 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none bg-white appearance-none truncate pr-8 disabled:opacity-50"
                  >
                    <option value="" disabled>Type...</option>
                    {LOCATION_DATA.map((group) => (
                      <option key={group.category} value={group.category}>{group.category}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                     <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>

                <div className="relative w-full">
                  <select
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    disabled={!selectedCategory || isSubmitting}
                    className={`w-full max-w-full border border-gray-200 rounded-lg px-3 py-3 text-base outline-none appearance-none truncate pr-8
                      ${!selectedCategory ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-400'}`}
                  >
                    <option value="" disabled>{selectedCategory ? "Select spot..." : "← Pick type"}</option>
                    {availablePlaces.map((place) => (
                      <option key={place} value={place}>{place}</option>
                    ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                     <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Date</label>
                  <input
                      type="date"
                      name="date"
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Time</label>
                  <input
                      type="time"
                      name="time"
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none disabled:opacity-50"
                  />
                </div>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Privacy</label>
              <select
                name="privacy"
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none bg-white disabled:opacity-50"
              >
                <option value="public">Public</option>
                <option value="friends-only">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
              <Link href="/events" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto py-3 text-sm font-semibold text-gray-500 hover:text-red-500 transition text-center">
                  Cancel
                </button>
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full sm:w-auto rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition
                  ${isSubmitting 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 hover:opacity-95"
                  }`}
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}