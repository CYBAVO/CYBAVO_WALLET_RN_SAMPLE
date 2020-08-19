import React, { useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { useClipboard } from '@react-native-community/hooks';
import { Container, Toast } from 'native-base';
import { Theme } from '../styles/MainTheme';
import { Text } from 'react-native-paper';
import TopDownHint from './TopDownHint';
const CopyableText: () => React$Node = ({
  containerStyle = {},
  text = '',
  copiedHint,
  textStyle = {},
  onPress = () => {},
}) => {
  const icon = require('../assets/image/ic_copy.png');
  const [_, setClipboard] = useClipboard();
  const [hint, setHint] = useState(null);
  const _copy = async () => {
    setClipboard(text);
    setHint(copiedHint || 'Copy successfully');
  };
  return (
    <React.Fragment>
      <TouchableOpacity
        onPress={() => {
          _copy();
          onPress();
        }}
        activeOpacity={0.7}
        style={[styles.containerStyle, containerStyle]}>
        <Text
          style={[styles.text, textStyle]}
          numberOfLines={1}
          ellipsizeMode="middle">
          {text}
        </Text>
        <Image source={icon} style={styles.icon} />
      </TouchableOpacity>
      <TopDownHint
        title={hint}
        onDismiss={() => {
          setHint(null);
        }}
      />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: Theme.colors.pickerBgTransparent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  text: {
    textAlign: 'center',
    color: Theme.colors.text,
    // opacity: 0.8,
    marginRight: 10,
  },
  icon: {
    alignSelf: 'center',
    width: 20,
    height: 20,
  },
});

export default CopyableText;
