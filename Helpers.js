/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Toast } from 'native-base';
import {
  Animated,
  Easing,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Coin, SERVICE_EMAIL, TX_EXPLORER_URIS} from './Constants';
import BigNumber from 'bignumber.js';
import supportedChains from './utils/chains';
import TabBar from './components/TabBar';
import Tab from './components/Tab';
import React from 'react';
import {FileLogger} from 'react-native-file-logger';

export function toastError(error) {
  Toast.show({
    text: error ? error.message : 'no error',
    type: 'warning',
    duration: 3000,
  });
}
export function toast(message) {
  Toast.show({ text: message, type: 'warning', duration: 3000 });
}
export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
export async function checkCameraPermission() {
  if (Platform.OS == 'ios') {
    return true;
  }
  try {
    let granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    toastError(error);
    return false;
  }
}

export async function checkStoragePermission() {
  if (Platform.OS == 'ios') {
    return true;
  }
  try {
    let granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
    granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.log('checkStoragePermission failed', error);
    toastError(error);
  }
  return false;
}
export function isErc20(wallet) {
  return wallet.currency == Coin.ETH && hasValue(wallet.tokenAddress);
}
export function getAvailableBalance(balanceItem) {
  if (balanceItem) {
    return (
      balanceItem.availableBalance ||
      balanceItem.tokenBalance ||
      balanceItem.balance
    );
  }
  return '0';
}
export function effectiveBalance(balanceItem, defaultText = '…') {
  if (balanceItem) {
    return balanceItem.tokenBalance || balanceItem.balance || defaultText;
  }
  return defaultText;
}
export function getWalletKeyByWallet(wallet) {
  let key = `${wallet.currency}#${wallet.tokenAddress}#${wallet.address}`;
  return key;
}
export function getWalletKey(currency, tokenAddress, address) {
  let key = `${currency}#${tokenAddress}#${address}`;
  return key;
}

export function getTransactionKey(walletKey, transactions) {
  let txKey = transactions.txid
    ? `${walletKey}_${transactions.txid}`
    : `${walletKey}_${transactions.timestamp}`;
  return txKey;
}

export function getExchangeAmountFromWallets(
  wallets,
  exchangeCurrency,
  balances,
  currencyPrice,
  precision
) {
  let amount = 0;
  let available = false;
  for (let i = 0; i < wallets.length; i++) {
    let key = `${wallets[i].currency}#${wallets[i].tokenAddress}#${exchangeCurrency}`;
    let balanceItem = balances[getWalletKeyByWallet(wallets[i])] || {};
    let balance = balanceItem.tokenBalance || balanceItem.balance || null;
    let price = currencyPrice[key];
    if (price && balance) {
      amount += Number(price * balance);
      available = true;
    } else {
      continue;
    }
  }
  if (available) {
    return amount.toFixed ? amount.toFixed(precision) : amount;
  }
  return null;
}

export function getExchangeAmount(
  unit = 0,
  precision = 3,
  wallet = {},
  exchangeCurrency,
  currencyPrice = {},
  nanText = ''
) {
  let key = `${wallet.currency}#${wallet.tokenAddress}#${exchangeCurrency}`;
  let price = currencyPrice[key];
  let amount = Number(price * unit);
  if (isNaN(amount)) {
    return nanText;
  }
  let n = new BigNumber(amount);
  return n.toFixed(n.decimalPlaces());
}
export function getEthGasFeeSub(num, multiplier, n) {
  if (isNaN(num)) {
    return 0;
  }
  let bignum = BigNumber(num).multipliedBy(multiplier);
  return {
    amountUi: bignum.toFixed(bignum.decimalPlaces()),
    lessThenMin: bignum.isLessThanOrEqualTo(n),
  };
}

