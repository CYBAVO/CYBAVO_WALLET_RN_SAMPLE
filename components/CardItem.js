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

const CardItem: () => React$Node = ({
  type = 'BTC',
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
          imageStyle={{
            right: 0,
            bottom: 0,
            // left: 90,
            overflow: 'hidden',
            width: '100%',
            height: '110%',
            position: 'absolute',
          }}
          imageSource={CardPatternSmallImg}
          startColor={startColors[type] || startColors.UNKNOWN}
          endColor={endColors[type] || endColors.UNKNOWN}>
          <IconSvgXml xmlkey={type} width={'40'} height={'40'} />
          <View style={{ flexDirection: 'column', height: '80%' }}>
            <View style={styles.cardTitleVertical}>
              <Text
                numberOfLines={1}
                style={[Styles.cardTitle, Theme.fonts.default.heavy]}>
                {title}
              </Text>
              {subTitle && subTitle}
            </View>
            <Text
              numberOfLines={1}
              style={[Styles.cardDesc, Theme.fonts.default.heavy]}>
              {desc}
            </Text>
          </View>
          <View
            style={styles.cardRightContainer}
          >
            <Text
              numberOfLines={1}
              style={[Styles.cardTitle, Theme.fonts.default.heavy]}>
              {hideString(amount, hide)}
            </Text>
            {amount2 && amount2}
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
  },
  cardTitleVertical: {
    flexDirection: 'column',
    paddingLeft: 15,
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
