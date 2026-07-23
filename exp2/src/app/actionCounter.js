// Not part of the "real" architecture — this exists purely so the UI can
// show a live "actions dispatched" number next to the selector recompute
// counts, making the memoization payoff (Assignment 4/5) visible instead of
// theoretical.
let dispatchCount = 0;

export const actionCounterMiddleware = () => (next) => (action) => {
  dispatchCount += 1;
  return next(action);
};

export function getDispatchCount() {
  return dispatchCount;
}
