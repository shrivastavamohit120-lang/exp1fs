import React, { useState, useMemo, useCallback } from "react";
import CalendarPanel from "./components/CalendarPanel.jsx";
import { PlainEventCard, MemoEventCard } from "./components/EventCard.jsx";
import { initialEvents } from "./data.js";

export default function App() {
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const filteredEvents = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, filter]);

  const moveEvent = useCallback((id, day, hour) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, day, hour } : e)));
  }, []);

  const handleReset = () => {
    setEvents(initialEvents());
    setFilter("");
    setResetKey((k) => k + 1);
  };

  return (
    <div className="app">
      <div className="intro">
        <h1>Weekly Calendar — Render Lab</h1>
        <p>
          A 7-day week, the same events, two implementations side by side. The left calendar
          re-renders every event card whenever its panel re-renders. The right one uses{" "}
          <code>React.memo</code>, <code>useMemo</code> and <code>useCallback</code> so a card only
          re-renders when its own data actually changed. Drag an event to a new day or time and
          watch each weekday's render count update.
        </p>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Filter events by title…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button className="secondary" onClick={handleReset}>
          Reset demo
        </button>
      </div>

      <div className="panels">
        <CalendarPanel
          key={`plain-${resetKey}`}
          label="Without optimization"
          sublabel="plain function component — no memo"
          accent="coral"
          events={filteredEvents}
          onMoveEvent={moveEvent}
          CardComponent={PlainEventCard}
        />
        <CalendarPanel
          key={`memo-${resetKey}`}
          label="With optimization"
          sublabel="React.memo + useMemo + useCallback"
          accent="teal"
          events={filteredEvents}
          onMoveEvent={moveEvent}
          CardComponent={MemoEventCard}
        />
      </div>

      <footer className="note">
        Drag one event to a different day: on the left, that day's count and the panel total jump
        by every card currently visible in the panel. On the right, only the moved card's day count
        increases by one — everything else keeps its render count exactly where it was.
      </footer>
    </div>
  );
}
