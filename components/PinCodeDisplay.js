import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { withTheme } from 'react-native-paper';
const DOT_SIZE = 12;

let PinCodeDisplay: () => React$Node = (
  { style, length, maxLength, theme },
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

  return (
    <View style={[style, styles.pinCodeDisplay]}>
      {Array.from({ length: maxLength }).map((_, idx) => _renderDot(idx))}
    </View>
  );
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
