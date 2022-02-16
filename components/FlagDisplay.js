import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { withTheme } from 'react-native-paper';
import { COUNTRIES } from '../Constants';

const FlagDisplay: () => React$Node = ({ style, theme, regionCode }) => {
  const flag = COUNTRIES[regionCode.toUpperCase()].flag;
  return <Image style={[styles.flag, style]} source={flag} />;
};

const styles = StyleSheet.create({
  flag: {
  },
});

export default withTheme(FlagDisplay);
