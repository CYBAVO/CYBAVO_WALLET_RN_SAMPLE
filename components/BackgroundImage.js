import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
const BackgroundImage: () => React$Node = ({
  children,
  imageSource,
  startColor,
  endColor,
  containerStyle = {},
  imageStyle = {},
  onLayout,
}) => {
  return (
    <LinearGradient
      onLayout={onLayout}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, containerStyle]}
      colors={[startColor, endColor]}>
      <Image style={imageStyle} source={imageSource} />
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingBottom: 0,
    paddingLeft: 24,
    paddingRight: 24,
  },
});

export default BackgroundImage;
