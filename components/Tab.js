import React from 'react';
import {
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Theme } from '../styles/MainTheme';

const Tab: () => React$Node = ({
  tab,
  page,
  onPressHandler,
  onTabLayout,
  styles,
}) => {
  const { label } = tab;
  const style = {
    marginHorizontal: 20,
    paddingVertical: 10,
  };
  const containerStyle = {
    paddingHorizontal: 0,
    paddingVertical: 5,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: styles.backgroundColor,
    opacity: styles.opacity,
  };
  const textStyle = {
    color: styles.textColor,
    fontWeight: '600',
    fontSize: 16,
  };
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={style}
      onPress={onPressHandler}
      onLayout={onTabLayout}
      key={page}>
      <Animated.View style={containerStyle}>
        <Animated.Text style={[textStyle, Theme.fonts.default.regular]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
export default Tab;
