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
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CBO_SEPARATOR,
  chainI18n,
  Coin,
  NFT_EXPLORER_URIS,
  nftIcons,
  replaceConfig,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
  SERVICE_EMAIL,
  TX_EXPLORER_URIS,
} from './Constants';
import BigNumber from 'bignumber.js';
import supportedChains from './utils/chains';
import TabBar from './components/TabBar';
import Tab from './components/Tab';
import React from 'react';
import { FileLogger } from 'react-native-file-logger';
import I18n from './i18n/i18n';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import * as DeviceInfo from 'react-native-device-info';
import { uniqueIds } from './BuildConfig';
import { BIO_SETTING_USE_SMS, startClock } from './store/actions';
import { Wallets } from '@cybavo/react-native-wallet-service';
import { TYPE_FAIL } from './components/ResultModal';
import { nftStartColors, Theme } from './styles/MainTheme';
import LinearGradient from 'react-native-linear-gradient';
import { Surface, Text, TouchableRipple } from 'react-native-paper';
import { CANCELLED } from './store/reducers/transactions';
import Styles from './styles/Styles';
import DisplayTime from './components/DisplayTime';
import { DotIndicator } from 'react-native-indicators';
import { SvgUri } from 'react-native-svg';
import IconSvgXmlGeneral from './components/IconSvgXmlGeneral';

export function toastError(error) {
  Toast.show({
    text: error ? error.message : 'no error',
    type: 'warning',
    duration: 3000,
  });
}
export function secondsToTime(e) {
  let m = Math.floor((e % 3600) / 60)
      .toString()
      .padStart(2, '0'),
    s = Math.floor(e % 60)
      .toString()
      .padStart(2, '0');
  return m + ':' + s;
}
export function toast(message) {
  Toast.show({ text: message, type: 'warning', duration: 3000 });
}
export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
export function getTrendDirectionAndStr(str) {
  if (str.indexOf('%') == -1) {
    str = `${str}%`;
  }
  if (str.indexOf('-') == 0) {
    return { d: 0, s: str }; // < 0
  } else {
    switch (str) {
      case '+0%':
      case '-0%':
      case '0%':
        return { d: 1, s: '0%' }; //0
    }
    return { d: 2, s: `+${str}` }; //> 0
  }
}
export function inDevList() {
  let uniqueId = DeviceInfo.getUniqueId();
  let inList = uniqueIds.includes(uniqueId) || uniqueIds.includes('all');
  console.debug('uniqueId:' + uniqueId);
  console.debug('uniqueIds:' + uniqueIds);
  return inList;
  // return true;
}
export function getFormattedTrend(str) {
  if (str.indexOf('-') != 0) {
    return `+${str}`;
  } else {
    return str;
  }
}
export async function checkCameraPermission() {
  try {
    let value = false;
    if (Platform.OS == 'ios') {
      let cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
      value = cameraStatus === RESULTS.GRANTED;
    } else {
      let granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      value = granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (value != true) {
      toast(I18n.t('grant_camera_permission_hint'));
      return false;
    } else {
      return true;
    }
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
      toast(I18n.t('grant_storage_permission_hint'));
      return false;
    }
    granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      toast(I18n.t('grant_storage_permission_hint'));
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log('checkStoragePermission failed', error);
    toastError(error);
  }
  return false;
}
export function isErc20(wallet) {
  return wallet.currency == Coin.ETH && hasValue(wallet.tokenAddress);
}
export function isBsc20(wallet) {
  return wallet.currency == Coin.BSC && hasValue(wallet.tokenAddress);
}
export function isBsc(wallet) {
  return wallet.currency == Coin.BSC;
}
export function getAvailableBalance(balanceItem) {
  if (balanceItem) {
    if (balanceItem.availableBalance) {
      return balanceItem.availableBalance;
    } else {
      if (balanceItem.tokenAddress) {
        return balanceItem.tokenBalance || '0';
      } else {
        return balanceItem.balance || '0';
      }
    }
  }
  return '0';
}
export function effectiveBalance(balanceItem, defaultText = '…') {
  if (balanceItem) {
    if (balanceItem.tokenAddress) {
      return balanceItem.tokenBalance || '0';
    } else {
      return balanceItem.balance || '0';
    }
  }
  return defaultText;
}
export function getWalletKeyByWallet(wallet) {
  if (wallet == null) {
    return '';
  }
  let key = `${wallet.currency}#${wallet.tokenAddress}#${wallet.address}`;
  return key;
}
export function getWalletKey(currency, tokenAddress, address) {
  let key = `${currency}#${tokenAddress}#${address}`;
  return key;
}

