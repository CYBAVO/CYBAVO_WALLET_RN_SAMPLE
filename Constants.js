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

export const INACTIVE_OPACITY = 0.2;
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
export const SET_MODE = 'set';
export const INPUT_MODE = 'input';
export const CHANGE_MODE = 'change';
export const RECOVER_CODE_MODE = 'recover_code';
export const HEADER_BAR_IMAGE_HEIGHT = 40;
export const HEADER_BAR_PADDING = 16;
export const FULL_WIDTH_WITH_PADDING = '92%';
export const SERVICE_EMAIL = 'service@cybavo.com';
export const LOCALES = ['English', '繁體中文', '简体中文'];
export const MIN_LEVEL = 1;
export const AUTH_TYPE_OLD = 0;
export const AUTH_TYPE_BIO = 1;
export const AUTH_TYPE_SMS = 2;

export const SMS_SETUP_PHONE_OTP = 0;
export const SMS_VERIFY_OTP = 1;
export const SMS_LOGIN_OTP = 2;
export const EMAIL_VERIFY_OTP = 3;
export const ALL_WALLET_ID = 0;

export const CBO_SEPARATOR = '#CBO#'; //address#CBO#chainId#CBO#walletconnectUri, address/chainId: return to DAPP

export const CANCEL_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24">\n' +
  '    <path fill="#FFF" d="M16.5 10c3.59 0 6.5 2.91 6.5 6.5S20.09 23 16.5 23 10 20.09 10 16.5s2.91-6.5 6.5-6.5zm0 2c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5c2.414 0 4.384-1.902 4.495-4.288L21 16.5l-.005-.212C20.885 13.902 18.914 12 16.5 12zm1.423-11c1.08 0 1.99.8 2.071 1.849L20 3v4.5c0 .552-.448 1-1 1-.513 0-.936-.386-.993-.883L18 7.5V3l-.004.007-.036-.005L17.923 3H6.077l-.037.002-.036.005L6 3v15l.004-.007.073.007H8.23c.552 0 1 .448 1 1 0 .513-.386.936-.884.993L8.231 20H6.077c-1.08 0-1.99-.8-2.071-1.849L4 18V3c0-1.07.862-1.92 1.924-1.995L6.077 1h11.846zm1.052 13.025c.363.363.388.935.078 1.327l-.078.087-1.061 1.061 1.06 1.06c.391.391.391 1.024 0 1.415-.362.363-.934.388-1.326.078l-.087-.078-1.061-1.061-1.06 1.06c-.391.391-1.024.391-1.415 0-.363-.362-.388-.934-.078-1.326l.078-.087 1.061-1.061-1.06-1.06c-.391-.391-.391-1.024 0-1.415.362-.363.934-.388 1.326-.078l.087.078 1.061 1.061 1.06-1.06c.391-.391 1.024-.391 1.415 0zM12 8c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L12 10H9c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L9 8h3zm3.083-3c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L15.083 7H9c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L9 5h6.083z"/>\n' +
  '</svg>';
export const ACCELERATE_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24">\n' +
  '    <path fill="#FFF" d="M20.577 2c.499 0 .966.258 1.223.686.268.445.266.998-.005 1.443l-2.92 4.767h1.702c.508 0 .98.267 1.233.702l.064.123c.24.523.131 1.136-.269 1.548L11.61 21.568c-.272.28-.645.432-1.028.432-.262 0-.521-.07-.747-.21-.595-.36-.84-1.1-.562-1.743l2.972-6.883-1.822.001c-.42 0-.82-.183-1.09-.5l-.094-.125c-.276-.408-.316-.93-.104-1.374l3.975-8.359c.236-.497.741-.807 1.288-.807zm-1.049 2h-4.771l-3.407 7.164 2.417.001c.68 0 1.149.657.958 1.286l-.04.11-2.31 5.346 6.804-7.011h-2.088c-.742 0-1.212-.772-.908-1.421l.055-.101L19.528 4zM6 11c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L6 13H4c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L4 11h2zm2-4c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L8 9H2c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L2 7h6zm2-4c.552 0 1 .448 1 1 0 .513-.386.936-.883.993L10 5H6c-.552 0-1-.448-1-1 0-.513.386-.936.883-.993L6 3h4z"/>\n' +
  '</svg>';
