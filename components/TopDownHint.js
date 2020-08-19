import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { useDimensions, useLayout } from '@react-native-community/hooks';
import { withTheme, Surface, Text } from 'react-native-paper';
import { hasValue } from '../Helpers';

const TopDownHint: () => React$Node = ({
  theme,
  onDismiss = () => {},
  title,
  style = {},
}) => {
  const { height: screneHeight } = useDimensions().screen;
  const { onLayout, ...layout } = useLayout();
  const [translateY] = useState(
    // new Animated.Value(0)
    new Animated.Value(-layout.height || -screneHeight)
  );

  useEffect(() => {
    if (hasValue(title)) {
      // animate show
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start(({ finished }) => {
        // animate hide
        setTimeout(() => {
          Animated.timing(translateY, {
            toValue: -layout.height || -screneHeight,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start(({ finished }) => {
            onDismiss();
          });
        }, 500);
      });
    }
  }, [title]);

  return (
    <>
      <Animated.View
        style={[
          {
            transform: [{ translateY }],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          },
          style,
        ]}>
        <Surface
          onLayout={onLayout}
          style={[
            {
              backgroundColor: theme.colors.primary,
            },
          ]}>
          <View style={[styles.footer]}>
            <Text style={styles.text}>{title}</Text>
          </View>
        </Surface>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingTop: 56,
    paddingBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    flexShrink: 1,
  },
});
export default withTheme(TopDownHint);