export const getTransactionExplorerUri = (
  currency,
  tokenAddress,
  txid,
  config
) => {
  const template = TX_EXPLORER_URIS[config]
    ? TX_EXPLORER_URIS[config][`${currency}#${tokenAddress}`]
    : TX_EXPLORER_URIS.main[`${currency}#${tokenAddress}`];
  if (!template) {
    return null;
  }
  return template.replace('%s', txid);
};

export const explorer = (currency, tokenAddress, txid, config) => {
  const uri = getTransactionExplorerUri(currency, tokenAddress, txid, config);
  if (uri) {
    Linking.openURL(uri).catch(console.error);
  }
};

export function getTotalFeeFromLimit(gasPriceStr, gasLimitStr) {
  if (!hasValue(gasPriceN) || !hasValue(gasLimitN)) {
    return null;
  }
  let gasPriceN = Number(gasPriceStr);
  let gasLimitN = Number(gasLimitStr);
  if (isNaN(gasPriceN) || isNaN(gasLimitN)) {
    return null;
  }
  let gasPrice = BigNumber(gasPriceN).dividedBy(new BigNumber('10').pow(18));
  let gasLimit = BigNumber(gasLimitN);
  let total = gasPrice.multipliedBy(gasLimit);
  return { gasPrice, gasLimit, total };
}
export function getEthGasFeeWithPreLimit(feeObj, usedFee) {
  if (!usedFee) {
    return getEthGasFee(feeObj, 60, null, 0);
  }
  let minumNum = usedFee.total.multipliedBy(1.1);
  let lowObj = getEthGasFeeSub(
    Number(feeObj.low.amount),
    usedFee.gasLimit,
    minumNum
  );
  let mediumObj = getEthGasFeeSub(
    Number(feeObj.medium.amount),
    usedFee.gasLimit,
    minumNum
  );
  let highObj = getEthGasFeeSub(
    Number(feeObj.high.amount),
    usedFee.gasLimit,
    minumNum
  );
  return {
    usedFee: usedFee.total.toFixed(usedFee.total.decimalPlaces()),
    min: minumNum.toFixed(minumNum.decimalPlaces()),
    low: {
      ...feeObj.low,
      ...lowObj,
    },
    medium: {
      ...feeObj.medium,
      ...mediumObj,
    },
    high: {
      ...feeObj.high,
      ...highObj,
    },
  };
}
export function getEthGasFee(feeObj, currency, tokenAddress, minumn) {
  let multiplier =
    currency === Coin.ETH ? (hasValue(tokenAddress) ? 90000 : 21000) : 1;
  let minumNum = Number(minumn);
  minumNum = isNaN(minumNum)
    ? BigNumber(0)
    : BigNumber(minumNum).multipliedBy(1.1);
  let lowObj = getEthGasFeeSub(Number(feeObj.low.amount), multiplier, minumNum);
  let mediumObj = getEthGasFeeSub(
    Number(feeObj.medium.amount),
    multiplier,
    minumNum
  );
  let highObj = getEthGasFeeSub(
    Number(feeObj.high.amount),
    multiplier,
    minumNum
  );
  return {
    min: minumNum.toFixed(minumNum.decimalPlaces()),
    low: {
      ...feeObj.low,
      ...lowObj,
    },
    medium: {
      ...feeObj.medium,
      ...mediumObj,
    },
    high: {
      ...feeObj.high,
      ...highObj,
    },
  };
}
export function getEstimateFee(currency, tokenAddress, fee) {
  switch (currency) {
    case Coin.BTC:
      return BigNumber(0.001);
    case Coin.ETH:
      let feeNum = Number(fee);
      if (isNaN(feeNum)) {
        feeNum = 0;
      }
      if (hasValue(tokenAddress)) {
        return BigNumber(feeNum).multipliedBy(90000);
      } else {
        return BigNumber(feeNum).multipliedBy(21000);
      }
    case Coin.LTC:
      return BigNumber(0.0005);
    case Coin.BCH:
      return BigNumber(0.0001);
  }
  return BigNumber(0);
}
export function hasValue(str) {
  return str != null && str.length > 0;
}
export function isValidEosAccount(accountName) {
  let regex = new RegExp('^[a-z1-5]{12}$');
  return regex.test(accountName);
}
export function focusInput(refs, index) {
  if (refs[index] && refs[index].current) {
    refs[index].current.focus();
  }
}
export function focusNext(refs, currentIndex) {
  for (let i = currentIndex + 1; i < refs.length; i++) {
    if (refs[i].current) {
      refs[i].current.focus();
      break;
    }
  }
}
const ANIM_SWITCH_DURATION = 800;
export function animateSwitchPin(animPinInput, forward) {
  Animated.timing(animPinInput, {
    toValue: forward ? 1 : 0,
    easing: Easing.out(Easing.exp),
    duration: ANIM_SWITCH_DURATION,
    useNativeDriver: true,
  }).start();
}
export function getRestCurrencies(currencies, wallets) {
  if (!currencies || !currencies.length) {
    return [];
  }
  return currencies.filter(
    currency =>
      Coin.EOS !== currency.currency && //TODO: hide EOS temporarily
      !(wallets || []).find(
        wallet =>
          wallet.currency === currency.currency &&
          wallet.tokenAddress === currency.tokenAddress
      )
  );
}
export function getFullName(givenName, familyName) {
  if (!hasValue(givenName) && !hasValue(familyName)) {
    return '';
  }
  const regex = /^[\u4e00-\u9eff]+$/gu;
  let m1 = givenName.match(regex);
  let m2 = familyName.match(regex);
  if (m1 && m1.length > 0 && m2 && m2.length > 0) {
    return `${familyName}${givenName}`;
  } else {
    return `${givenName} ${familyName}`;
  }
}
export function hasMemo(wallet) {
  return [Coin.EOS, Coin.XRP].includes(wallet.currency);
}
export function animateFadeInOut(animOpacity, duration, callback) {
  Animated.sequence([
    Animated.timing(animOpacity, {
      toValue: 0.9,
      duration: duration,
      useNativeDriver: true,
    }),
    Animated.timing(animOpacity, {
      toValue: 0.9,
      duration: duration,
      useNativeDriver: true,
    }),
    Animated.timing(animOpacity, {
      toValue: 0,
      duration: duration,
      useNativeDriver: true,
    }),
  ]).start(callback);
}