export function getEstimateResultKey(
  currency,
  tokenAddress,
  amount,
  fee,
  walletId,
  toAddress
) {
  return `${currency}#${tokenAddress}#${amount}#${fee}#${walletId}#${toAddress}`;
}
export function getTransactionKey(walletKey, transactions) {
  let txKey = transactions.txid
    ? `${walletKey}_${transactions.txid}`
    : `${walletKey}_${transactions.timestamp}`;
  return txKey;
}
export function renderTxItem(
  { item },
  onTransactionPress,
  sendImg,
  receiveImg,
  getCurrencySymbol,
  tokenId,
  amount
) {
  const opacity = item.pending ? 0.35 : 1;
  const decorationLine =
    item.replaceStatus === CANCELLED ? 'line-through' : 'none';
  return (
    <Surface
      style={[
        Styles.listItem,
        {
          backgroundColor: Theme.colors.background,
        },
      ]}>
      <TouchableRipple
        onPress={() => onTransactionPress(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderColor: Theme.colors.backgroundPressed,
          borderBottomWidth: 1,
          borderTopWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
        }}>
        <>
          <Image
            source={item.out ? sendImg : receiveImg}
            resizeMode="stretch"
            style={{
              width: 24,
              height: 24,
              opacity: opacity,
              marginLeft: 16,
            }}
          />
          <View style={[Styles.itemBody, { flex: 2 }]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 8,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 4,
                }}>
                {item.replaceStatus != null && (
                  <Text
                    style={[
                      Styles.cardDesc,
                      {
                        opacity: opacity * 0.7,
                        marginLeft: 0,
                        marginRight: 8,
                      },
                      Theme.fonts.default.regular,
                    ]}>{`#${item.nonce}`}</Text>
                )}
                <DisplayTime
                  textStyle={[
                    Styles.cardDesc,
                    {
                      opacity: opacity * 0.7,
                      marginLeft: 0,
                      marginRight: 16,
                    },
                    Theme.fonts.default.regular,
                  ]}
                  format="YYYY-M-D"
                  unix={item.timestamp}
                />
                {!item.success && (
                  <Text style={{ color: Theme.colors.error, fontSize: 12 }}>
                    {I18n.t('failed')}
                  </Text>
                )}
                {item.pending && item.success && !item.dropped && (
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: Theme.colors.melon, fontSize: 12 }}>
                      {I18n.t('pending')}
                    </Text>
                    <View style={{ marginLeft: 8 }}>
                      <DotIndicator
                        color={Theme.colors.primary}
                        size={4}
                        count={3}
                      />
                    </View>
                  </View>
                )}
              </View>

              {replaceConfig[item.replaceStatus] && (
                <Text
                  style={[
                    // Styles.tag,
                    {
                      color: Theme.colors.text,
                      backgroundColor: replaceConfig[item.replaceStatus].color,
                      fontSize: 8,
                      paddingVertical: 2,
                      borderRadius: 7,
                      paddingHorizontal: 5,
                      opacity: opacity,
                      marginLeft: 8,
                      overflow: 'hidden',
                    },
                  ]}>
                  {I18n.t(replaceConfig[item.replaceStatus].i18n)}
                </Text>
              )}
            </View>
            {item.txid != null && item.txid.length > 0 && (
              <View style={{ flexDirection: 'row', flex: 1, marginTop: 3 }}>
                <Text
                  style={[
                    Styles.tag,
                    {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      fontSize: 8,
                      opacity: 0.5,
                    },
                  ]}>
                  {I18n.t('txid')}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={[
                    Styles.cardDesc,
                    Theme.fonts.default.regular,
                    { marginLeft: 2, flexShrink: 1, marginRight: 4 },
                  ]}>
                  {item.txid}
                </Text>
              </View>
            )}
          </View>
          <View
            style={[
              Styles.itemBody,
              { alignItems: 'flex-end', paddingRight: 16 },
            ]}>
            {hasValue(tokenId) ? (
              <View style={{ flexDirection: 'column' }}>
                <Text
                  style={[
                    Styles.cardTitle,
                    Theme.fonts.default.heavy,
                    {
                      opacity: opacity,
                      textDecorationLine: decorationLine,
                      fontSize: 14,
                      flexShrink: 1,
                    },
                    Theme.fonts.default.heavyMax,
                  ]}>
                  {`#${tokenId}`}
                </Text>
                <Text
                  style={[
                    Styles.cardDescHorizontal,
                    Theme.fonts.default.heavy,
                    { opacity: opacity, marginTop: 3 },
                  ]}>
                  {amount}
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={[
                    Styles.cardTitle,
                    Theme.fonts.default.heavy,
                    {
                      opacity: opacity,
                      textDecorationLine: decorationLine,
                      fontSize: 14,
                      flexShrink: 1,
                    },
                    Theme.fonts.default.heavyMax,
                  ]}>
                  {item.amount}
                </Text>
                <Text
                  style={[
                    Styles.cardDescHorizontal,
                    Theme.fonts.default.heavy,
                    { opacity: opacity },
                  ]}>
                  {getCurrencySymbol(item)}
                </Text>
              </View>
            )}
          </View>
        </>
      </TouchableRipple>
    </Surface>
  );
}

