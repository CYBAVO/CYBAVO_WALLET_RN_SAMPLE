import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Platform,
  Easing,
  TouchableOpacity,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import ScrollableTabView from 'react-native-scrollable-tab-view';
import moment from 'moment';
import { Surface, Text, withTheme } from 'react-native-paper';
import { useLayout } from '@react-native-community/hooks';
import IconSvgXml from './IconSvgXml';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { Theme } from '../styles/MainTheme';
import RoundButton2 from './RoundButton2';
import { ROUND_BUTTON_HEIGHT } from '../Constants';
const AnimatedProgressButton: () => React$Node = ({
  theme,
  fill,
  current = 0,
  total = 100,
  style = {},
  onPress,
  disabled,
  lock = true,
  text = '',
}) => {
  let percent = current / total;
  const [translateX] = useState(new Animated.Value(-1000));
  const { onLayout, ...layout } = useLayout();
  useEffect(() => {
    let value = layout.width * percent;
    if (lock || !disabled || (percent > 0 && value == 0)) {
      return;
    }
    Animated.timing(translateX, {
      toValue: -value,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [percent, lock, disabled, layout]);

  return (
    <TouchableOpacity
      onLayout={onLayout}
      style={[
        {
          marginTop: 16,
          paddingHorizontal: 16,
          height: ROUND_BUTTON_HEIGHT,
          alignSelf: 'center',
          backgroundColor: disabled
            ? Theme.colors.primary16
            : theme.colors.primary,
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: layout.height / 2,
        },
        style,
      ]}
      disabled={disabled}
      onPress={() => {
        translateX.setValue(0);
        if (onPress) {
          onPress();
        }
      }}>
      <Animated.View
        style={[
          styles.progress,
          { backgroundColor: fill, transform: [{ translateX: translateX }] },
        ]}
      />
      <Text
        style={[
          { color: theme.colors.text, fontSize: 14, alignSelf: 'center' },
        ]}>
        {' '}
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  progress: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});

export default withTheme(AnimatedProgressButton);
