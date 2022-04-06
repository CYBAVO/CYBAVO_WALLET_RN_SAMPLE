import React, { Component, useEffect, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import moment from 'moment';
import Slider from '@react-native-community/slider';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import { withTheme, Text, Surface } from 'react-native-paper';
import I18n from '../i18n/i18n';
import { getFeeDescI18n, getTopRightMarkerSvg } from '../Helpers';
import { SvgXml } from 'react-native-svg';

const DegreeSelector: () => React$Node = ({
  theme,
  keys = ['high', 'medium', 'low'],
  onSelect,
  style = {},
  valueObj = {
    low: { amount: 0.002, description: '<5m' },
    medium: { amount: 0.005, description: '<3m' },
    high: { amount: 0.007, description: '<1m' },
  },
  getDesc = (item = {}) => getFeeDescI18n(item.description),
  getValue = (item = {}) => item.amount,
  getErrMsg = (item = {}) =>
    item.lessThenMin
      ? `${I18n.t('error_replace_gas_too_little')}: ${valueObj.min}`
      : '',
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

  errorMsg,
  hasAlert = key => false,
  reserveErrorMsg = valueObj.low && valueObj.low.lessThenMin,
  initValue = 0,
  callbackForInit = false,
  line3 = true,
}) => {
  const [value, setValue] = useState(initValue);
  useEffect(() => {
    if (callbackForInit) {
      onSelect(keys[initValue]);
    }
  }, [initValue]);
  return (
    <View style={[{ flexDirection: 'column' }, style]}>
      {keys.map((item, i) => (
        <View style={{ flex: 1 }}>
          <Surface
            style={[
              Styles.shadowSurface,
              {
                flex: 1,
                marginRight: i < keys.length - 1 ? 8 : 0,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: reserveErrorMsg ? 0 : 8,
                elevation: 3,
                opacity: getErrMsg(valueObj[item]) != '' ? 0.5 : 1,
              },
              i == value
                ? { borderWidth: 1, borderColor: theme.colors.primary }
                : {},
            ]}
            key={item}>
            {i == value && (
              <SvgXml
                xml={getTopRightMarkerSvg()}
                style={{ position: 'absolute', right: 0 }}
              />
            )}
            <TouchableWithoutFeedback
              onPress={() => {
                setValue(i);
                onSelect(item);
              }}
              disabled={getErrMsg(valueObj[item])}>
              <View style={{ justifyContent: 'space-between' }}>
                <Text
                  style={[
                    { fontSize: 14, color: theme.colors.text },
                    Theme.fonts.default.heavyMax,
                  ]}>
                  {getLabel(item)}
                </Text>
                <Text style={[{ fontSize: 14, color: theme.colors.text }]}>
                  {getValue(valueObj[item]) || ''}
                </Text>
                {line3 && (
                  <Text
                    style={[
                      { fontSize: 14, color: theme.colors.battleshipGrey },
                    ]}>
                    {getDesc(valueObj[item]) || ''}
                  </Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </Surface>
          {reserveErrorMsg && (
            <Text
              style={[
                Styles.inputError,
                {
                  width: '100%',
                  alignSelf: 'center',
                  marginTop: 4,
                  marginBottom: 12,
                },
              ]}>
              {getErrMsg(valueObj[item]) || ''}
            </Text>
          )}
        </View>
      ))}
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
export default withTheme(DegreeSelector);