export function renderNftItem(
  item,
  onClickAction,
  config,
  expolreImg,
  padding = 0,
  tokenUriMap = {}
) {
  const { columns } = item;
  let MARGIN_4 = { ios: 4, android: 0 };
  return (
    <View
      key="$container"
      style={[
        {
          flex: 1,
          flexDirection: 'row',
          backgroundColor: Theme.colors.background,
          paddingHorizontal: padding,
        },
      ]}>
      {columns.map((column, columnIndex) => {
        return (
          <View key={`$column-${columnIndex}`} style={{ flex: 1 }}>
            {columns[columnIndex].map((ii, iiIndex) => {
              const {
                startColor,
                endColor,
                currencyDisplayName,
                tokenId,
                amount,
                currency,
                tokenAddress,
                icon,
              } = ii;
              let mapKey = `${currency}#${tokenAddress}#${tokenId}`;
              return (
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  colors={[startColor, endColor]}
                  style={{
                    padding: 2,
                    marginRight: columnIndex % 2 == 0 ? 8 : 0,
                    marginLeft: columnIndex % 2 == 1 ? 8 : 0,
                    marginBottom: 16,
                    borderRadius: 12,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      onClickAction(ii, tokenId);
                    }}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingTop: 24,
                      paddingBottom: 28,
                      paddingHorizontal: 16,
                    }}>
                    <IconSvgXmlGeneral
                      url={
                        tokenUriMap[mapKey] ? tokenUriMap[mapKey].image : null
                      }
                      placeholder={icon}
                      style={{
                        height: 56,
                        width: 56,
                        alignSelf: 'center',
                        marginBottom: 8,
                      }}
                    />
                    <Text
                      numberOfLines={3}
                      ellipsizeMode="tail"
                      style={[
                        {
                          fontSize: 14,
                          marginTop: MARGIN_4[Platform.OS],
                          textAlign: 'center',
                        },
                        Theme.fonts.default.heavyBold,
                      ]}>
                      {currencyDisplayName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        opacity: 0.7,
                        marginTop: MARGIN_4[Platform.OS],
                      }}>
                      {I18n.t(chainI18n[currency], { defaultValue: '' })}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="middle"
                      style={[
                        {
                          fontSize: 12,
                          marginTop: MARGIN_4[Platform.OS],
                          textAlign: 'center',
                        },
                        Theme.fonts.default.heavyBold,
                      ]}>
                      {`#${tokenId}`}
                    </Text>
                    {amount && (
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        style={[
                          {
                            fontSize: 12,
                            marginTop: MARGIN_4[Platform.OS],
                            textAlign: 'center',
                          },
                        ]}>
                        {amount}
                      </Text>
                    )}
                    <TouchableOpacity
                      height={ROUND_BUTTON_HEIGHT}
                      style={[
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 20,
                        },
                      ]}
                      color={'transparent'}
                      onPress={() =>
                        explorerNft(currency, tokenAddress, tokenId, config)
                      }>
                      <Image
                        source={expolreImg}
                        style={{
                          width: ROUND_BUTTON_ICON_SIZE,
                          height: ROUND_BUTTON_ICON_SIZE,
                        }}
                      />
                      <Text
                        style={[
                          {
                            marginLeft: 4,
                            color: Theme.colors.text,
                            fontSize: 12,
                          },
                          Theme.fonts.default.heavyBold,
                        ]}>
                        {I18n.t('view_on_explore')}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </LinearGradient>
              );
            })}
          </View>
        );
      })}
    </View>
  );
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
    let balance;

    if (balanceItem.tokenAddress) {
      balance = balanceItem.tokenBalance;
    } else {
      balance = balanceItem.balance;
    }
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
export function getEstimateGasFeeSub(feeStr, num, min, replaceValue) {
  if (isNaN(num)) {
    return 0;
  }
  let bigFee = BigNumber(feeStr);
  let bigEst = BigNumber(num);
  return {
    amountUi: bigEst.toFixed(bigEst.decimalPlaces()),
    lessThenMin: bigEst.isLessThanOrEqualTo(min),
  };
}
export function getEthGasFeeSub(feeNum, multiplier, n, replaceValue) {
  if (isNaN(feeNum)) {
    return 0;
  }
  let bignum = BigNumber(feeNum).multipliedBy(multiplier);
  if (replaceValue && bignum.isLessThanOrEqualTo(n)) {
    let rValue = n.div(multiplier);
    return {
      amountUi: n.toFixed(n.decimalPlaces()),
      lessThenMin: false,
      rValue: rValue.toFixed(rValue.decimalPlaces()),
    };
  }
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

export const getNftExplorerUri = (currency, tokenAddress, tokenId, config) => {
  const template = NFT_EXPLORER_URIS[config]
    ? NFT_EXPLORER_URIS[config][`${currency}`]
    : NFT_EXPLORER_URIS.main[`${currency}`];
  if (!template) {
    return null;
  }
  return template.replace('%s1', tokenAddress).replace('%s2', tokenId);
};

export const explorerNft = (currency, tokenAddress, tokenId, config) => {
  const uri = getNftExplorerUri(currency, tokenAddress, tokenId, config);
  if (uri) {
    Linking.openURL(uri).catch(console.error);
  }
};
export const getNftColorIndex = index => {
  return index % nftStartColors.length;
};

export const getNftIconIndex = index => {
  return index % nftIcons.length;
};

export const explorer = (currency, tokenAddress, txid, config) => {
  const uri = getTransactionExplorerUri(currency, tokenAddress, txid, config);
  if (uri) {
    Linking.openURL(uri).catch(console.error);
  }
};
export function strToBigNumber(str) {
  try {
    if (!hasValue(str)) {
      return BigNumber(0);
    }
    let n = Number(str);
    if (isNaN(n)) {
      return BigNumber(0);
    }
    return BigNumber(n);
  } catch (error) {
    return BigNumber(0);
  }
}
export function getTotalFeeFromLimit(gasPriceStr, gasLimitStr) {
  if (!hasValue(gasPriceStr) || !hasValue(gasLimitStr)) {
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
export async function checkAuthType(
  enableBiometrics,
  skipSmsVerify,
  bioSetting,
  accountSkipSmsVerify
) {
  console.log('_checkAuthType' + enableBiometrics + ',' + skipSmsVerify);
  if (!enableBiometrics || skipSmsVerify) {
    return { isSms: false };
  }
  try {
    if (bioSetting == BIO_SETTING_USE_SMS) {
      await Wallets.updateDeviceInfoWithType(Wallets.BiometricsType.NONE);
      return { isSms: true };
    }
    let { exist } = await Wallets.isBioKeyExist();
    let { biometricsType } = await Wallets.getBiometricsType();
    console.debug(`exist:${exist}, biometricsType:${biometricsType}`);
    if (biometricsType == Wallets.BiometricsType.NONE) {
      if (accountSkipSmsVerify) {
        return {
          isSms: false,
          error: {
            code: -1,
            message: I18n.t('error_not_support_bio_but_account_skip_sms'),
          },
        };
      }
      if (exist) {
        await Wallets.updateDeviceInfo();
      }
      return { isSms: true };
    } else {
      if (!exist) {
        await Wallets.updateDeviceInfo();
        await Wallets.registerPubkey();
      }
      return { isSms: false };
    }
  } catch (error) {
    console.debug('_checkAuthType pack fail', error);
    return { isSms: false, error: error };
  }
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
  // highObj.lessThenMin = false;
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
export async function getEstimateGasFee(
  feeObj,
  currency,
  tokenAddress,
  minumn,
  amountStr,
  walletId,
  toAddress
) {
  try {
    let r1 = await Wallets.estimateTransaction(
      currency,
      tokenAddress,
      amountStr,
      feeObj.high.amount,
      walletId,
      toAddress
    );
    let r2 = await Wallets.estimateTransaction(
      currency,
      tokenAddress,
      amountStr,
      feeObj.medium.amount,
      walletId,
      toAddress
    );
    let r3 = await Wallets.estimateTransaction(
      currency,
      tokenAddress,
      amountStr,
      feeObj.low.amount,
      walletId,
      toAddress
    );
    let minumNum = Number(minumn);
    minumNum = isNaN(minumNum)
      ? BigNumber(0)
      : BigNumber(minumNum).multipliedBy(1.1);

    let lowObj = getEstimateGasFeeSub(
      feeObj.low.amount,
      Number(r3.blockchainFee),
      minumNum
    );
    let mediumObj = getEstimateGasFeeSub(
      feeObj.medium.amount,
      Number(r2.blockchainFee),
      minumNum
    );
    let highObj = getEstimateGasFeeSub(
      feeObj.high.amount,
      Number(r1.blockchainFee),
      minumNum
    );
    let v = {
      min: minumNum.toFixed(minumNum.decimalPlaces()),
      low: {
        ...feeObj.low,
        amountUi: lowObj.amountUi,
        lessThenMin: lowObj.lessThenMin,
      },
      medium: {
        ...feeObj.medium,
        amountUi: mediumObj.amountUi,
        lessThenMin: mediumObj.lessThenMin,
      },
      high: {
        ...feeObj.high,
        amountUi: highObj.amountUi,
        lessThenMin: highObj.lessThenMin,
      },
    };
    return v;
  } catch (error) {
    return getEthGasFee(feeObj, currency, tokenAddress, minumn);
  }
}
export function getEthGasFee(feeObj, currency, tokenAddress, minumn) {
  let multiplier = isETHForkChain(currency)
    ? hasValue(tokenAddress)
      ? 90000
      : 21000
    : 1;
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
  let highNum = Number(feeObj.high.amount);
  let highObj = getEthGasFeeSub(highNum, multiplier, minumNum, true);
  if (highObj.rValue) {
    feeObj.high.amount = highObj.rValue;
    highObj.rValue = null;
  }
  let v = {
    min: minumNum.toFixed(minumNum.decimalPlaces()),
    low: {
      ...feeObj.low,
      amountUi: lowObj.amountUi,
      lessThenMin: lowObj.lessThenMin,
    },
    medium: {
      ...feeObj.medium,
      amountUi: mediumObj.amountUi,
      lessThenMin: mediumObj.lessThenMin,
    },
    high: {
      ...feeObj.high,
      amountUi: highObj.amountUi,
      lessThenMin: highObj.lessThenMin,
    },
  };
  return v;
}
export function isFeeDifferent(currency, tokenAddress) {
  if (currency == Coin.ETH && hasValue(tokenAddress)) {
    return true;
  }
  if (currency == Coin.BSC) {
    return true;
  }
  return false;
}
export function getEstimateFee(currency, tokenAddress, fee) {
  switch (currency) {
    case Coin.BTC:
      return BigNumber(0.001);
    case Coin.ETH:
    case Coin.BSC:
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
export function getFeeDescI18n(rawText) {
  try {
    let bIndex = rawText.indexOf(' blocks');
    if (bIndex == -1) {
      return rawText;
    }
    let toIndex = rawText.lastIndexOf(' to ');
    let wIndex = rawText.lastIndexOf('within ');
    let obj = {
      start: rawText.substring(wIndex + 7, toIndex),
      end: rawText.substring(toIndex + 4, bIndex),
    };
    return I18n.t('fee_desc_block_template', obj);
  } catch (e) {
    return rawText;
  }
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
export function animateSwitchPin(animPinInput, forward, v1 = 1, v2 = 0) {
  Animated.timing(animPinInput, {
    toValue: forward ? v1 : v2,
    easing: Easing.out(Easing.exp),
    duration: ANIM_SWITCH_DURATION,
    useNativeDriver: true,
  }).start();
}
export function animateSwitchPinWithCallback(
  animPinInput,
  forward,
  callback = () => {}
) {
  Animated.timing(animPinInput, {
    toValue: forward ? 1 : 0,
    easing: Easing.out(Easing.linear),
    duration: 400,
    useNativeDriver: true,
  }).start(callback);
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
export function getFeeUnit(wallet, currencies) {
  if (hasValue(wallet.tokenAddress)) {
    let parentCurrency = getParentCurrency(wallet, currencies);
    if (parentCurrency == null) {
      return wallet.currencySymbol;
    }
    return parentCurrency.symbol;
  }
  return wallet.currencySymbol;
}
export function getParentCurrency(wallet, currencies) {
  if (!wallet || !currencies) {
    return null;
  }
  const r = currencies.filter(
    c => wallet.currency === c.currency && !c.tokenAddress
  );
  if (r.length > 0) {
    return r[0];
  }
  return null;
}
export function getFeeNote(currency, tokenAddress) {
  return hasValue(tokenAddress) && isETHForkChain(currency)
    ? ` (${I18n.t('estimated')})`
    : '';
}
export function isETHForkChain(currency) {
  return (
    Coin.ETH ||
    Coin.BSC ||
    Coin.CPSC ||
    Coin.MATIC ||
    Coin.HECO ||
    Coin.OKT ||
    Coin.OPTIMISM ||
    Coin.XDAI ||
    Coin.ARBITRUM ||
    Coin.FTM ||
    Coin.CELO ||
    Coin.PALM ||
    Coin.ONE ||
    Coin.AVAXC ||
    Coin.TT ||
    Coin.KUB ||
    Coin.KOVAN
  );
}
export function animateFadeIn(animOpacity, toValue, duration, callback) {
  Animated.timing(animOpacity, {
    toValue: toValue,
    duration: duration,
    useNativeDriver: true,
  }).start(callback);
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
  let r = {
    valid: false,
    address: null,
    chainId: null,
    message: null,
    uri: str,
  };
  try {
    let arr = str.split(CBO_SEPARATOR);
    if (arr.length == 3) {
      r.address = arr[0];
      r.chainId = parseInt(arr[1]);
      r.uri = arr[2];
      str = arr[2];
    }
  } catch (e) {
    console.error(error);
  }
  const pathStart = str.indexOf(':');
  const pathEnd = str.indexOf('?') !== -1 ? str.indexOf('?') : undefined;
  const protocol = str.substring(0, pathStart);
  const path = str.substring(pathStart + 1, pathEnd);
  if (protocol != 'wc') {
    r.message = 'URI format is invalid';
    return r;
  }
  let values = path.split('@');
  let handshakeTopic = values[0];
  if (!handshakeTopic) {
    r.message = 'Invalid or missing handshakeTopic parameter value';
    return r;
  }
  const queryString = typeof pathEnd !== 'undefined' ? str.substr(pathEnd) : '';
  if (queryString == '') {
    r.message = 'Missing queryString';
    return r;
  }
  let result = parseQueryString(queryString);
  if (!result.bridge) {
    r.message = 'Invalid or missing bridge url parameter value';
    return r;
  }
  if (!result.key) {
    r.message = 'Invalid or missing key parameter value';
    return r;
  }
  r.valid = true;
  return r;
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

export function getLoginBgSvg(width, height) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
        <linearGradient id="lzto6nboub" x1="0%" x2="103.498%" y1="50%" y2="50%">
            <stop offset="0%" stop-color="#141E41"/>
            <stop offset="100%" stop-color="#050919"/>
        </linearGradient>
        <linearGradient id="cjk753z2vc" x1="0%" x2="103.498%" y1="50%" y2="50%">
            <stop offset="0%" stop-color="#141E41"/>
            <stop offset="100%" stop-color="#050919"/>
        </linearGradient>
        <path id="o6ul1opjja" d="M101 1.617H476V813.617H101z"/>
    </defs>
    <g fill="none" fill-rule="evenodd">
        <g>
            <g>
                <g transform="translate(0 1) translate(-101 -2) translate(0 .383)">
                    <use fill="#09102A" fill-rule="nonzero" xlink:href="#o6ul1opjja"/>
                    <path fill="url(#lzto6nboub)" fill-rule="nonzero" d="M165.663 2L330 2 164.337 ${height} 0 ${height}z"/>
                    <path fill="url(#cjk753z2vc)" fill-rule="nonzero" d="M276.663 2L633.663 1.617 468 ${height} 111 ${height}z"/>
                    <path fill="url(#cjk753z2vc)" fill-rule="nonzero" d="M492.663 2L849.663 1.617 684 ${height} 327 ${height}z"/>
                </g>
            </g>
        </g>
    </g>
</svg>`;
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
export function getInfoSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <g fill="none" fill-rule="evenodd">
        <g fill="${color}" fill-rule="nonzero">
            <g>
                <g>
                    <g>
                        <path d="M8 1c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7zm0 9c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1zm0-5.5c-.552 0-1 .448-1 1v2l.007.117c.057.497.48.883.993.883.552 0 1-.448 1-1v-2l-.007-.117C8.936 4.886 8.513 4.5 8 4.5z" transform="translate(-24 -629) translate(16 619) translate(8 8) translate(0 2)"/>
                    </g>
                </g>
            </g>
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
export function renderTabBar(theme, _scrollX, onPress) {
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
          onPressHandler={pageObj => {
            onPressHandler(pageObj);
            if (onPress) {
              onPress(page);
            }
          }}
          onTabLayout={onTabLayout}
          styles={interpolators[page]}
        />
      )}
    />
  );
}

export function renderTabBar2(theme, _scrollX, onPress, isTabActiveFunc) {
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
          isTabActive={isTabActiveFunc(page)}
          onPressHandler={pageObj => {
            onPressHandler(pageObj);
            if (onPress) {
              onPress(page);
            }
          }}
          onTabLayout={onTabLayout}
          styles={interpolators[page]}
        />
      )}
    />
  );
}

export function getSuccessSvg() {
  return `<svg width="60" height="60" viewBox="0 0 60 60">
    <g fill="none" fill-rule="evenodd">
        <g>
            <g>
                <g transform="translate(-158 -135) translate(16 135) translate(142)">
                    <g>
                        <path fill-rule="nonzero" d="M0 0H28V28H0z" transform="translate(16 16)"/>
                        <path fill="#23BC84" d="M26.01 6.89c.574.524.65 1.39.197 2.001l-.098.119-10.925 12c-.56.615-1.504.651-2.11.108l-.109-.108-5.074-5.573c-.558-.612-.513-1.561.1-2.119.573-.523 1.443-.516 2.01-.009l.108.108 3.965 4.355L23.891 6.99c.558-.612 1.506-.657 2.119-.1zM4 13.31l.11.107 5.074 5.573c.557.613.513 1.561-.1 2.12-.574.522-1.444.516-2.01.008l-.109-.108-5.074-5.573c-.558-.612-.513-1.561.1-2.119.535-.488 1.328-.515 1.892-.104L4 13.31zm16.282-6.718c.574.523.65 1.39.197 2l-.098.12-4.712 5.175c-.558.613-1.507.657-2.12.1-.574-.523-.649-1.39-.196-2l.097-.12 4.713-5.176c.558-.612 1.506-.657 2.119-.099z" transform="translate(16 16)"/>
                    </g>
                    <circle cx="30" cy="30" r="28" fill-rule="nonzero" stroke="#FFF" stroke-width="2"/>
                </g>
            </g>
        </g>
    </g>
</svg>`;
}

export function getTopRightMarkerSvg() {
  return `<svg width="28" height="28" viewBox="0 0 28 28">
    <g fill="none" fill-rule="evenodd">
        <g>
            <g>
                <g>
                    <g>
                        <path fill="#24bcd0" fill-rule="nonzero" d="M2 0L28 0 28 26z" transform="translate(-331 -194) translate(0 166) translate(16 28) translate(315)"/>
                        <g stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path d="M0.6 3.478L2.82 5.8 7.6 0.8" transform="translate(-331 -194) translate(0 166) translate(16 28) translate(315) translate(16 4)"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>`;
}
