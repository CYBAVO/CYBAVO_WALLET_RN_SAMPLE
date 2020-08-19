import React, { Component } from 'react';
import { Text } from 'native-base';
import moment from 'moment';

const DisplayTime: () => React$Node = ({
  unix,
  format,
  textStyle = {},
  prefix = '',
  ...props
}) => {
  const _displayTime = () => {
    if (!unix || unix === -1) {
      return '-';
    }
    const parsed = moment.unix(unix);

    return parsed.format(format || 'YYYY-MM-DD HH:mm:ss');
  };

  return (
    <Text {...props} style={textStyle}>
      {`${prefix}${_displayTime()}`}
    </Text>
  );
};

export default DisplayTime;
