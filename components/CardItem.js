import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import { startColors, endColors, Theme } from '../styles/MainTheme';
import IconSvgXml from './IconSvgXml.js';
import Styles from '../styles/Styles';
import { CardPatternSmallImg } from './CurrencyIcon';
import { hideString } from '../utils/Ext';
import { Modal, Text } from 'react-native-paper';
import { useLayout } from '@react-native-community/hooks';
import { sub } from 'react-native-reanimated';

const CardItem: () => React$Node = ({
  type = 'BTC',
  type2 = 'UNKNOWN',
  hide = false,
  title = 'BTC',
  subTitle,
  desc = 'bitcoin',
  amount = '0.298123123123',
  amount2,
  onPress = () => {},
  bgImageStyle = {},
}) => {
  const [translateY] = useState(new Animated.Value(0));
  const { onLayout, ...layout } = useLayout();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setTimeout(() => {
          onPress();
        }, 0);
      }}
      onPressIn={() => {
        Animated.timing(translateY, {
          toValue: -12,
          duration: 550,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 100,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }}>
      <Animated.View style={[bgImageStyle, { transform: [{ translateY }] }]}>
        <BackgroundImage
          onLayout={onLayout}
          imageStyle={{
            right: 0,
            bottom: 0,
            // left: 90,
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
          resizeMode={'stretch'}
          imageSource={CardPatternSmallImg}
          // startColor={startColors[type] || startColors[type2] || startColors.UNKNOWN}
          startColor={startColors[type] || startColors.UNKNOWN}
          // endColor={endColors[type] || endColors[type2] || endColors.UNKNOWN}>
          endColor={endColors[type] || endColors.UNKNOWN}>
          <IconSvgXml xmlkey={type} width={'40'} height={'40'} />
          <View style={{ flexDirection: 'column', flex: 1 }}>
            <Text
              numberOfLines={1}
              style={[
                Styles.cardTitle,
                Theme.fonts.default.heavy,
                { flexShrink: 1, maxWidth: layout.width * 0.8, marginLeft: 15 },
              ]}>
              {title}
            </Text>
            <View style={[styles.cardTitleHorizontal]}>
              {subTitle ? subTitle : <View />}
              <Text
                numberOfLines={1}
                style={[
                  Styles.cardTitle,
                  Theme.fonts.default.heavy,
                  { flexShrink: 1, maxWidth: layout.width * 0.5 },
                ]}>
                {hideString(amount, hide)}
              </Text>
            </View>
            <View style={[styles.cardTitleHorizontal]}>
              <Text
                numberOfLines={1}
                ellipsizeMode={'middle'}
                style={[
                  Styles.cardDesc,
                  {
                    marginLeft: 0,
                    flexShrink: 1,
                    maxWidth: layout.width * 0.5,
                  },
                  Theme.fonts.default.heavy,
                ]}>
                {desc}
              </Text>
              {amount2 && amount2(layout.width * 0.5)}
            </View>
          </View>
        </BackgroundImage>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scroll: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingBottom: 24,
    // borderWidth: 1, borderColor: 'red',
  },
  cardTitleHorizontal: {
    flexDirection: 'row',
    paddingLeft: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleVertical: {
    flexDirection: 'column',
    paddingLeft: 15,
    justifyContent: 'center',
    // backgroundColor: 'red',
    // alignItems: 'center',
  },
  root: {
    flex: 1,
    margin: 16,
  },
  container: {
    flex: 1,
  },
  cardRightContainer: {
    alignItems: 'flex-end',
    flex: 1,
  },
});

export default CardItem;
