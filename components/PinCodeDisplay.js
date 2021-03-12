import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { withTheme } from 'react-native-paper';
import StrengthStatus from './StrengthStatus';
const DOT_SIZE = 12;

let PinCodeDisplay: () => React$Node = (
  {
    style,
    length,
    maxLength,
    theme,
    showStrength,
    level,
    onLayout,
    isIndicator,
    activeIndex,
    size = 6,
  },
  ref
) => {
  const [animPinIncorrect] = useState(new Animated.Value(0));
  const myRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      shake: callback => {
        animPinIncorrect.setValue(0);
        Animated.timing(animPinIncorrect, {
          toValue: 1,
          easing: Easing.out(Easing.cubic),
          duration: 700,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            callback();
          }
        });
      },
    };
  });

  const _renderDot = idx => (
    <Animated.View
      ref={myRef}
      key={idx}
      style={[
        styles.dot,
        {
          // borderColor: activeColor,
          backgroundColor:
            idx < length
              ? theme.colors.primary
              : theme.colors.pinDisplayInactivate,
          // borderWidth: 1,
          borderRadius: DOT_SIZE / 2,
          transform: [
            {
              translateX: animPinIncorrect.interpolate({
                inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                outputRange: [0, -10, 10, -7, 7, 0],
              }),
            },
          ],
        },
      ]}
    />
  );
  const _renderIndicator = (idx, size, activeIdx) => (
    <Animated.View
      ref={myRef}
      key={idx}
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          // backgroundColor: 'red',
          marginHorizontal: 4,
          backgroundColor:
            idx == activeIdx
              ? theme.colors.primary
              : theme.colors.pinDisplayInactivate,
          // borderWidth: 1,
          transform: [
            {
              translateX: animPinIncorrect.interpolate({
                inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                outputRange: [0, -10, 10, -7, 7, 0],
              }),
            },
          ],
        },
      ]}
    />
  );
  const renderPinDisplay = () => {
    return (
      <View onLayout={onLayout} style={[style, styles.pinCodeDisplay]}>
        {isIndicator
          ? Array.from({ length: maxLength }).map((_, idx) =>
              _renderIndicator(idx, size, activeIndex)
            )
          : Array.from({ length: maxLength }).map((_, idx) => _renderDot(idx))}
      </View>
    );
  };
  return renderPinDisplay();
};

const styles = StyleSheet.create({
  pinCodeDisplay: {
    flexDirection: 'row',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    // backgroundColor: 'red',
    marginHorizontal: 12,
  },
});

export default withTheme(forwardRef(PinCodeDisplay));
