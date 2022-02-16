import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewPropTypes,
} from 'react-native';

const CheckBox = ({
  selected,
  onPress,
  style,
  textStyle,
  size = 30,
  color = '#24bcd0',
  text = '',
}) => {
  return (
    <TouchableOpacity style={[styles.checkBox, style]} onPress={onPress}>
      <Icon
        size={size}
        color={selected ? color : '#b8beca'}
        name={selected ? 'check-box' : 'check-box-outline-blank'}
      />

      <Text style={[styles.textStyle, textStyle]}> {text} </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  checkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex: 1,
    justifyContent: 'flex-start',
    minHeight: 30,
    width: '100%',
  },
  textStyle: {
    alignSelf: 'center',
    flexShrink: 1,
    color: 'white',
  },
});
export default CheckBox;
