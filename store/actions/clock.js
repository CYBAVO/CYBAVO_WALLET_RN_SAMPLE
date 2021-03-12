export const CLOCK_START = 'CLOCK_START';
export const CLOCK_STOP = 'CLOCK_STOP';
export const CLOCK_TICK = 'CLOCK_TICK';

let intervalId = 0;

export function startClock() {
  return async (dispatch, getState) => {
    if (intervalId) {
      // already started
      return;
    }
    intervalId = setInterval(() => {
      const time = Math.floor(Date.now() / 1000);
      dispatch({ type: CLOCK_TICK, time });
    }, 1000);
    const time = Math.floor(Date.now() / 1000);
    dispatch({ type: CLOCK_START, time: time });
  };
}

export function stopClock() {
  return async (dispatch, getState) => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = 0;
    }
    const time = Math.floor(Date.now() / 1000);
    dispatch({ type: CLOCK_STOP, time: time });
  };
}
