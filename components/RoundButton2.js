import React from 'react';
import { StyleSheet } from 'react-native';
import { withTheme } from 'react-native-paper';
import CustomButton from './CustomButton';
import { Theme } from '../styles/MainTheme';

const RoundButton2: () => React$Node = ({
  children,
  style,
  labelStyle,
  label,
  theme,
  icon,
  onPress,
  height = 44,
  outlined,
  color,
  disabled = false,
  ...props
}) => {
  return (
    <CustomButton
      {...props}
      disabled={disabled}
      dark={true}
      mode={outlined ? 'outlined' : 'contained'}
      icon={icon}
      style={[
        { borderRadius: height / 2, opacity: disabled ? 0.45 : 1 },
        Theme.fonts.default.medium,
        outlined ? { ...styles.outlined, borderColor: color } : null,
        style,
      ]}
      contentStyle={{ height }}
      labelStyle={labelStyle}
      color={color}
      onPress={onPress}>
      {children}
    </CustomButton>
  );
};

const styles = StyleSheet.create({
  outlined: {
    borderWidth: 1,
  },
});

export default withTheme(RoundButton2);
