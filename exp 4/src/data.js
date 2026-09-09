export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function formatHour(h) {
  const period = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:00 ${period}`;
}

export function initialEvents() {
  return [
    { id: "e1", title: "Standup", day: "Mon", hour: 9 },
    { id: "e2", title: "Design Review", day: "Mon", hour: 14 },
    { id: "e3", title: "1:1 w/ Sam", day: "Tue", hour: 11 },
    { id: "e4", title: "Focus Block", day: "Tue", hour: 9 },
    { id: "e5", title: "Sprint Planning", day: "Wed", hour: 10 },
    { id: "e6", title: "Lunch & Learn", day: "Wed", hour: 13 },
    { id: "e7", title: "Code Review", day: "Thu", hour: 9 },
    { id: "e8", title: "Client Call", day: "Thu", hour: 15 },
    { id: "e9", title: "Demo Prep", day: "Fri", hour: 11 },
    { id: "e10", title: "Retro", day: "Fri", hour: 16 },
  ];
}
