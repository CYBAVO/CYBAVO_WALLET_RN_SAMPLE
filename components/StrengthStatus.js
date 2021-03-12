import { StyleSheet, Dimensions, Animated, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import I18n from '../i18n/i18n';
import { Text, withTheme } from 'react-native-paper';
const StrengthStatus: () => React$Node = ({
  theme,
  widthParam,
  level = -1,
}) => {
  const strengthLevels = {
    '-1': {
      label: I18n.t('strength_level_very_week'),
      labelColor: '#FFF',
      widthPercent: 20,
      innerBarColor: theme.colors.buttonBroader,
      degree: -1,
    },
    '0': {
      label: I18n.t('strength_level_very_week'),
      labelColor: '#FFF',
      widthPercent: 20,
      innerBarColor: '#E82047',
      degree: 0,
    },
    '1': {
      label: I18n.t('strength_level_week'),
      labelColor: '#FFF',
      widthPercent: 40,
      innerBarColor: '#E82047',
      degree: 2,
    },
    '2': {
      label: I18n.t('strength_level_fair'),
      labelColor: '#FFF',
      widthPercent: 60,
      innerBarColor: '#feb466',
      degree: 4,
    },
    '3': {
      label: I18n.t('strength_level_good'),
      labelColor: '#FFF',
      widthPercent: 80,
      innerBarColor: '#feb466',
      degree: 6,
    },
    '4': {
      label: I18n.t('strength_level_strong'),
      labelColor: '#FFF',
      widthPercent: 100,
      innerBarColor: '#31b404',
      degree: 7,
    },
  };
  const getLevelColor = (fillLevel, currentLevel) => {
    return currentLevel >= fillLevel
      ? strengthLevels[currentLevel].innerBarColor
      : theme.colors.buttonBroader;
  };
  let w = (widthParam - 64) / 8;
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 26,
        marginBottom: 10,
        flexDirection: 'row',
        width: widthParam + 32,
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          marginRight: 32,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: widthParam - 32,
        }}>
        <View
          style={{
            width: w,
            marginRight: 4,
            height: 4,
            backgroundColor: getLevelColor(0, level),
          }}
        />
        <View
          style={{
            width: w,
            marginRight: 4,
            height: 4,
            backgroundColor: getLevelColor(1, level),
          }}
        />
        <View
          style={{
            width: w,
            marginRight: 4,
            height: 4,
            backgroundColor: getLevelColor(1, level),
          }}
        />
        <View
          style={{
            width: w,
            marginRight: 4,
            height: 4,
            backgroundColor: getLevelColor(2, level),
          }}
        />
        <View
          style={{
            width: w,
            marginRight: 4,
            height: 4,
            backgroundColor: getLevelColor(2, level),
          }}
        />
        <View
          style={{
            width: w,
            marginRight: 4,
            height: 4,
            backgroundColor: getLevelColor(3, level),
          }}
        />
        <View
          style={{
            width: w,
            marginRight: 4,
            height: 4,
            backgroundColor: getLevelColor(3, level),
          }}
        />
        <View
          style={{
            width: w,
            marginRight: 4,
            height: 4,
            backgroundColor: getLevelColor(4, level),
          }}
        />
      </View>

      <Text
        style={[
          styles.strengthDescription,
          { color: strengthLevels[level].labelColor },
        ]}>
        {strengthLevels[level].label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordStrengthWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  passwordStrengthBar: {
    height: 10,
    position: 'relative',
    top: 5,
    bottom: 5,
    borderRadius: 5,
  },
  innerPasswordStrengthBar: {
    height: 10,
    borderRadius: 5,
    width: 0,
  },
  strengthDescription: {
    color: '#fff',
    backgroundColor: 'transparent',
    textAlign: 'left',
    right: 16,
  },
});
export default withTheme(StrengthStatus);
