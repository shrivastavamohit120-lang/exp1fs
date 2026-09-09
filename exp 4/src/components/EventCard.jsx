import React, { useEffect } from "react";

/**
 * Shared card body. Fires onRender(event.day) on every render (mount + every
 * update) so the panel can count real render-function executions per
 * weekday — not just user actions. `onRender` and `onDragStart` are passed
 * in as stable references from CalendarPanel, so calling them directly here
 * never forces a new prop identity.
 */
function EventCardImpl({ event, onDragStart, onRender }) {
  useEffect(() => {
    onRender(event.day);
  });

  return (
    <div className="event-card" draggable="true" data-id={event.id} onDragStart={onDragStart}>
      {event.title}
    </div>
  );
}

// Unoptimized: plain function component, re-renders whenever its parent renders.
export const PlainEventCard = EventCardImpl;

// Optimized: React.memo bails out when props are referentially unchanged
// (same event object, same stable onDragStart/onRender references).
export const MemoEventCard = React.memo(EventCardImpl);
