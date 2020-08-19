import {
  ACTION_NEW_NOTIFICATIONS,
  ACTION_CLEAR_NOTIFICATIONS,
} from '../actions/notifications';

export default function actions(
  state = {
    notifications: [],
  },
  action
) {
  switch (action.type) {
    case ACTION_NEW_NOTIFICATIONS:
      return {
        ...state,
        // map from { d1: t1, d2: t2, ... }
        // to [{ deviceId: d1, token: t1 }, { deviceId: d2, token: t2 }, ...]
        notifications: Object.entries(action.notifications).reduce(
          (acc, [deviceId, token]) => [...acc, { deviceId, token }],
          []
        ),
      };
    case ACTION_CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
}
