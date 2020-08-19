export const ACTION_NEW_NOTIFICATIONS = 'ACTION_NEW_NOTIFICATIONS';
export const ACTION_CLEAR_NOTIFICATIONS = 'ACTION_CLEAR_NOTIFICATIONS';

export function newNotifications(notifications) {
  return { type: ACTION_NEW_NOTIFICATIONS, notifications };
}

export function clearNotifications() {
  return { type: ACTION_CLEAR_NOTIFICATIONS };
}
