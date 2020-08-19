import I18n from 'react-native-i18n';
import en from './en';
import zhTW from './zh-tw';
import zhCN from './zh-cn';
import ko from './ko';
import ja from './ja';

I18n.fallbacks = true;

I18n.translations = {
  en,
  'zh-TW': zhTW,
  'zh-Hant-TW': zhTW,
  'zh-CN': zhCN,
  'zh-Hans-CN': zhCN,
  'ko': ko,
  'ja': ja,
};

export default I18n;
