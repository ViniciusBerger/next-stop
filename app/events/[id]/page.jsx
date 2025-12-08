"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getEventById, deleteEvent } from "../../service/authService"; 

const MOCK_EVENT_FULL = {
  id: "mock-1",
  title: "Demo: Midnight Stargazing",
  description: "This is a hardcoded test event. We will drive out to Nose Hill Park, lay out a blanket, and watch the meteor shower. Don't forget hot chocolate!",
  location: "Nose Hill Park",
  date: "2025-08-12",
  time: "23:00",
  privacy: "public",
  creatorEmail: "teste@teste.com",
};

export default function EventPage({ params }) {
  // 1. Unwrap the params (Fix for Next.js 15)
  const { id } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true); // Added explicit loading state
  const [error, setError] = useState("");

  useEffect(() => {
    // Debugging: Check your console to see what ID is being passed
    console.log("Current Event ID:", id);

    if (!id) return;

    // A. Mock Data Check
    if (id === "mock-1") {
      setEvent(MOCK_EVENT_FULL);
      setLoading(false);
      return;
    }

    // B. Real Database Fetch
    setLoading(true);
    getEventById(id)
      .then((data) => {
        console.log("Database returned:", data); // Debugging
        
        if (data) {
          // If locationId exists, remove it (cleanup)
          if (data.locationId !== undefined) {
            const { locationId, ...safeEvent } = data;
            setEvent(safeEvent);
          } else {
            setEvent(data);
          }
        } else {
          // Data is null -> Event doesn't exist
          setError("Event not found in database.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setError("Error loading event.");
        setLoading(false);
      });
  }, [id]);

  async function handleDelete() {
    if (id === "mock-1") {
      alert("You cannot delete the demo event!");
      return;
    }
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id);
      router.push("/events");
    }
  }

  const getDayAndMonth = (dateString) => {
    if (!dateString) return { month: "???", day: "??" };
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: date.getDate() + 1 
    };
  };

  // --- RENDERING STATES ---

  // 1. Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">
        <p>Loading details...</p> 
      </div>
    );
  }

  // 2. Error / Not Found (Stops the "Forever Loading")
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800">
        <h2 className="text-2xl font-bold">😕 {error || "Event not found"}</h2>
        <p className="text-gray-500 mt-2">The ID might be wrong or the event was deleted.</p>
        <Link href="/events">
            <button className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-full font-semibold hover:bg-indigo-600 transition">
                Back to Events
            </button>
        </Link>
      </div>
    );
  }

  // 3. Success (Render the event)
  const { month, day } = getDayAndMonth(event.date);

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 pb-20">
      
      {/* HEADER IMAGE */}
      <div className="relative h-56 sm:h-64 w-full bg-gray-200">
        <div className="w-full h-40 sm:h-48 bg-gradient-to-b from-indigo-500 to-blue-700 flex items-center justify-center px-4" />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md tracking-wide">Event Details</span>
        </div>
        
        <Link href="/events">
            <button className="absolute top-4 left-4 text-black text-3xl font-light hover:text-gray-700 transition sm:top-6 sm:left-6 z-10">
            ←
            </button>
        </Link>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
            <div>
              <p className="text-sm font-bold text-indigo-500 uppercase tracking-wide">
                Upcoming Date
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
                {event.title}
              </h1>
              <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                <span>Created by {event.creatorEmail || "Unknown"}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-2xl px-6 py-4 border border-indigo-100 min-w-[100px]">
              <span className="text-xs font-bold uppercase">{month}</span>
              <span className="text-2xl font-bold">{day}</span>
              <span className="text-xs font-medium">{event.time}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="md:col-span-2 space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Location
                </h3>
                <p className="mt-2 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {event.location || "TBD"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Description
                </h3>
                <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                 <button 
                    onClick={() => alert("Edit feature coming soon!")}
                    className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                 >
                    Edit Event
                 </button>
                 
                 <button 
                    onClick={handleDelete}
                    className="px-6 bg-red-50 text-red-600 border border-red-100 font-semibold py-3 rounded-xl hover:bg-red-100 transition"
                 >
                    Delete
                 </button>
              </div>

            </div>

            <div className="space-y-6">
               <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                 <h3 className="text-sm font-bold text-gray-900 mb-4">Who's going?</h3>
                 
                 <div className="flex -space-x-3 overflow-hidden mb-4">
                    <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        U
                    </div>
                    <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                        +
                    </div>
                 </div>
                 
                 <p className="text-xs text-gray-400">
                    Visible to {event.privacy}
                 </p>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}