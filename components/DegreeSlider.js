import React, { Component, useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import moment from 'moment';
import Slider from '@react-native-community/slider';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import { withTheme, Text } from 'react-native-paper';
import I18n from '../i18n/i18n';
import { getFeeDescI18n } from '../Helpers';

const DegreeSlider: () => React$Node = ({
  theme,
  keys = ['low', 'medium', 'high'],
  // labels = ['Slow', 'Medium', 'Fast'],
  valueObj = {
    low: { amount: 0.002, description: '<5m' },
    medium: { amount: 0.005, description: '<3m' },
    high: { amount: 0.007, description: '<1m' },
  },
  getDesc = (item = {}) => getFeeDescI18n(item.description),
  getValue = (item = {}) => item.amount,
  getLabel = (key = {}) => {
    switch (key) {
      case 'low':
        return I18n.t('slow');
      case 'high':
        return I18n.t('fast');
      default:
        return I18n.t(key);
    }
  },
  onSlidingComplete = value => {},
  style = {},
  outerWidth = '100%',
  innerWidth = '100%',
  errorMsg,
  hasAlert = key => false,
  reserveErrorMsg = false,
  initValue = keys.length - 1,
  callbackForInit = false,
}) => {
  const [value, setValue] = useState(initValue);
  const [uiValue, setUiValue] = useState(initValue);
  const amount = getValue(valueObj[keys[value]]) || '';
  const description = getDesc(valueObj[keys[value]]) || '';
  const _checkAndSetValue = v => {
    if (valueObj[keys[v]].lessThenMin) {
      return;
    }
    setValue(v);
  };
  const _onValueChange = x => {
    setUiValue(x);
    let floor = Math.floor(x);
    let ceil = Math.ceil(x);
    if (Math.abs(x - floor) < Math.abs(x - ceil)) {
      setValue(floor);
    } else {
      setValue(ceil);
    }
  };
  useEffect(() => {
    if (callbackForInit) {
      onSlidingComplete(keys[initValue]);
    }
  }, [initValue]);
  return (
    <View style={[{ width: '100%', alignItems: 'center' }, style]}>
      <View
        style={[
          description.length > 10 ? styles.longDescContainer : styles.container,
          { width: outerWidth },
        ]}>
        <Text style={[Styles.secContent, Theme.fonts.default.regular]}>
          {amount}
        </Text>
        <Text style={[Styles.secContent, Theme.fonts.default.regular]}>
          {description}
        </Text>
      </View>
      {reserveErrorMsg && (
        <Text
          style={[Styles.inputError, { width: '100%', alignSelf: 'center' }]}>
          {errorMsg || ''}
        </Text>
      )}
      <Slider
        style={{ width: innerWidth, height: 50 }}
        // step={valueSlider}
        value={uiValue}
        minimumValue={0}
        maximumValue={keys.length - 1}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor="rgba(255,255,255,0.2)"
        onValueChange={_onValueChange}
        thumbTintColor={'white'}
        onSlidingComplete={x => {
          onSlidingComplete(keys[value]);
          setUiValue(value);
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: outerWidth,
        }}>
        {keys.map((item, i) => (
          <View style={{ flexDirection: 'row' }}>
            <Text
              key={item}
              style={[
                i == value ? Styles.secContent : Styles.secContentFade,
                Theme.fonts.default.regular,
              ]}>
              {getLabel(item)}
            </Text>
            {hasAlert(item) && (
              <Image
                style={{ marginLeft: 4, tintColor: theme.colors.error }}
                source={require('../assets/image/ic_Info.png')}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    alignItems: 'flex-end',
    marginTop: 5,
    width: '96%',
  },
  longDescContainer: {
    paddingBottom: 10,
    minHeight: 50,
    marginTop: 20,
    width: '96%',
  },
});
export default withTheme(DegreeSlider);
