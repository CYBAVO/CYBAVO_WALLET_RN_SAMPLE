import { CLOCK_START, CLOCK_STOP, CLOCK_TICK } from '../actions';

export default function actions(
  state = {
    started: false,
    time: 0,
  },
  action,
) {
  switch (action.type) {
    case CLOCK_START:
      return {
        ...state,
        started: true,
        time: action.time,
      };
    case CLOCK_STOP:
      return {
        ...state,
        started: false,
        time: action.time,
      };
    case CLOCK_TICK:
      return {
        ...state,
        time: action.time,
      };
    default:
      return state;
  }
}