export function sendLogFilesByEmail(to, subject, body) {
  FileLogger.sendLogFilesByEmail({
    to: to,
    subject: subject,
    body: body,
  });
}

export function checkWalletConnectUri(str) {
  const pathStart = str.indexOf(':');
  const pathEnd = str.indexOf('?') !== -1 ? str.indexOf('?') : undefined;
  const protocol = str.substring(0, pathStart);
  const path = str.substring(pathStart + 1, pathEnd);
  if (protocol != 'wc') {
    return { valid: false, message: 'URI format is invalid' };
  }
  let values = path.split('@');
  let handshakeTopic = values[0];
  if (!handshakeTopic) {
    return {
      valid: false,
      message: 'Invalid or missing handshakeTopic parameter value',
    };
  }
  const queryString = typeof pathEnd !== 'undefined' ? str.substr(pathEnd) : '';
  if (queryString == '') {
    return {
      valid: false,
      message: 'Missing queryString',
    };
  }
  let result = parseQueryString(queryString);
  if (!result.bridge) {
    return {
      valid: false,
      message: 'Invalid or missing bridge url parameter value',
    };
  }
  if (!result.key) {
    return {
      valid: false,
      message: 'Invalid or missing key parameter value',
    };
  }
  return { valid: true };
}

export function parseQueryString(queryString: string): any {
  const result: any = {};

  const pairs = (queryString[0] === '?'
    ? queryString.substr(1)
    : queryString
  ).split('&');

  for (let i = 0; i < pairs.length; i++) {
    const keyArr: string[] = pairs[i].match(/\w+(?==)/i) || [];
    const valueArr: string[] = pairs[i].match(/[=].+/i) || [];
    if (keyArr[0]) {
      result[decodeURIComponent(keyArr[0])] = decodeURIComponent(
        valueArr[0].substr(1)
      );
    }
  }

  return result;
}

