"use client";

import { useEffect, useState } from "react";
import { getEventById, deleteEvent } from "../../service/eventService";

export default function EventPage({ params }) {
  const { id } = params;
  const [event, setEvent] = useState(null);

  useEffect(() => {
    getEventById(id).then((data) => {
      if (data && data.locationId !== undefined) {
        const { locationId, ...safeEvent } = data;
        setEvent(safeEvent);
      } else {
        setEvent(data);
      }
    });
  }, [id]);

  async function handleDelete() {
    await deleteEvent(id);
    alert("Event deleted");
    window.location.href = "/events";
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>
        <b>Date:</b> {event.date}
      </p>
      <p>
        <b>Time:</b> {event.time}
      </p>

      <button
        onClick={handleDelete}
        style={{
          marginTop: 20,
          background: "red",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Delete Event
      </button>
    </div>
  );
}
