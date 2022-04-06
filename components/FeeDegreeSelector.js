import React, { Component, useEffect, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import { withTheme, Text, Surface, TextInput } from 'react-native-paper';
import I18n from '../i18n/i18n';
import { getFeeDescI18n, getTopRightMarkerSvg, hasValue } from '../Helpers';
import { SvgXml } from 'react-native-svg';

const ICON_EDIT = require('../assets/image/ic_speed_edit.png');
const ICON_FAST = require('../assets/image/ic_speed_fast.png');
const ICON_MEDIUM = require('../assets/image/ic_speed_medium.png');
const ICON_SLOW = require('../assets/image/ic_speed_slow.png');
const FeeDegreeSelector: () => React$Node = ({
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
      case 'custom':
        return `${I18n.t('custom')} (Gwei)`;
      case 'low':
        return I18n.t('slow');
      case 'high':
        return I18n.t('fast');
      default:
        return I18n.t(key);
    }
  },
  getIcon = (key = {}) => {
    switch (key) {
      case 'custom':
        return ICON_EDIT;
      case 'low':
        return ICON_SLOW;
      case 'high':
        return ICON_FAST;
      default:
        return ICON_MEDIUM;
    }
  },
  errorMsg,
  hasAlert = key => false,
  reserveErrorMsg = valueObj.low && valueObj.low.lessThenMin,
  initValue = 0,
  callbackForInit = false,
  line3 = true,
  onInput,
  currentInput = '',
  currentInputCal = '',
  inputError = '',
  onBlur,
  showEditable,
}) => {
  const [value, setValue] = useState(initValue);
  const [inputHeight, setInputHeight] = useState(null);
  useEffect(() => {
    if (callbackForInit) {
      onSelect(keys[initValue]);
    }
  }, [initValue]);

  const _getNormalView = (item, i) => {
    return (
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
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={{ alignSelf: 'center', width: 48, height: 48 }}
                source={getIcon(item)}
                resizeMode={'contain'}
              />
              <View style={{ justifyContent: 'space-between', marginLeft: 16 }}>
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
    );
  };
  const _getEditView = (item, i) => {
    if (!showEditable) {
      return <View />;
    }
    return (
      <View style={{ flex: 1, marginBottom: 40 }}>
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
              minHeight: 110,
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
          <View style={{ flexDirection: 'row' }}>
            <Image
              style={{ alignSelf: 'center', width: 48, height: 48 }}
              source={getIcon(item)}
              resizeMode={'contain'}
            />
            <View
              style={{
                justifyContent: 'space-between',
                marginLeft: 16,
                flex: 1,
              }}>
              <Text
                style={[
                  { fontSize: 14, color: theme.colors.text },
                  Theme.fonts.default.heavyMax,
                ]}>
                {getLabel(item)}
              </Text>
              <TextInput
                onContentSizeChange={
                  e => setInputHeight(e.nativeEvent.contentSize.height) // make height normal when text exceed a line
                }
                style={[
                  Styles.input,
                  { flex: null, height: inputHeight, paddingVertical: 4 },
                ]}
                placeholder={I18n.t('gas_price_placeholder')}
                underlineColor={Theme.colors.normalUnderline}
                returnKeyType="done"
                multiline={false}
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                keyboardType={'numeric'}
                autoFocus={false}
                value={currentInput}
                maxLength={140}
                onFocus={() => {
                  setValue(i);
                  onSelect(item);
                }}
                onBlur={() => {
                  if (onBlur) {
                    onBlur();
                  }
                }}
                onChangeText={message => {
                  if (onInput) {
                    onInput(message);
                  }
                }}
              />
            </View>
          </View>

          {hasValue(currentInputCal) && (
            <Text
              numberOfLines={1}
              style={[
                Styles.convertedNumText,
                {
                  textAlign: 'left',
                  fontSize: 14,
                  marginTop: 4,
                  marginLeft: 64,
                },
              ]}>
              {currentInputCal}
            </Text>
          )}
          {hasValue(inputError) && (
            <Text
              numberOfLines={1}
              style={[
                Styles.inputError,
                {
                  fontSize: 14,
                  marginTop: 4,
                  marginLeft: 64,
                },
              ]}>
              {inputError}
            </Text>
          )}
        </Surface>
      </View>
    );
  };
  return (
    <View style={[{ flexDirection: 'column' }, style]}>
      {keys.map((item, i) =>
        valueObj[item] && valueObj[item].editable
          ? _getEditView(item, i)
          : _getNormalView(item, i)
      )}
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
export default withTheme(FeeDegreeSelector);