export function getChainData(chainId: number) {
  const chainData = supportedChains.filter(
    (chain: any) => chain.chain_id === chainId
  )[0];

  if (!chainData) {
    throw new Error('ChainId missing or not supported');
  }

  return chainData;
}
export function convertHexToString(hex: string): string {
  return new BigNumber(`${hex}`).toString();
}

export function convertAmountFromRawNumber(
  value: string | number,
  decimals: number = 18
): string {
  let n = new BigNumber(`${value}`).dividedBy(
    new BigNumber('10').pow(decimals)
  );
  return n.toFixed(n.decimalPlaces());
}

export function getWalletConnectSvg() {
  return `<svg width="512px" height="512px" viewBox="0 0 512 512">
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="logo">
            <rect id="base" fill="#FFFFFF" x="0" y="0" width="512" height="512" rx="256"></rect>
            <path d="M169.209772,184.531136 C217.142772,137.600733 294.857519,137.600733 342.790517,184.531136 L348.559331,190.179285 C350.955981,192.525805 350.955981,196.330266 348.559331,198.676787 L328.82537,217.99798 C327.627045,219.171241 325.684176,219.171241 324.485851,217.99798 L316.547278,210.225455 C283.10802,177.485633 228.89227,177.485633 195.453011,210.225455 L186.951456,218.549188 C185.75313,219.722448 183.810261,219.722448 182.611937,218.549188 L162.877976,199.227995 C160.481326,196.881474 160.481326,193.077013 162.877976,190.730493 L169.209772,184.531136 Z M383.602212,224.489406 L401.165475,241.685365 C403.562113,244.031874 403.562127,247.836312 401.165506,250.182837 L321.971538,327.721548 C319.574905,330.068086 315.689168,330.068112 313.292501,327.721609 C313.292491,327.721599 313.29248,327.721588 313.29247,327.721578 L257.08541,272.690097 C256.486248,272.103467 255.514813,272.103467 254.915651,272.690097 C254.915647,272.690101 254.915644,272.690105 254.91564,272.690108 L198.709777,327.721548 C196.313151,330.068092 192.427413,330.068131 190.030739,327.721634 C190.030725,327.72162 190.03071,327.721606 190.030695,327.721591 L110.834524,250.181849 C108.437875,247.835329 108.437875,244.030868 110.834524,241.684348 L128.397819,224.488418 C130.794468,222.141898 134.680206,222.141898 137.076856,224.488418 L193.284734,279.520668 C193.883897,280.107298 194.85533,280.107298 195.454493,279.520668 C195.454502,279.520659 195.45451,279.520651 195.454519,279.520644 L251.65958,224.488418 C254.056175,222.141844 257.941913,222.141756 260.338618,224.488222 C260.338651,224.488255 260.338684,224.488288 260.338717,224.488321 L316.546521,279.520644 C317.145683,280.107273 318.117118,280.107273 318.71628,279.520644 L374.923175,224.489406 C377.319825,222.142885 381.205562,222.142885 383.602212,224.489406 Z" id="WalletConnect" fill="#3B99FC" fill-rule="nonzero"></path>
        </g>
    </g>
</svg>`;
}
export function getWalletConnectSvg2() {
  return `<svg width="300px" height="185px" viewBox="0 0 300 185">
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="walletconnect-logo-alt" fill="#3B99FC" fill-rule="nonzero">
            <path d="M61.4385429,36.2562612 C110.349767,-11.6319051 189.65053,-11.6319051 238.561752,36.2562612 L244.448297,42.0196786 C246.893858,44.4140867 246.893858,48.2961898 244.448297,50.690599 L224.311602,70.406102 C223.088821,71.6033071 221.106302,71.6033071 219.883521,70.406102 L211.782937,62.4749541 C177.661245,29.0669724 122.339051,29.0669724 88.2173582,62.4749541 L79.542302,70.9685592 C78.3195204,72.1657633 76.337001,72.1657633 75.1142214,70.9685592 L54.9775265,51.2530561 C52.5319653,48.8586469 52.5319653,44.9765439 54.9775265,42.5821357 L61.4385429,36.2562612 Z M280.206339,77.0300061 L298.128036,94.5769031 C300.573585,96.9713 300.573599,100.85338 298.128067,103.247793 L217.317896,182.368927 C214.872352,184.763353 210.907314,184.76338 208.461736,182.368989 C208.461726,182.368979 208.461714,182.368967 208.461704,182.368957 L151.107561,126.214385 C150.496171,125.615783 149.504911,125.615783 148.893521,126.214385 C148.893517,126.214389 148.893514,126.214393 148.89351,126.214396 L91.5405888,182.368927 C89.095052,184.763359 85.1300133,184.763399 82.6844276,182.369014 C82.6844133,182.369 82.684398,182.368986 82.6843827,182.36897 L1.87196327,103.246785 C-0.573596939,100.852377 -0.573596939,96.9702735 1.87196327,94.5758653 L19.7936929,77.028998 C22.2392531,74.6345898 26.2042918,74.6345898 28.6498531,77.028998 L86.0048306,133.184355 C86.6162214,133.782957 87.6074796,133.782957 88.2188704,133.184355 C88.2188796,133.184346 88.2188878,133.184338 88.2188969,133.184331 L145.571,77.028998 C148.016505,74.6345347 151.981544,74.6344449 154.427161,77.028798 C154.427195,77.0288316 154.427229,77.0288653 154.427262,77.028899 L211.782164,133.184331 C212.393554,133.782932 213.384814,133.782932 213.996204,133.184331 L271.350179,77.0300061 C273.79574,74.6355969 277.760778,74.6355969 280.206339,77.0300061 Z" id="WalletConnect"></path>
        </g>
    </g>
</svg>`;
}

