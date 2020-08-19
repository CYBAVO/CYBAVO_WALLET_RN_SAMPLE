/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Toast } from 'native-base';
import { Animated, Easing, PermissionsAndroid, Platform } from 'react-native';
import { Coin } from './Constants';
import BigNumber from 'bignumber.js';

export function toastError(error) {
  Toast.show({
    text: error ? error.message : 'no error',
    type: 'warning',
    duration: 3000,
  });
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
  return amount.toFixed ? amount.toFixed(precision) : amount;
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
