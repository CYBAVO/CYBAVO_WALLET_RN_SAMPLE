import React, { useRef } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { withTheme, Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../styles/MainTheme';
import { Button } from 'native-base';
import { Dimensions } from 'react-native';
import { HEADER_BAR_IMAGE_HEIGHT, HEADER_BAR_PADDING } from '../Constants';
const { width, height } = Dimensions.get('window');

const Headerbar: () => React$Node = ({
  style,
  theme,
  transparent,
  title = '',
  onBack,
  actions,
  Parent = SafeAreaView, // 'View' for Modal, 'SafeAreaView' for Screen
  ParentIos,
  numberOfLines = 1,
  backIcon = require('../assets/image/ic_back.png'),
  titleColor,
  height = 56,
}) => {
  let ParentView = Platform.OS == 'ios' ? ParentIos || SafeAreaView : Parent;
  return (
    <ParentView
      style={[
        { width: width },
        transparent ? null : { backgroundColor: theme.colors.background },
        style,
      ]}>
      <View style={[styles.headerBar, { height: height }]}>
        <View
          style={{
            height: height,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: width,
            position: 'absolute',
            left: 0,
          }}>
          <Text
            numberOfLines={numberOfLines}
            style={[
              styles.title,
              Theme.fonts.default.heavy,
              { maxWidth: width * 0.7, color: titleColor || theme.colors.text },
            ]}>
            {title}
          </Text>
        </View>

        {onBack ? (
          <IconButton
            borderless
            // accessibilityLabel={clearAccessibilityLabel}
            // color={'rgba(255, 255, 255, 0.56)'}
            // rippleColor={rippleColor}
            onPress={onBack}
            icon={({ size, color }) => (
              <Image source={backIcon} style={{ width: 24, height: 24 }} />
            )}
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
          />
        ) : (
          <View />
        )}
        {!!actions && <View style={styles.actionsContainer}>{actions}</View>}
      </View>
    </ParentView>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    elevation: 0,
    shadowColor: 0,
    paddingHorizontal: 4,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    paddingHorizontal: 16,
    textAlign: 'center',
    // flex: 1,
  },
  actionsContainer: {},
});

export default withTheme(Headerbar);