export const ADD_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n' +
  '    <g fill="none" fill-rule="evenodd">\n' +
  '        <g>\n' +
  '            <g>\n' +
  '                <g>\n' +
  '                    <path stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 16.5c0 3.037-2.463 5.5-5.5 5.5S11 19.537 11 16.5s2.463-5.5 5.5-5.5 5.5 2.463 5.5 5.5" transform="translate(-131 -2870) translate(86 2858) translate(45 12)"/>\n' +
  '                    <path stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.23 19H6.078C5.482 19 5 18.552 5 18V3c0-.552.482-1 1.077-1h11.846C18.518 2 19 2.448 19 3v4.5M15.083 6L9 6M12 9L9 9" transform="translate(-131 -2870) translate(86 2858) translate(45 12)"/>\n' +
  '                    <g stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">\n' +
  '                        <path d="M2.5 5L2.5 0" transform="translate(-131 -2870) translate(86 2858) translate(45 12) translate(14 14) rotate(90 2.5 2.5)"/>\n' +
  '                        <path d="M2.5 5L2.5 0" transform="translate(-131 -2870) translate(86 2858) translate(45 12) translate(14 14)"/>\n' +
  '                    </g>\n' +
  '                </g>\n' +
  '            </g>\n' +
  '        </g>\n' +
  '    </g>\n' +
  '</svg>\n';
export const Coin = {
  BTC: 0,
  LTC: 2,
  DOGE: 3,
  DASH: 5,
  ETH: 60,
  XRP: 144,
  BCH: 145,
  XLM: 148,
  EOS: 194,
  TRX: 195,
  BSV: 236,
  ALGO: 283,
  DOT: 354,
  KSM: 434,
  FIL: 461,
  FLOW: 539,
  BNB: 714,
  MATIC: 966,
  ADA: 1815,
  SOL: 501,
  HNS: 5353,
  AR: 472,
  XDAI: 700,
  TT: 1001,
  ONE: 1023,
  CELO: 52752,
  LBTC: 1776,
  KUB: 99999999986,
  KOVAN: 99999999987,
  AVAXC: 99999999988,
  PALM: 99999999989,
  FTM: 99999999990,
  OKT: 99999999991,
  OPTIMISM: 99999999992,
  ARBITRUM: 99999999993,
  HECO: 99999999994,
  CPSC: 99999999995,
  WND: 99999999996,
  BSC: 99999999997,
};
export const Status = {
  LOADING: 0,
  SUCCESS: 1,
  FAIL: -1,
};
export const NFT_EXPLORER_URIS = {
  main: {
    [`${Coin.ETH}`]: 'https://etherscan.io/token/%s1?a=%s2#inventory', // ETH
    [`${Coin.BSC}`]: 'https://bscscan.com/token/%s1?a=%s2', // BSC
    [`${Coin.ONE}`]: 'https://explorer.harmony.one/inventory/erc721/%s1/%s2', // ONE
  },
  test: {
    [`${Coin.ETH}`]: 'https://ropsten.etherscan.io/token/%s1?a=%s2#inventory', // ETH
    [`${Coin.BSC}`]: 'https://testnet.bscscan.com/token/%s1?a=%s2', // BSC
    [`${Coin.ONE}`]: 'https://explorer.testnet.harmony.one/inventory/erc721/%s1/%s2', // ONE
  },
};
export const nftIcons = [
  require('./assets/image/nft/nft0.png'),
  require('./assets/image/nft/nft1.png'),
  require('./assets/image/nft/nft2.png'),
  require('./assets/image/nft/nft3.png'),
  require('./assets/image/nft/nft4.png'),
  require('./assets/image/nft/nft5.png'),
  require('./assets/image/nft/nft6.png'),
  require('./assets/image/nft/nft7.png'),
  require('./assets/image/nft/nft8.png'),
  require('./assets/image/nft/nft9.png'),
];
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

