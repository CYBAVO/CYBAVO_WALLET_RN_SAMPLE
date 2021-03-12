import { useState, useEffect, useCallback } from 'react';
import { Keyboard, Platform, Animated, Easing } from 'react-native';

export function useKeyboard() {
  const [keyboardState, setkeyboardState] = useState({
    keyboardVisible: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    const onKeyboardShow = frames => {
      console.log('onKeyboardShow:', frames);
      setkeyboardState({
        keyboardVisible: true,
        keyboardHeight: frames.endCoordinates.height,
      });
    };

    const onKeyboardHide = () => {
      console.log('onKeyboardHide:');
      setkeyboardState({
        ...keyboardState,
        keyboardVisible: false,
      });
    };

    // only do this for iOS, we rely on system adjustResize on Android
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardWillShow', onKeyboardShow);
      Keyboard.addListener('keyboardWillHide', onKeyboardHide);
      return () => {
        Keyboard.removeListener('keyboardWillShow', onKeyboardShow);
        Keyboard.removeListener('keyboardWillHide', onKeyboardHide);
      };
    }
  }, [keyboardState]);

  return keyboardState;
}

export function useShakeAnimation() {
  const [animation] = useState(new Animated.Value(0));

  const shake = useCallback(
    callback => {
      animation.setValue(0);
      Animated.timing(animation, {
        toValue: 1,
        easing: Easing.out(Easing.cubic),
        duration: 700,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && callback) {
          callback();
        }
      });
    },
    [animation],
  );

  const shakeTransform = useCallback(() => {
    return {
      translateX: animation.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: [0, -10, 10, -7, 7, 0],
      }),
    };
  }, [animation]);

  return { shakeTransform, shake };
}