export function getConnectionList(map) {
  if (!map) {
    return [];
  }
  let data = [];
  Object.keys(map).map(key => {
    try {
      const { peerMeta } = map[key].getSessionPayload().params[0];
      data.unshift({
        peerId: key,
        name: peerMeta.name,
        icon: peerMeta.icons[0],
        address: map[key].getAddress(),
        timestamp: map[key].getConnectTime().format('YYYY-MM-DD HH:mm:ss'),
      });
    } catch (error) {
      console.debug(error);
    }
  });
  return data;
}
export function renderTabBar(theme, _scrollX) {
  // 6 is a quantity of tabs
  const interpolators = Array.from({ length: 2 }, (_, i) => i).map(idx => ({
    scale: _scrollX.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: [1, 1.2, 1],
      extrapolate: 'clamp',
    }),
    opacity: _scrollX.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: [0.2, 1, 0.2],
      extrapolate: 'clamp',
    }),
    textColor: _scrollX.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: ['#fff', '#fff', '#fff'],
    }),
    backgroundColor: _scrollX.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: ['transparent', 'transparent', 'transparent'],
      extrapolate: 'clamp',
    }),
  }));
  return (
    <TabBar
      underlineColor={theme.colors.primary}
      tabBarStyle={{
        backgroundColor: 'transparent',
        borderTopWidth: 0,
      }}
      renderTab={(tab, page, isTabActive, onPressHandler, onTabLayout) => (
        <Tab
          key={page}
          tab={tab}
          page={page}
          isTabActive={isTabActive}
          onPressHandler={onPressHandler}
          onTabLayout={onTabLayout}
          styles={interpolators[page]}
        />
      )}
    />
  );
}