export const chainI18n = {
  [`${Coin.ETH}`]: 'eth_desc', // ETH
  [`${Coin.BSC}`]: 'bsc_desc', // BSC
  [`${Coin.ONE}`]: 'one_desc', // ONE
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

export const CHECK_ICON = require('./assets/image/ic_check.png');
export const CLEAR_ICON = require('./assets/image/ic_input_clear.png');
export const SCAN_ICON = require('./assets/image/ic_scan.png');
export const EDIT_ICON = require('./assets/image/ic_edit2.png');
export const COOL_TIME = 60;

export const Api = {
  sendRawTx: 'eth_sendRawTransaction',
  cancelTx: 'eth_cancelTransaction',
  signTx: 'eth_signTransaction',
  sign: 'eth_sign',
  signTyped: 'eth_signTypedData',
};
export const ASK_USE_SMS_ERROR_CODE = [184, 185, -6];
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
export const COUNTRIES = {
  AC: { countryCode: 247, flag: require('./assets/image/flags/SH.png') }, // AC = SH
  AD: { countryCode: 376, flag: require('./assets/image/flags/AD.png') },
  AE: { countryCode: 971, flag: require('./assets/image/flags/AE.png') },
  AF: { countryCode: 93, flag: require('./assets/image/flags/AF.png') },
  AG: { countryCode: 1, flag: require('./assets/image/flags/AG.png') },
  AI: { countryCode: 1, flag: require('./assets/image/flags/AI.png') },
  AL: { countryCode: 355, flag: require('./assets/image/flags/AL.png') },
  AM: { countryCode: 374, flag: require('./assets/image/flags/AM.png') },
  AO: { countryCode: 244, flag: require('./assets/image/flags/AO.png') },
  AR: { countryCode: 54, flag: require('./assets/image/flags/AR.png') },
  AS: { countryCode: 1, flag: require('./assets/image/flags/AS.png') },
  AT: { countryCode: 43, flag: require('./assets/image/flags/AT.png') },
  AU: { countryCode: 61, flag: require('./assets/image/flags/AU.png') },
  AW: { countryCode: 297, flag: require('./assets/image/flags/AW.png') },
  AX: { countryCode: 358, flag: require('./assets/image/flags/AX.png') },
  AZ: { countryCode: 994, flag: require('./assets/image/flags/AZ.png') },
  BA: { countryCode: 387, flag: require('./assets/image/flags/BA.png') },
  BB: { countryCode: 1, flag: require('./assets/image/flags/BB.png') },
  BD: { countryCode: 880, flag: require('./assets/image/flags/BD.png') },
  BE: { countryCode: 32, flag: require('./assets/image/flags/BE.png') },
  BF: { countryCode: 226, flag: require('./assets/image/flags/BF.png') },
  BG: { countryCode: 359, flag: require('./assets/image/flags/BG.png') },
  BH: { countryCode: 973, flag: require('./assets/image/flags/BH.png') },
  BI: { countryCode: 257, flag: require('./assets/image/flags/BI.png') },
  BJ: { countryCode: 229, flag: require('./assets/image/flags/BJ.png') },
  BL: { countryCode: 590, flag: require('./assets/image/flags/BL.png') },
  BM: { countryCode: 1, flag: require('./assets/image/flags/BM.png') },
  BN: { countryCode: 673, flag: require('./assets/image/flags/BN.png') },
  BO: { countryCode: 591, flag: require('./assets/image/flags/BO.png') },
  BQ: { countryCode: 599, flag: require('./assets/image/flags/NL.png') }, // BQ = NL
  BR: { countryCode: 55, flag: require('./assets/image/flags/BR.png') },
  BS: { countryCode: 1, flag: require('./assets/image/flags/BS.png') },
  BT: { countryCode: 975, flag: require('./assets/image/flags/BT.png') },
  BW: { countryCode: 267, flag: require('./assets/image/flags/BW.png') },
  BY: { countryCode: 375, flag: require('./assets/image/flags/BY.png') },
  BZ: { countryCode: 501, flag: require('./assets/image/flags/BZ.png') },
  CA: { countryCode: 1, flag: require('./assets/image/flags/CA.png') },
  CC: { countryCode: 61, flag: require('./assets/image/flags/CC.png') },
  CD: { countryCode: 243, flag: require('./assets/image/flags/CD.png') },
  CF: { countryCode: 236, flag: require('./assets/image/flags/CF.png') },
  CG: { countryCode: 242, flag: require('./assets/image/flags/CG.png') },
  CH: { countryCode: 41, flag: require('./assets/image/flags/CH.png') },
  CI: { countryCode: 225, flag: require('./assets/image/flags/CI.png') },
  CK: { countryCode: 682, flag: require('./assets/image/flags/CK.png') },
  CL: { countryCode: 56, flag: require('./assets/image/flags/CL.png') },
  CM: { countryCode: 237, flag: require('./assets/image/flags/CM.png') },
  CN: { countryCode: 86, flag: require('./assets/image/flags/CN.png') },
  CO: { countryCode: 57, flag: require('./assets/image/flags/CO.png') },
  CR: { countryCode: 506, flag: require('./assets/image/flags/CR.png') },
  CU: { countryCode: 53, flag: require('./assets/image/flags/CU.png') },
  CV: { countryCode: 238, flag: require('./assets/image/flags/CV.png') },
  CW: { countryCode: 599, flag: require('./assets/image/flags/CW.png') },
  CX: { countryCode: 61, flag: require('./assets/image/flags/CX.png') },
  CY: { countryCode: 357, flag: require('./assets/image/flags/CY.png') },
  CZ: { countryCode: 420, flag: require('./assets/image/flags/CZ.png') },
  DE: { countryCode: 49, flag: require('./assets/image/flags/DE.png') },
  DJ: { countryCode: 253, flag: require('./assets/image/flags/DJ.png') },
  DK: { countryCode: 45, flag: require('./assets/image/flags/DK.png') },
  DM: { countryCode: 1, flag: require('./assets/image/flags/DM.png') },
  DO: { countryCode: 1, flag: require('./assets/image/flags/DO.png') },
  DZ: { countryCode: 213, flag: require('./assets/image/flags/DZ.png') },
  EC: { countryCode: 593, flag: require('./assets/image/flags/EC.png') },
  EE: { countryCode: 372, flag: require('./assets/image/flags/EE.png') },
  EG: { countryCode: 20, flag: require('./assets/image/flags/EG.png') },
  EH: { countryCode: 212, flag: require('./assets/image/flags/MC.png') }, // EH = MC
  ER: { countryCode: 291, flag: require('./assets/image/flags/ER.png') },
  ES: { countryCode: 34, flag: require('./assets/image/flags/ES.png') },
  ET: { countryCode: 251, flag: require('./assets/image/flags/ET.png') },
  FI: { countryCode: 358, flag: require('./assets/image/flags/FI.png') },
  FJ: { countryCode: 679, flag: require('./assets/image/flags/FJ.png') },
  FK: { countryCode: 500, flag: require('./assets/image/flags/FK.png') },
  FM: { countryCode: 691, flag: require('./assets/image/flags/FM.png') },
  FO: { countryCode: 298, flag: require('./assets/image/flags/FO.png') },
  FR: { countryCode: 33, flag: require('./assets/image/flags/FR.png') },
  GA: { countryCode: 241, flag: require('./assets/image/flags/GA.png') },
  GB: { countryCode: 44, flag: require('./assets/image/flags/GB.png') },
  GD: { countryCode: 1, flag: require('./assets/image/flags/GD.png') },
  GE: { countryCode: 995, flag: require('./assets/image/flags/GE.png') },
  GF: { countryCode: 594, flag: require('./assets/image/flags/GF.png') },
  GG: { countryCode: 44, flag: require('./assets/image/flags/GG.png') },
  GH: { countryCode: 233, flag: require('./assets/image/flags/GH.png') },
  GI: { countryCode: 350, flag: require('./assets/image/flags/GI.png') },
  GL: { countryCode: 299, flag: require('./assets/image/flags/GL.png') },
  GM: { countryCode: 220, flag: require('./assets/image/flags/GM.png') },
  GN: { countryCode: 224, flag: require('./assets/image/flags/GN.png') },
  GP: { countryCode: 590, flag: require('./assets/image/flags/GP.png') },
  GQ: { countryCode: 240, flag: require('./assets/image/flags/GQ.png') },
  GR: { countryCode: 30, flag: require('./assets/image/flags/GR.png') },
  GT: { countryCode: 502, flag: require('./assets/image/flags/GT.png') },
  GU: { countryCode: 1, flag: require('./assets/image/flags/GU.png') },
  GW: { countryCode: 245, flag: require('./assets/image/flags/GW.png') },
  GY: { countryCode: 592, flag: require('./assets/image/flags/GY.png') },
  HK: { countryCode: 852, flag: require('./assets/image/flags/HK.png') },
  HN: { countryCode: 504, flag: require('./assets/image/flags/HN.png') },
  HR: { countryCode: 385, flag: require('./assets/image/flags/HR.png') },
  HT: { countryCode: 509, flag: require('./assets/image/flags/HT.png') },
  HU: { countryCode: 36, flag: require('./assets/image/flags/HU.png') },
  ID: { countryCode: 62, flag: require('./assets/image/flags/ID.png') },
  IE: { countryCode: 353, flag: require('./assets/image/flags/IE.png') },
  IL: { countryCode: 972, flag: require('./assets/image/flags/IL.png') },
  IM: { countryCode: 44, flag: require('./assets/image/flags/IM.png') },
  IN: { countryCode: 91, flag: require('./assets/image/flags/IN.png') },
  IO: { countryCode: 246, flag: require('./assets/image/flags/IO.png') },
  IQ: { countryCode: 964, flag: require('./assets/image/flags/IQ.png') },
  IR: { countryCode: 98, flag: require('./assets/image/flags/IR.png') },
  IS: { countryCode: 354, flag: require('./assets/image/flags/IS.png') },
  IT: { countryCode: 39, flag: require('./assets/image/flags/IT.png') },
  JE: { countryCode: 44, flag: require('./assets/image/flags/JE.png') },
  JM: { countryCode: 1, flag: require('./assets/image/flags/JM.png') },
  JO: { countryCode: 962, flag: require('./assets/image/flags/JO.png') },
  JP: { countryCode: 81, flag: require('./assets/image/flags/JP.png') },
  KE: { countryCode: 254, flag: require('./assets/image/flags/KE.png') },
  KG: { countryCode: 996, flag: require('./assets/image/flags/KG.png') },
  KH: { countryCode: 855, flag: require('./assets/image/flags/KH.png') },
  KI: { countryCode: 686, flag: require('./assets/image/flags/KI.png') },
  KM: { countryCode: 269, flag: require('./assets/image/flags/KM.png') },
  KN: { countryCode: 1, flag: require('./assets/image/flags/KN.png') },
  KP: { countryCode: 850, flag: require('./assets/image/flags/KP.png') },
  KR: { countryCode: 82, flag: require('./assets/image/flags/KR.png') },
  KW: { countryCode: 965, flag: require('./assets/image/flags/KW.png') },
  KY: { countryCode: 1, flag: require('./assets/image/flags/KY.png') },
  KZ: { countryCode: 7, flag: require('./assets/image/flags/KZ.png') },
  LA: { countryCode: 856, flag: require('./assets/image/flags/LA.png') },
  LB: { countryCode: 961, flag: require('./assets/image/flags/LB.png') },
  LC: { countryCode: 1, flag: require('./assets/image/flags/LC.png') },
  LI: { countryCode: 423, flag: require('./assets/image/flags/LI.png') },
  LK: { countryCode: 94, flag: require('./assets/image/flags/LK.png') },
  LR: { countryCode: 231, flag: require('./assets/image/flags/LR.png') },
  LS: { countryCode: 266, flag: require('./assets/image/flags/LS.png') },
  LT: { countryCode: 370, flag: require('./assets/image/flags/LT.png') },
  LU: { countryCode: 352, flag: require('./assets/image/flags/LU.png') },
  LV: { countryCode: 371, flag: require('./assets/image/flags/LV.png') },
  LY: { countryCode: 218, flag: require('./assets/image/flags/LY.png') },
  MA: { countryCode: 212, flag: require('./assets/image/flags/MA.png') },
  MC: { countryCode: 377, flag: require('./assets/image/flags/MC.png') },
  MD: { countryCode: 373, flag: require('./assets/image/flags/MD.png') },
  ME: { countryCode: 382, flag: require('./assets/image/flags/ME.png') },
  MF: { countryCode: 590, flag: require('./assets/image/flags/MF.png') },
  MG: { countryCode: 261, flag: require('./assets/image/flags/MG.png') },
  MH: { countryCode: 692, flag: require('./assets/image/flags/MH.png') },
  MK: { countryCode: 389, flag: require('./assets/image/flags/MK.png') },
  ML: { countryCode: 223, flag: require('./assets/image/flags/ML.png') },
  MM: { countryCode: 95, flag: require('./assets/image/flags/MM.png') },
  MN: { countryCode: 976, flag: require('./assets/image/flags/MN.png') },
  MO: { countryCode: 853, flag: require('./assets/image/flags/MO.png') },
  MP: { countryCode: 1, flag: require('./assets/image/flags/MP.png') },
  MQ: { countryCode: 596, flag: require('./assets/image/flags/MQ.png') },
  MR: { countryCode: 222, flag: require('./assets/image/flags/MR.png') },
  MS: { countryCode: 1, flag: require('./assets/image/flags/MS.png') },
  MT: { countryCode: 356, flag: require('./assets/image/flags/MT.png') },
  MU: { countryCode: 230, flag: require('./assets/image/flags/MU.png') },
  MV: { countryCode: 960, flag: require('./assets/image/flags/MV.png') },
  MW: { countryCode: 265, flag: require('./assets/image/flags/MW.png') },
  MX: { countryCode: 52, flag: require('./assets/image/flags/MX.png') },
  MY: { countryCode: 60, flag: require('./assets/image/flags/MY.png') },
  MZ: { countryCode: 258, flag: require('./assets/image/flags/MZ.png') },
  NA: { countryCode: 264, flag: require('./assets/image/flags/NA.png') },
  NC: { countryCode: 687, flag: require('./assets/image/flags/NC.png') },
  NE: { countryCode: 227, flag: require('./assets/image/flags/NE.png') },
  NF: { countryCode: 672, flag: require('./assets/image/flags/NF.png') },
  NG: { countryCode: 234, flag: require('./assets/image/flags/NG.png') },
  NI: { countryCode: 505, flag: require('./assets/image/flags/NI.png') },
  NL: { countryCode: 31, flag: require('./assets/image/flags/NL.png') },
  NO: { countryCode: 47, flag: require('./assets/image/flags/NO.png') },
  NP: { countryCode: 977, flag: require('./assets/image/flags/NP.png') },
  NR: { countryCode: 674, flag: require('./assets/image/flags/NR.png') },
  NU: { countryCode: 683, flag: require('./assets/image/flags/NU.png') },
  NZ: { countryCode: 64, flag: require('./assets/image/flags/NZ.png') },
  OM: { countryCode: 968, flag: require('./assets/image/flags/OM.png') },
  PA: { countryCode: 507, flag: require('./assets/image/flags/PA.png') },
  PE: { countryCode: 51, flag: require('./assets/image/flags/PE.png') },
  PF: { countryCode: 689, flag: require('./assets/image/flags/PF.png') },
  PG: { countryCode: 675, flag: require('./assets/image/flags/PG.png') },
  PH: { countryCode: 63, flag: require('./assets/image/flags/PH.png') },
  PK: { countryCode: 92, flag: require('./assets/image/flags/PK.png') },
  PL: { countryCode: 48, flag: require('./assets/image/flags/PL.png') },
  PM: { countryCode: 508, flag: require('./assets/image/flags/PM.png') },
  PR: { countryCode: 1, flag: require('./assets/image/flags/PR.png') },
  PS: { countryCode: 970, flag: require('./assets/image/flags/PS.png') },
  PT: { countryCode: 351, flag: require('./assets/image/flags/PT.png') },
  PW: { countryCode: 680, flag: require('./assets/image/flags/PW.png') },
  PY: { countryCode: 595, flag: require('./assets/image/flags/PY.png') },
  QA: { countryCode: 974, flag: require('./assets/image/flags/QA.png') },
  RE: { countryCode: 262, flag: require('./assets/image/flags/RE.png') },
  RO: { countryCode: 40, flag: require('./assets/image/flags/RO.png') },
  RS: { countryCode: 381, flag: require('./assets/image/flags/RS.png') },
  RU: { countryCode: 7, flag: require('./assets/image/flags/RU.png') },
  RW: { countryCode: 250, flag: require('./assets/image/flags/RW.png') },
  SA: { countryCode: 966, flag: require('./assets/image/flags/SA.png') },
  SB: { countryCode: 677, flag: require('./assets/image/flags/SB.png') },
  SC: { countryCode: 248, flag: require('./assets/image/flags/SC.png') },
  SD: { countryCode: 249, flag: require('./assets/image/flags/SD.png') },
  SE: { countryCode: 46, flag: require('./assets/image/flags/SE.png') },
  SG: { countryCode: 65, flag: require('./assets/image/flags/SG.png') },
  SH: { countryCode: 290, flag: require('./assets/image/flags/SH.png') },
  SI: { countryCode: 386, flag: require('./assets/image/flags/SI.png') },
  SJ: { countryCode: 47, flag: require('./assets/image/flags/SJ.png') },
  SK: { countryCode: 421, flag: require('./assets/image/flags/SK.png') },
  SL: { countryCode: 232, flag: require('./assets/image/flags/SL.png') },
  SM: { countryCode: 378, flag: require('./assets/image/flags/SM.png') },
  SN: { countryCode: 221, flag: require('./assets/image/flags/SN.png') },
  SO: { countryCode: 252, flag: require('./assets/image/flags/SO.png') },
  SR: { countryCode: 597, flag: require('./assets/image/flags/SR.png') },
  SS: { countryCode: 211, flag: require('./assets/image/flags/SS.png') },
  ST: { countryCode: 239, flag: require('./assets/image/flags/ST.png') },
  SV: { countryCode: 503, flag: require('./assets/image/flags/SV.png') },
  SX: { countryCode: 1, flag: require('./assets/image/flags/SX.png') },
  SY: { countryCode: 963, flag: require('./assets/image/flags/SY.png') },
  SZ: { countryCode: 268, flag: require('./assets/image/flags/SZ.png') },
  TA: { countryCode: 290, flag: require('./assets/image/flags/SH.png') }, // TA = SH
  TC: { countryCode: 1, flag: require('./assets/image/flags/TC.png') },
  TD: { countryCode: 235, flag: require('./assets/image/flags/TD.png') },
  TG: { countryCode: 228, flag: require('./assets/image/flags/TG.png') },
  TH: { countryCode: 66, flag: require('./assets/image/flags/TH.png') },
  TJ: { countryCode: 992, flag: require('./assets/image/flags/TJ.png') },
  TK: { countryCode: 690, flag: require('./assets/image/flags/TK.png') },
  TL: { countryCode: 670, flag: require('./assets/image/flags/TL.png') },
  TM: { countryCode: 993, flag: require('./assets/image/flags/TM.png') },
  TN: { countryCode: 216, flag: require('./assets/image/flags/TN.png') },
  TO: { countryCode: 676, flag: require('./assets/image/flags/TO.png') },
  TR: { countryCode: 90, flag: require('./assets/image/flags/TR.png') },
  TT: { countryCode: 1, flag: require('./assets/image/flags/TT.png') },
  TV: { countryCode: 688, flag: require('./assets/image/flags/TV.png') },
  TW: { countryCode: 886, flag: require('./assets/image/flags/TW.png') },
  TZ: { countryCode: 255, flag: require('./assets/image/flags/TZ.png') },
  UA: { countryCode: 380, flag: require('./assets/image/flags/UA.png') },
  UG: { countryCode: 256, flag: require('./assets/image/flags/UG.png') },
  US: { countryCode: 1, flag: require('./assets/image/flags/US.png') },
  UY: { countryCode: 598, flag: require('./assets/image/flags/UY.png') },
  UZ: { countryCode: 998, flag: require('./assets/image/flags/UZ.png') },
  VA: { countryCode: 39, flag: require('./assets/image/flags/VA.png') },
  VC: { countryCode: 1, flag: require('./assets/image/flags/VC.png') },
  VE: { countryCode: 58, flag: require('./assets/image/flags/VE.png') },
  VG: { countryCode: 1, flag: require('./assets/image/flags/VG.png') },
  VI: { countryCode: 1, flag: require('./assets/image/flags/VI.png') },
  VN: { countryCode: 84, flag: require('./assets/image/flags/VN.png') },
  VU: { countryCode: 678, flag: require('./assets/image/flags/VU.png') },
  WF: { countryCode: 681, flag: require('./assets/image/flags/WF.png') },
  WS: { countryCode: 685, flag: require('./assets/image/flags/WS.png') },
  XK: { countryCode: 383, flag: require('./assets/image/flags/XK.png') },
  YE: { countryCode: 967, flag: require('./assets/image/flags/YE.png') },
  YT: { countryCode: 262, flag: require('./assets/image/flags/YT.png') },
  ZA: { countryCode: 27, flag: require('./assets/image/flags/ZA.png') },
  ZM: { countryCode: 260, flag: require('./assets/image/flags/ZM.png') },
  ZW: { countryCode: 263, flag: require('./assets/image/flags/ZW.png') },
};
