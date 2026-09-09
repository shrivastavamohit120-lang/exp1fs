import React, { useRef, useCallback, useMemo, Fragment } from "react";
import { DAYS, HOURS, formatHour } from "../data.js";

export default function CalendarPanel({ label, sublabel, accent, events, onMoveEvent, CardComponent }) {
  // Counts live in a ref, NOT React state. If we used setState here, every
  // card render would call bump() -> setState -> CalendarPanel re-renders ->
  // the unmemoized card re-renders again -> bump() again -> infinite loop.
  // A ref lets us count renders without the counting itself causing another
  // render; we push the number straight into the DOM instead.
  const countsRef = useRef({});
  const dayLabelRefs = useRef({});
  const totalLabelRef = useRef(null);

  const paintDay = (day) => {
    const el = dayLabelRefs.current[day];
    if (el) el.textContent = `${countsRef.current[day] || 0} renders`;
  };

  const paintTotal = () => {
    const total = DAYS.reduce((sum, d) => sum + (countsRef.current[d] || 0), 0);
    if (totalLabelRef.current) totalLabelRef.current.textContent = String(total);
  };

  const bump = useCallback((day) => {
    countsRef.current[day] = (countsRef.current[day] || 0) + 1;
    paintDay(day);
    paintTotal();
  }, []);

  const handleResetCounts = useCallback(() => {
    countsRef.current = {};
    DAYS.forEach(paintDay);
    paintTotal();
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const key = `${e.day}|${e.hour}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData("text/plain", e.currentTarget.dataset.id);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const { day, hour } = e.currentTarget.dataset;
      if (id) onMoveEvent(id, day, Number(hour));
    },
    [onMoveEvent]
  );

  return (
    <section className={`panel panel-${accent}`}>
      <div className="panel-header">
        <div>
          <h2>{label}</h2>
          <span className="sub">{sublabel}</span>
        </div>
        <div className="counter-block">
          <div className="counter">
            <span className="counter-label">CARD RENDERS</span>
            <span className="counter-value" ref={totalLabelRef}>
              0
            </span>
          </div>
          <button className="reset-btn" onClick={handleResetCounts}>
            Reset
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="grid-header time-header" />
        {DAYS.map((d) => (
          <div className="grid-header" key={d}>
            <span className="day-name">{d}</span>
            <span className="day-count" ref={(el) => (dayLabelRefs.current[d] = el)}>
              0 renders
            </span>
          </div>
        ))}

        {HOURS.map((hour) => (
          <Fragment key={hour}>
            <div className="time-label">{formatHour(hour)}</div>
            {DAYS.map((day) => {
              const key = `${day}|${hour}`;
              const cellEvents = grouped[key] || [];
              return (
                <div
                  key={key}
                  className="cell"
                  data-day={day}
                  data-hour={hour}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {cellEvents.map((ev) => (
                    <CardComponent key={ev.id} event={ev} onDragStart={handleDragStart} onRender={bump} />
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
