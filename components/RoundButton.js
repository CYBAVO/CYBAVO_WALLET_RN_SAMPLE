import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Text, Button } from 'native-base';
const RoundButton: () => React$Node = ({
  iconSrc,
  containerStyle = {},
  text = '',
  textStyle = {},
  onPress = () => {},
}) => {
  return (
    <Button
      rounded
      style={[styles.containerStyle, containerStyle]}
      onPress={() => {
        onPress();
      }}>
      {iconSrc && (
        <Image
          source={iconSrc}
          resizeMode="stretch"
          style={{
            alignSelf: 'center',
            width: 26,
            height: 26,
          }}
        />
      )}
      <Text uppercase={false} style={[styles.text, textStyle]}>
        {text}
      </Text>
    </Button>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    textAlign: 'center',
  },
});

export default RoundButton;
