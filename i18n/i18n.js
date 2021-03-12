import I18n from 'react-native-i18n';
import en from './en';
import zhTW from './zh-tw';
import zhCN from './zh-cn';
import ko from './ko';
import ja from './ja';
import AsyncStorage from '@react-native-community/async-storage';
import * as RNLocalize from "react-native-localize";

I18n.fallbacks = true;

I18n.translations = {
  en,
  'en-US': en,
  'zh-TW': zhTW,
  'zh-Hant-TW': zhTW,
  'zh-CN': zhCN,
  'zh-Hans-CN': zhCN,
  ko: ko,
  ja: ja,
};
export const LanguageIndexMap = {
  en: 0,
  'en-US': 0,
  'zh-TW': 1,
  'zh-Hant-TW': 1,
  'zh-CN': 2,
  'zh-Hans-CN': 2,
  ko: 3,
  ja: 4,
};

export function setLanguage(value) {
  AsyncStorage.setItem('language', value)
    .then(() => {})
    .catch(error => {});
  I18n.locale = value;
}

export function getLanguage() {
  return AsyncStorage.getItem('language');
}

export const Country = RNLocalize.getCountry();
export const IndexLanguageMap = {
  0: 'en',
  1: 'zh-Hant-TW',
  2: 'zh-CN',
  3: 'ko',
  4: 'ja',
};
export default I18n;
