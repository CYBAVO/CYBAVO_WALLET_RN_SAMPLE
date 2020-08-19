export const BADGE_FONT_SIZE = 13;
export const ROUND_BUTTON_FONT_SIZE = 16;
export const ROUND_BUTTON_HEIGHT = 44;
export const ROUND_BUTTON_ICON_SIZE = 24;
export const PIN_CODE_LENGTH = 6;
export const RECOVERY_CODE_LENGTH = 8;
export const SMALL_ICON_SIMPLE_SIZE = '24';
export const LIST_ICON_SIMPLE_SIZE = 30;
export const INPUT_MODE = 'input';
export const CHANGE_MODE = 'change';
export const RECOVER_CODE_MODE = 'recover_code';
export const HEADER_BAR_IMAGE_HEIGHT = 40;
export const HEADER_BAR_PADDING = 16;
export const FULL_WIDTH_WITH_PADDING = '92%';

export const Coin = {
  BTC: 0,
  LTC: 2,
  ETH: 60,
  XRP: 144,
  BCH: 145,
  EOS: 194,
  TRX: 195,
};
export const Status = {
  LOADING: 0,
  SUCCESS: 1,
  FAIL: -1,
}
export const TX_EXPLORER_URIS = {
  [`${Coin.BTC}#`]: 'https://blockexplorer.com/tx/%s', // BTC
  [`${Coin.BTC}#31`]: 'https://omniexplorer.info/tx/%s', // USDT-Omni
  [`${Coin.LTC}#`]: 'https://live.blockcypher.com/ltc/tx/%s', // LTC
  [`${Coin.ETH}#`]: 'https://etherscan.io/tx/%s', // ETH
  [`${Coin.XRP}#`]: 'https://xrpcharts.ripple.com/#/transactions/%s', // XRP
  [`${Coin.BCH}#`]: 'https://explorer.bitcoin.com/bch/tx/%s', // BCH
  [`${Coin.EOS}#`]: 'https://eosflare.io/tx/%s', // EOS
  [`${Coin.TRX}#`]: 'https://tronscan.org/#/transaction/%s', // TRX
};

//need's to increase left space, because it's easy to trigger iOS's back gesture
export const sliderOuterWidth = {
  ios: '96%',
  android: '100%',
};
export const sliderInnerWidth = {
  ios: '92%',
  android: '100%',
};

export const isFungibleToken = currencyItem => {
  return currencyItem && currencyItem.tokenVersion == 721;
};
export const CHECK_ICON = require('./assets/image/ic_check.png');
export const UNKNOWN_CURRENCY_FILL_ICON = require('./assets/image/ic_currency_unknow_fill.png');
export const UNKNOWN_CURRENCY_ICON = require('./assets/image/ic_currency_unknow.png');
export const CLEAR_ICON = require('./assets/image/ic_input_clear.png');
export const SCAN_ICON = require('./assets/image/ic_scan.png');
