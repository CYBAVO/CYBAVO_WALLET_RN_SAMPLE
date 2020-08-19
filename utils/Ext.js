String.prototype.hideString = function(hide = false, placeholder = '*') {
  if (hide) {
    return '****';
    // return this.replace(new RegExp('.', 'g'), placeholder);
  }
  return this;
}
export function hideString(text, hide = false, placeholder = '*') {
  if (hide) {
    return '****';
  }
  return text;
}
export function userActionDesc(action) {
  switch (action.userAction) {
    // case UserAction.NONE:
    //   return 'NONE';
    // case UserAction.ACCEPT:
    //   return 'ACCEPT';
    // case UserAction.REJECT:
    //   return 'REJECT';
    // case UserAction.UNKNOWN:
    default:
      return `UNKNOWN(${action.userAction})`;
  }
}

export function getTitle(action) {
  switch (action.type) {
    // case Types.SETUP_PIN_CODE:
    //   return 'Setup PIN code';
    // case Types.CUSTOM_OTP_ACTION:
    // case Types.CUSTOM_PIN_CODE_ACTION:
    //   return action.messageTitle;
    default:
      return `UNKNOWN(${action.type})`;
  }
}

export function getBody(action) {
  switch (action.type) {
    // case Types.SETUP_PIN_CODE:
    //   return 'Setup PIN code to protect your property';
    // case Types.CUSTOM_OTP_ACTION:
    // case Types.CUSTOM_PIN_CODE_ACTION:
    //   return action.messageBody;
    default:
      return `UNKNOWN(${action.type})`;
  }
}
