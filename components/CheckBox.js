import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewPropTypes,
  Image,
  View,
} from 'react-native';
import { hasValue } from '../Helpers';
import { Theme } from '../styles/MainTheme';

const CheckBox = ({
  selected,
  onPress,
  style = {},
  textStyle = {},
  subText = '',
  size = 20,
  text = '',
  checkImg = require('../assets/image/ic_check3.png'),
  uncheckImg = require('../assets/image/ic_uncheck3.png'),
}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          minHeight: 40,
          alignItems: 'center',
          marginBottom: 16,
          width: '100%',
        },
        style,
      ]}>
      <TouchableOpacity
        style={[
          {
            marginLeft: 0,
            paddingRight: 8,
            marginBottom: hasValue(subText) ? 8 : 0,
          },
        ]}
        onPress={onPress}>
        <Image
          source={selected ? checkImg : uncheckImg}
          resizeMode="stretch"
          style={{
            width: size,
            height: size,
          }}
        />
      </TouchableOpacity>
      <View style={{}}>
        <Text
          style={[styles.textStyle, textStyle, Theme.fonts.default.heavyMax]}>
          {text}
        </Text>
        {hasValue(subText) && (
          <Text style={[styles.subTextStyle]}>{subText}</Text>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  checkBox: {
    alignItems: 'center',
    // flex: 1,
    justifyContent: 'flex-start',
    minHeight: 30,
    width: '100%',
  },
  textStyle: {
    flexShrink: 1,
    color: 'white',
    fontSize: 16,
  },
  subTextStyle: {
    flexShrink: 1,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});
export default CheckBox;
