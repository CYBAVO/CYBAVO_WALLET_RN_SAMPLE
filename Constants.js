import {
  ACCELERATE_FAILED,
  ACCELERATED,
  ACCELERATING,
  CANCEL_FAILED,
  CANCELLED,
  CANCELLING,
} from './store/reducers/transactions';
import { Theme } from './styles/MainTheme';
import {
  TYPE_ACCELERATE,
  TYPE_CANCEL,
} from './components/ReplaceTransactionModal';

export const BADGE_FONT_SIZE = 13;
export const ROUND_BUTTON_FONT_SIZE = 16;
export const ROUND_BUTTON_HEIGHT = 44;
export const ROUND_BUTTON_MEDIUM_HEIGHT = 52;
export const ROUND_BUTTON_LARGE_HEIGHT = 56;
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
export const SERVICE_EMAIL = 'service@cybavo.com';

export const CANCEL_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24">\n' +
  '    <path fill="#FFF" d="M16.5 10c3.59 0 6.5 2.91 6.5 6.5S20.09 23 16.5 23 10 20.09 10 16.5s2.91-6.5 6.5-6.5zm0 2c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5c2.414 0 4.384-1.902 4.495-4.288L21 16.5l-.005-.212C20.885 13.902 18.914 12 16.5 12zm1.423-11c1.08 0 1.99.8 2.071 1.849L20 3v4.5c0 .552-.448 1-1 1-.513 0-.936-.386-.993-.883L18 7.5V3l-.004.007-.036-.005L17.923 3H6.077l-.037.002-.036.005L6 3v15l.004-.007.073.007H8.23c.552 0 1 .448 1 1 0 .513-.386.936-.884.993L8.231 20H6.077c-1.08 0-1.99-.8-2.071-1.849L4 18V3c0-1.07.862-1.92 1.924-1.995L6.077 1h11.846zm1.052 13.025c.363.363.388.935.078 1.327l-.078.087-1.061 1.061 1.06 1.06c.391.391.391 1.024 0 1.415-.362.363-.934.388-1.326.078l-.087-.078-1.061-1.061-1.06 1.06c-.391.391-1.024.391-1.415 0-.363-.362-.388-.934-.078-1.326l.078-.087 1.061-1.061-1.06-1.06c-.391-.391-.391-1.024 0-1.415.362-.363.934-.388 1.326-.078l.087.078 1.061 1.061 1.06-1.06c.391-.391 1.024-.391 1.415 0zM12 8c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L12 10H9c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L9 8h3zm3.083-3c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L15.083 7H9c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L9 5h6.083z"/>\n' +
  '</svg>';
export const ACCELERATE_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24">\n' +
  '    <path fill="#FFF" d="M20.577 2c.499 0 .966.258 1.223.686.268.445.266.998-.005 1.443l-2.92 4.767h1.702c.508 0 .98.267 1.233.702l.064.123c.24.523.131 1.136-.269 1.548L11.61 21.568c-.272.28-.645.432-1.028.432-.262 0-.521-.07-.747-.21-.595-.36-.84-1.1-.562-1.743l2.972-6.883-1.822.001c-.42 0-.82-.183-1.09-.5l-.094-.125c-.276-.408-.316-.93-.104-1.374l3.975-8.359c.236-.497.741-.807 1.288-.807zm-1.049 2h-4.771l-3.407 7.164 2.417.001c.68 0 1.149.657.958 1.286l-.04.11-2.31 5.346 6.804-7.011h-2.088c-.742 0-1.212-.772-.908-1.421l.055-.101L19.528 4zM6 11c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L6 13H4c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L4 11h2zm2-4c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L8 9H2c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L2 7h6zm2-4c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L10 5H6c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L6 3h4z"/>\n' +
  '</svg>';
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
};
export const TX_EXPLORER_URIS = {
  main: {
    [`${Coin.BTC}#`]: 'https://blockexplorer.com/tx/%s', // BTC
    [`${Coin.BTC}#31`]: 'https://omniexplorer.info/tx/%s', // USDT-Omni
    [`${Coin.LTC}#`]: 'https://live.blockcypher.com/ltc/tx/%s', // LTC
    [`${Coin.ETH}#`]: 'https://etherscan.io/tx/%s', // ETH
    [`${Coin.XRP}#`]: 'https://xrpcharts.ripple.com/#/transactions/%s', // XRP
    [`${Coin.BCH}#`]: 'https://explorer.bitcoin.com/bch/tx/%s', // BCH
    [`${Coin.EOS}#`]: 'https://eosflare.io/tx/%s', // EOS
    [`${Coin.TRX}#`]: 'https://tronscan.org/#/transaction/%s', // TRX
  },
  test: {
    [`${Coin.BTC}#`]: 'https://blockexplorer.com/tx/%s', // BTC
    [`${Coin.BTC}#31`]: 'https://omniexplorer.info/tx/%s', // USDT-Omni
    [`${Coin.LTC}#`]: 'https://live.blockcypher.com/ltc/tx/%s', // LTC
    [`${Coin.ETH}#`]: 'https://ropsten.etherscan.io/tx/%s', // ETH ropsten
    [`${Coin.XRP}#`]: 'https://xrpcharts.ripple.com/#/transactions/%s', // XRP
    [`${Coin.BCH}#`]: 'https://explorer.bitcoin.com/bch/tx/%s', // BCH
    [`${Coin.EOS}#`]: 'https://eosflare.io/tx/%s', // EOS
    [`${Coin.TRX}#`]: 'https://tronscan.org/#/transaction/%s', // TRX
  },
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

export const Api = {
  sendRawTx: 'eth_sendRawTransaction',
  cancelTx: 'eth_cancelTransaction',
  signTx: 'eth_signTransaction',
  sign: 'eth_sign',
  signTyped: 'eth_signTypedData',
};

export const replaceConfig = {
  [CANCEL_FAILED]: { color: '#ff8c00', i18n: 'cancel_failed' },
  [CANCELLED]: { color: Theme.colors.error, i18n: 'cancelled' },
  [CANCELLING]: { color: Theme.colors.error, i18n: 'cancelling' },
  [ACCELERATING]: { color: Theme.colors.success, i18n: 'accelerating' },
  [ACCELERATED]: { color: Theme.colors.success, i18n: 'accelerated' },
  [ACCELERATE_FAILED]: { color: '#ff8c00', i18n: 'accelerate_failed' },
};
export const noHigherFeeKeys = {
  [TYPE_CANCEL]: 'no_higher_fee_for_cancel_desc',
  [TYPE_ACCELERATE]: 'no_higher_fee_for_accelerate_desc',
};
