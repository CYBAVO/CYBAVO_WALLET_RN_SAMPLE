import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  StyleSheet,
  View,
  Dimensions,
  Keyboard,
  ScrollView,
  Platform,
  Animated,
  Share,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

import { TextInput as PaperInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { useAppState } from '@react-native-community/hooks';
import { Container, Content } from 'native-base';
const { width, height } = Dimensions.get('window');
const HEADER_EXPANDED_HEIGHT = 220;
const HEADER_COLLAPSED_HEIGHT = 56;
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { startColors, endColors, Theme } from '../styles/MainTheme';
import {
  AUTH_TYPE_BIO,
  AUTH_TYPE_OLD,
  AUTH_TYPE_SMS,
  ASK_USE_SMS_ERROR_CODE,
  CLEAR_ICON,
  Coin,
  COOL_TIME,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
  SCAN_ICON,
  sliderInnerWidth,
  sliderOuterWidth,
} from '../Constants';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import BackgroundImage from '../components/BackgroundImage';
import { Wallets, WalletSdk } from '@cybavo/react-native-wallet-service';
import { CardPatternImg } from '../components/CurrencyIcon';
import InputPinCodeModal from './InputPinCodeModal';
import InputPinSmsModal from './InputPinSmsModal';

import {
  checkCameraPermission,
  effectiveBalance,
  focusInput,
  focusNext,
  getAvailableBalance,
  getEstimateFee,
  getExchangeAmount,
  getRankSvg,
  getTopRightMarkerSvg,
  getWalletKey,
  getWalletKeyByWallet,
  hasMemo,
  hasValue,
  isErc20,
  isValidEosAccount,
  sleep,
  toastError,
} from '../Helpers';
import Headerbar from '../components/Headerbar';
import {
  withTheme,
  Text,
  ActivityIndicator,
  Surface,
  IconButton,
} from 'react-native-paper';
import AssetPicker from '../components/AssetPicker';
import RoundButton2 from '../components/RoundButton2';
import CompoundTextInput from '../components/CompoundTextInput';
import BalanceTextLite from '../components/BalanceTextLite';
import BottomActionMenu from '../components/BottomActionMenu';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { BigNumber } from 'bignumber.js';
import { fetchFee, stopFetchFee } from '../store/actions/fee';
import {
  BIO_SETTING_USE_SMS,
  startFetchFee,
  updateBioSetting,
} from '../store/actions';
import NavigationService from '../NavigationService';
import DegreeSelecter from '../components/DegreeSelecter';
const paddingBottom = {
  ios: 220 * (height / 667),
  android: 0,
};

const WithdrawScreen: () => React$Node = ({ theme }) => {
  const appState = useAppState();
  const dispatch = useDispatch();
  const [transparent, setTransparent] = useState(true);
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const scrollView = useRef();
  const [scrollY] = useState(new Animated.Value(0));
  const w = useNavigationParam('wallet');
  const [wallet, setWallet] = useState(w);
  const onComplete = useNavigationParam('onComplete');
  const { navigate, goBack } = useNavigation();
  const exchangeCurrency = useSelector(
    state => state.currencyPrice.exchangeCurrency
  );

  const time = useSelector(state => state.clock.time);
  const lastRequestSmsTime = useSelector(
    state => state.clock.lastRequestSmsTime
  );
  const countDown = COOL_TIME - (time - lastRequestSmsTime);
  const inCoolTime = countDown > 0;

  const fee = useSelector(state => {
    if (!state.fee.fee[wallet.currency]) {
      return {};
    }
    if (result != null && result.type == TYPE_CONFIRM) {
      if (
        result.transactionFee != null &&
        state.fee.fee[wallet.currency].data[result.selectedFee].amount !=
          result.transactionFee.amount
      ) {
        setResult(null);
        if (scrollView.current) {
          scrollView.current.scrollTo({ y: 0, animated: true });
        }
      }
    }
    return state.fee.fee[wallet.currency];
  });
  const currencyPrice = useSelector(
    state => state.currencyPrice.currencyPrice || {}
  );
  const balances = useSelector(state => state.balance.balances || {});
  const wallets = useSelector(state => state.wallets.wallets);
  const recentSet = useSelector(state => {
    if (state.transactions.transactions == null) {
      return new Set();
    }
    var data = [];
    let byWalletTxs = Object.values(state.transactions.transactions);
    for (let i = 0; i < byWalletTxs.length; i++) {
      if (byWalletTxs[i].latestTx == null) {
        continue;
      }
      data = data.concat(byWalletTxs[i].latestTx);
    }
    data.sort((a, b) => b.timestamp - a.timestamp);
    return data.length > 5
      ? new Set(data.slice(0, 5).map(item => item.address))
      : new Set(data.map(item => item.address));
  });

  if (!wallet) {
    console.warn('No wallet/transaction specified');
    goBack();
  }
  const balanceItem = useSelector(state => {
    let balances = state.balance.balances || {};
    // let b = balances[getWalletKeyByWallet(wallet)];
    // b.tokens = ['4'];
    // return b;
    return balances[getWalletKeyByWallet(wallet)];
  });
  const feeUnit = useSelector(state => {
    if (isErc20(wallet)) {
      return 'ETH';
    }
    return '';
  });
  const feeNote = isErc20(wallet) ? ` (${I18n.t('estimated')})` : '';
  const balanceTextForFee = useSelector(state => {
    if (isErc20(wallet)) {
      let balances = state.balance.balances || {};
      return getAvailableBalance(
        balances[getWalletKeyByWallet(state.wallets.ethWallet)]
      );
    }
    return null;
  });
  const ACTION_WITHDRAW = 'withdraw';
  const ACTION_SECURE_TOKEN = 'secure_token';

  const qrCode = useNavigationParam('qrCode');
  const [showMenu1, setShowMenu1] = useState(false);
  const [receiver, setReceiver] = useState(qrCode);
  const [estimateResult, setEstimateResult] = useState(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFee, setSelectedFee] = useState('high');
  const [selectedTokenId, setSelectedTokenId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [iosImeHeight, setiosImeHeight] = useState(0);
  const [receiverError, setReceiverError] = useState(null);
  const [amountError, setAmountError] = useState(null);
  const [tokenIdError, setTokenIdError] = useState(null);
  const [result, setResult] = useState(null);
  useEffect(() => {
    focusInput(refs, hasValue(qrCode) ? 1 : 0);
  }, [qrCode]);
  const _submit = () => {
    let r = _trimReceiver(receiver);
    setReceiver(r);
    let amountCheck = _checkAmount(amount, selectedFee);
    let tokenIdCheck = _checkTokenId();
    let receiverCheck = _checkReceiver(r);
    if (!amountCheck || !receiverCheck || !tokenIdCheck) {
      if (scrollView.current) {
        scrollView.current.scrollTo({ y: 0, animated: true });
      }
      return;
    }
    _estimateTransaction();
  };
  const _hasTransactionFee = () => {
    return fee != null && fee.data != null;
  };
  const _setReceiver = value => {
    let r = _trimReceiver(value);
    setReceiver(r);
    setTimeout(() => {
      if (_checkReceiver(r)) {
        focusInput(refs, 1);
      } else {
        focusInput(refs, 0);
      }
    }, 500);
  };
  const _goScan = async () => {
    if (await checkCameraPermission()) {
      NavigationService.navigate('scanModal', {
        onResult: _setReceiver,
        modal: true,
      });
    }
  };
  const _trimReceiver = value => {
    if (value) {
      value = value.replace(
        new RegExp('^(ethereum:|bitcoin:|bitcoincase:|bitcoin-sv:)', 'g'),
        ''
      );
    }
    return value;
  };
  const _checkReceiver = value => {
    if (!hasValue(value)) {
      setReceiverError(
        I18n.t('error_input_empty', { label: I18n.t('to_address') })
      );
      return false;
    }
    if (Coin.EOS != wallet.currency || isValidEosAccount(value)) {
      setReceiverError(null);
      return true;
    }
    setReceiverError(I18n.t('error_eos_receiver'));
    return false;
  };
  const _onReceiverChanged = value => {
    setReceiver(value);
    if (receiverError) {
      _checkReceiver(value);
    }
  };
  const _onAmountChanged = value => {
    if (wallet.isFungible) {
      return true;
    }
    let floatValue = parseFloat(value);
    let matchDot = value.match(/\./g) || [];
    if (
      isNaN(floatValue) ||
      matchDot.length == 1 ||
      (value.match(/0$/g) && floatValue != 0)
    ) {
      setAmount(value);
      if (amountError) {
        _checkAmountLiteral(value);
      }
    } else {
      setAmount(floatValue.toString());
      if (amountError) {
        _checkAmountNumerical(floatValue, selectedFee);
      }
    }
  };
  const _checkAmountLiteral = value => {
    if (!hasValue(value)) {
      setAmountError(I18n.t('error_input_empty', { label: I18n.t('amount') }));
      return false;
    }
    setAmountError(null);
    return true;
  };
  const _checkAmountNumerical = (value, selectedFee) => {
    if (isNaN(value)) {
      setAmountError(I18n.t('error_input_nan', { label: I18n.t('amount') }));
      return false;
    }
    let balance = getAvailableBalance(balanceItem);
    const feeStr = _hasTransactionFee() ? fee.data[selectedFee].amount : '0';
    if (balance) {
      let balanceNum = Number(balance);
      let b = new BigNumber(balanceNum);
      let f = getEstimateFee(wallet.currency, wallet.tokenAddress, feeStr);
      console.debug(
        `_checkAmountNumerical estimate:${f.toFixed(f.decimalPlaces())}`
      );
      let v = new BigNumber(value);
      if (b.isZero() || v.isGreaterThan(b)) {
        setAmountError(I18n.t('error_fund_insufficient'));
        return false;
      } else if (balanceTextForFee != null) {
        let balanceNumForFee = Number(balanceTextForFee);
        let bForFee = new BigNumber(balanceNumForFee);
        if (bForFee.isZero() || f.isGreaterThan(bForFee)) {
          setAmountError(
            I18n.t('error_insufficient_to_cover_transaction_fee_template', {
              name: feeUnit,
              balance: balanceTextForFee,
            })
          );
          return false;
        }
      } else if (v.plus(f).isGreaterThan(b)) {
        setAmountError(
          I18n.t('error_fund_insufficient_to_cover_transaction_fee')
        );
        return false;
      }
    }
    //TODO
    setAmountError(null);
    return true;
  };

  const _checkAmount = (value, selectedFee) => {
    if (wallet.isFungible) {
      return true;
    }
    if (!_checkAmountLiteral(value)) {
      return false;
    }
    let floatValue = parseFloat(value);
    return _checkAmountNumerical(floatValue, selectedFee);
  };
  const _checkTokenId = () => {
    if (!wallet.isFungible) {
      return true;
    }
    if (balanceItem && balanceItem.tokens && balanceItem.tokens.length > 0) {
      setTokenIdError(null);
      return true;
    }
    setTokenIdError(I18n.t('error_fund_insufficient'));
    return false;
  };
  const _estimateTransaction = async () => {
    const transactionFee = _hasTransactionFee() ? fee.data[selectedFee] : null;
    setLoading(true);
    try {
      let {
        tranasctionAmout,
        platformFee,
        blockchainFee,
      } = await Wallets.estimateTransaction(
        wallet.currency,
        wallet.tokenAddress,
        amount,
        transactionFee ? transactionFee.amount : '0'
      );
      let estimate = {};
      if (tranasctionAmout && tranasctionAmout !== '0') {
        estimate.amount = tranasctionAmout;
      }
      let unit = '';
      let exchangeBlockchainFee = '';
      //for ERC20
      if (isErc20(wallet)) {
        unit = ` ${feeUnit}`;
        exchangeBlockchainFee = `≈ ${exchangeCurrency} \$${getExchangeAmount(
          blockchainFee,
          3,
          { currency: 60, tokenAddress: '' },
          exchangeCurrency,
          currencyPrice
        )}`;
      } else {
        unit = wallet.isFungible ? '' : ` ${wallet.currencySymbol}`;
        exchangeBlockchainFee = `≈ ${exchangeCurrency} \$${getExchangeAmount(
          blockchainFee,
          3,
          wallet,
          exchangeCurrency,
          currencyPrice
        )}`;
      }
      if (platformFee && platformFee !== '0') {
        estimate.platformFee = `${platformFee} ${wallet.currencySymbol}`;
        estimate.exchangePlatformFee = `≈ ${exchangeCurrency} \$${getExchangeAmount(
          platformFee,
          3,
          wallet,
          exchangeCurrency,
          currencyPrice
        )}`;
      }
      if (blockchainFee && blockchainFee !== '0') {
        estimate.blockchainFee = `${blockchainFee}${unit}${feeNote}`;
        estimate.exchangeBlockchainFee = `${exchangeBlockchainFee}`;
      }
      setEstimateResult(estimate);
      setResult({
        type: TYPE_CONFIRM,
        title: I18n.t('confirm_send_currency', wallet),
        transactionFee: transactionFee,
        selectedFee: selectedFee,
      });
    } catch (error) {
      setEstimateResult(null);
      console.log('Wallets.estimateTransaction failed', error.message);
      setResult({
        type: TYPE_FAIL,
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
        title: I18n.t('transaction_failed'),
      });
    }
    setLoading(false);
  };
  const _createTransaction = async (pinSecret, type, actionToken, code) => {
    const transactionFee = _hasTransactionFee() ? fee.data[selectedFee] : null;
    let extras = {};
    if (hasMemo(wallet)) {
      extras = {
        ...extras,
        memo,
      };
    }
    setLoading(true);
    try {
      let result;
      switch (type) {
        case AUTH_TYPE_SMS:
          result = await Wallets.createTransactionSms(
            actionToken,
            code,
            wallet.walletId,
            receiver,
            amount,
            transactionFee ? transactionFee.amount : '0',
            description,
            pinSecret,
            extras
          );

          break;
        case AUTH_TYPE_BIO:
          await sleep(1000); // wait InputPinSms dismiss
          result = await Wallets.createTransactionBio(
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            wallet.walletId,
            receiver,
            amount,
            transactionFee ? transactionFee.amount : '0',
            description,
            pinSecret,
            extras
          );
          break;
        case AUTH_TYPE_OLD:
          result = await Wallets.createTransaction(
            wallet.walletId,
            receiver,
            amount,
            transactionFee ? transactionFee.amount : '0',
            description,
            pinSecret,
            extras
          );
          break;
      }
      setResult({ type: TYPE_SUCCESS, title: I18n.t('transaction_complete') });
    } catch (error) {
      console.log(
        'Wallets.createTransaction failed',
        error.code,
        error.message
      );
      if (error.code == 185) {
        //Biometrics setting not found
        let msg = I18n.t('error_msg_185_retry');
        try {
          await Wallets.registerPubkey();
          await Wallets.updateDeviceInfo();
        } catch (err) {
          let msg2 =
            err.code && err.code > 0
              ? I18n.t(`error_msg_${err.code}`)
              : err.message;
          msg = `${msg}|${msg2}`;
        }
        setResult({
          type: TYPE_FAIL,
          error: msg,
          title: I18n.t('transaction_failed'),
          useSms:
            type == AUTH_TYPE_BIO &&
            ASK_USE_SMS_ERROR_CODE.includes(error.code),
        });
        setLoading(false);
        return;
      }
      if (error.code != -7) {
        //Operation Cancelled
        setResult({
          type: TYPE_FAIL,
          error:
            error.code && error.code > 0
              ? I18n.t(`error_msg_${error.code}`)
              : error.message,
          title: I18n.t('transaction_failed'),
          useSms:
            type == AUTH_TYPE_BIO &&
            ASK_USE_SMS_ERROR_CODE.includes(error.code),
        });
      }
    }
    setLoading(false);
  };
  const _updateKeyboardSpace = (frames: Object) => {
    console.log('_updateKeyboardSpace: ', frames);
    setiosImeHeight(frames.endCoordinates.height);
  };

  const _resetKeyboardSpace = (frames: Object) => {
    console.log('_resetKeyboardSpace');
    setiosImeHeight(0);
  };
  const _getAvailableBalanceText = () => {
    let value = getAvailableBalance(balanceItem);
    if (hasValue(value)) {
      return `${I18n.t('available_balance')} ${value} ${wallet.currencySymbol}`;
    }
    return null;
  };

  useEffect(() => {
    if (appState == 'active') {
      dispatch(startFetchFee(wallet.currency));
    } else if (appState === 'background') {
      dispatch(stopFetchFee());
    }
  }, [appState]);
  useEffect(() => {
    dispatch(stopFetchFee());
    dispatch(startFetchFee(wallet.currency));
    return () => {
      dispatch(stopFetchFee());
    };
  }, [wallet]);
  useEffect(() => {
    _checkTokenId();
  }, [selectedTokenId]);

  const _getDeductedAmountText = currencySymbol => {
    let value = Number(amount);
    if (isNaN(amount)) {
      value = 0;
    }
    const feeStr =
      _hasTransactionFee() && fee[selectedFee] ? fee[selectedFee].amount : '0';
    let v = new BigNumber(value);
    let f = getEstimateFee(wallet.currency, wallet.tokenAddress, feeStr);
    console.debug(
      `_getDeductedAmount estimate:${f.toFixed(f.decimalPlaces())}`
    );
    if (balanceTextForFee == null) {
      let r = v.plus(f);
      return `${r.toFixed(r.decimalPlaces())} ${currencySymbol}`;
    } else {
      return `${v.toFixed(v.decimalPlaces())} ${currencySymbol}, ${f.toFixed(
        f.decimalPlaces()
      )} ${feeUnit}${feeNote}`;
    }
  };
  const _getSecondaryConfigByStatus = detail => {
    if (result.type === TYPE_CONFIRM) {
      return {
        color: theme.colors.primary,
        text: I18n.t('cancel'),
        onClick: () => {
          setResult(null);
        },
      };
    } else if (result.type === TYPE_SUCCESS) {
      return {
        color: theme.colors.primary,
        text: I18n.t('notify_receiver'),
        onClick: () => {
          if (estimateResult) {
            if (estimateResult.platformFee) {
              detail.other = `\n${I18n.t('platform_fee')}: ${
                estimateResult.platformFee
              }`;
            }
            if (estimateResult.blockchainFee) {
              detail.other += `\n${I18n.t('blockchain_fee')}: ${
                estimateResult.blockchainFee
              }`;
            }
            if (memo) {
              detail.other += `\n${I18n.t('memo')}: ${memo}`;
            }
            if (description) {
              detail.other += `\n${I18n.t('description')}: ${description}`;
            }
          }
          Share.share({
            title: I18n.t('notify_receiver'),
            message: detail.isFungible
              ? I18n.t('share_transaction_tokenid_template', detail)
              : I18n.t('share_transaction_template', detail),
          }).catch(console.error);
        },
      };
    } else if (result.type === TYPE_FAIL && result.useSms) {
      return {
        color: theme.colors.primary,
        text: I18n.t('use_sms_temp'),
        onClick: () => {
          dispatch(updateBioSetting(BIO_SETTING_USE_SMS));
          setResult(null);
        },
      };
    } else {
      return null;
    }
  };
  const title = `${I18n.t('send')} ${wallet.currencySymbol}`;
  return (
    <Container
      style={[Styles.bottomContainer, { justifyContent: 'space-between' }]}>
      {Platform.OS == 'android' && (
        <Animated.View //walkaround for headerbar's background
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            elevation: 1,
            opacity: scrollY.interpolate({
              inputRange: [0, 148],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          }}>
          <SafeAreaView
            style={{
              height: HEADER_COLLAPSED_HEIGHT + 20,
              width: width,
              backgroundColor: theme.colors.background,
            }}
          />
        </Animated.View>
      )}

      <Headerbar
        transparent={transparent}
        title={title}
        onBack={() => goBack()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          elevation: 5,
          zIndex: 5,
        }}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        ref={scrollView}
        bounces={false}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollY,
                },
              },
            },
          ],
          {
            listener: event => {
              const offsetY = event.nativeEvent.contentOffset.y;
              if (Platform.OS == 'android') {
                return;
              }
              if (offsetY > 142) {
                setTransparent(false);
              } else {
                setTransparent(true);
              }
            },
          }
        )}
        scrollEventThrottle={16}>
        <BackgroundImage
          containerStyle={Styles.detailBackgroundImage}
          imageStyle={Styles.detailCardPattern}
          imageSource={CardPatternImg}
          startColor={startColors[wallet.currencySymbol] || startColors.UNKNOWN}
          endColor={endColors[wallet.currencySymbol] || endColors.UNKNOWN}>
          <Animated.View
            style={{
              // height:
              //   Platform.OS == 'ios'
              //     ? null
              //     : scrollY.interpolate({
              //         inputRange: [
              //           0,
              //           HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT,
              //         ],
              //         outputRange: [HEADER_EXPANDED_HEIGHT, 0],
              //         extrapolate: 'clamp',
              //       }),
              opacity: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            }}>
            <SafeAreaView
              style={{ marginTop: HEADER_COLLAPSED_HEIGHT, width: width }}
            />
            <View style={[Styles.numContainer]}>
              <AssetPicker
                rawData={wallets}
                recentSet={recentSet}
                initSelected={wallet}
                clickItem={item => {
                  setWallet(item);
                  setAmountError(null);
                }}
                getBalanceText={item => {
                  let key = getWalletKeyByWallet(item);
                  let balance = effectiveBalance(balances[key], '');
                  return balance;
                }}
              />
            </View>
            <BalanceTextLite
              textStyle={[
                Styles.mainNumText,
                Theme.fonts.default.heavy,
                { marginTop: 5 },
              ]}
              balanceItem={balanceItem}
            />
            <Text style={[styles.balanceLabel, Theme.fonts.default.regular]}>
              {I18n.t('balance')}
            </Text>
          </Animated.View>
        </BackgroundImage>
        <Content
          contentContainerStyle={{
            flexDirection: 'column',
            alignItems: 'stretch',
            paddingHorizontal: 16,
            backgroundColor: theme.colors.background,
            paddingBottom: paddingBottom[Platform.OS || 'android'], // need to make a distance from bottom, to fix abnormal move while focus next TextInput on iOS
          }}>
          <Text style={Styles.labelBlock}>{I18n.t('to_address')}</Text>
          <CompoundTextInput
            ref={refs[0]}
            onSubmitEditing={() => {
              focusNext(refs, 0);
            }}
            style={Styles.compoundInput}
            value={receiver}
            maxLength={Coin.EOS != wallet.currency ? null : 12}
            autoCapitalize="none"
            keyboardType="email-address"
            underlineColor={Theme.colors.normalUnderline}
            hasError={hasValue(receiverError)}
            onChangeText={_onReceiverChanged}
            // onBlur={() => _checkReceiver(receiver)}
            errorMsg={receiverError}
            goScan={_goScan}
            placeholder={I18n.t('to_address_placeholder')}
            onClear={() => {
              setReceiver('');
            }}
          />
          <Text style={Styles.labelBlock}>
            {wallet.isFungible ? I18n.t('token_id') : I18n.t('transfer_amount')}
          </Text>
          {wallet.isFungible ? (
            <>
              <BottomActionMenu
                visible={showMenu1}
                currentSelect={selectedTokenId}
                title={I18n.t('token_id')}
                scrollEnabled={true}
                data={
                  balanceItem && balanceItem.tokens ? balanceItem.tokens : []
                }
                onClick={() => {
                  setShowMenu1(true);
                }}
                onCancel={() => {
                  setShowMenu1(false);
                }}
                onChange={value => {
                  setSelectedTokenId(value);
                  setShowMenu1(false);
                }}
                containerStyle={{
                  flex: null,
                  marginHorizontal: 16,
                  marginTop: 10,
                  paddingHorizontal: 10,
                  justifyContent: 'space-between',
                }}
              />
              <Text style={[Styles.inputError, { marginHorizontal: 16 }]}>
                {tokenIdError}
              </Text>
            </>
          ) : (
            <CompoundTextInput
              ref={refs[1]}
              // onSubmitEditing={() => {
              //   focusNext(refs, 1);
              // }}
              style={Styles.compoundInput}
              value={amount}
              maxLength={21}
              autoCapitalize="none"
              keyboardType="numeric" //it's OK that use numeric then not trigger onSubmitEditing on iOS
              underlineColor={Theme.colors.normalUnderline}
              hasError={hasValue(amountError)}
              onChangeText={_onAmountChanged}
              onBlur={() => _checkAmount(amount, selectedFee)}
              errorMsg={amountError}
              placeholder={I18n.t('amount_placeholder')}
              onClear={() => {
                setAmount('');
              }}
              convertText={
                wallet.isFungible
                  ? null
                  : `≈ ${exchangeCurrency} \$${getExchangeAmount(
                      amount,
                      3,
                      wallet,
                      exchangeCurrency,
                      currencyPrice,
                      '0.000'
                    )}`
              }
              availableBalance={_getAvailableBalanceText()}
              onPressAvailableBalance={() => {
                let valueText = getAvailableBalance(balanceItem);
                let value = Number(valueText);
                const feeStr = _hasTransactionFee()
                  ? fee.data[selectedFee].amount
                  : '0';
                if (isNaN(value)) {
                  setAmount(valueText);
                  return;
                }
                let f = getEstimateFee(
                  wallet.currency,
                  wallet.tokenAddress,
                  feeStr
                );
                console.debug(
                  `onPressAvailableBalance estimate:${f.toFixed(
                    f.decimalPlaces()
                  )}`
                );
                let v = BigNumber(value);
                let r = balanceTextForFee == null ? v.minus(f) : v;
                if (r.isNegative()) {
                  setAmount(valueText);
                  _checkAmount(valueText, selectedFee);
                } else {
                  let str = r.toFixed(r.decimalPlaces());
                  setAmount(str);
                  _checkAmount(str, selectedFee);
                }
              }}
            />
          )}
          {hasMemo(wallet) && (
            <>
              <Text style={Styles.labelBlock}>{I18n.t('memo')}</Text>
              <CompoundTextInput
                ref={refs[2]}
                onSubmitEditing={() => {
                  focusNext(refs, 2);
                }}
                style={Styles.compoundInput}
                value={memo}
                autoCapitalize="none"
                underlineColor={Theme.colors.normalUnderline}
                hasError={false}
                onChangeText={memo => setMemo(memo)}
                placeholder={I18n.t('memo_placeholder')}
                onClear={() => {
                  setMemo('');
                }}
              />
            </>
          )}

          {_hasTransactionFee() && (
            <>
              <Text style={[Styles.labelBlock, { marginBottom: 8 }]}>
                {I18n.t('blockchain_fee')}
              </Text>
              <DegreeSelecter
                itemStyle={Styles.block}
                getValue={(item = {}) => `${item.amount} ${feeUnit}`}
                valueObj={fee.data}
                reserveErrorMsg={false}
                outerWidth={sliderOuterWidth[Platform.OS || 'android']}
                innerWidth={sliderInnerWidth[Platform.OS || 'android']}
                style={{}}
                labels={[I18n.t('slow'), I18n.t('medium'), I18n.t('fast')]}
                onSelect={value => {
                  setSelectedFee(value);
                  _checkAmount(amount, value);
                }}
              />
            </>
          )}
          <Text style={Styles.labelBlock}>{I18n.t('description')}</Text>
          <CompoundTextInput
            ref={refs[3]}
            style={Styles.compoundInput}
            value={description}
            autoCapitalize="none"
            underlineColor={Theme.colors.normalUnderline}
            hasError={false}
            onChangeText={description => setDescription(description)}
            placeholder={I18n.t('description_placeholder')}
            onClear={() => {
              setDescription('');
            }}
            onSubmitEditing={() => {
              refs[3].current.blur();
              if (scrollView.current) {
                scrollView.current.scrollToEnd();
              }
              // _submit();
            }}
          />
        </Content>
      </ScrollView>
      <View
        style={{
          marginTop: 7,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={styles.inputFinalHint}>{`${I18n.t(
          'deducted_amount'
        )} ${_getDeductedAmountText(wallet.currencySymbol)}`}</Text>

        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          disable={fee.data == null}
          style={[
            //only show disabled style but still can press, so that can do check, mainly for Android
            Styles.bottomButton,
            { opacity: receiverError || amountError || tokenIdError ? 0.6 : 1 },
          ]}
          labelStyle={[
            { color: theme.colors.text, fontSize: ROUND_BUTTON_FONT_SIZE },
          ]}
          onPress={() => _submit()}>
          {I18n.t('send')}
        </RoundButton2>
      </View>

      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          type={result.type}
          errorMsg={result.error}
          successButtonText={
            result.type === TYPE_CONFIRM ? I18n.t('confirm') : I18n.t('done')
          }
          full={result.type === TYPE_CONFIRM}
          detail={{
            amount: wallet.isFungible
              ? selectedTokenId
              : (estimateResult && estimateResult.amount) || amount,
            currency: wallet.currencySymbol,
            isFungible: wallet.isFungible,
            from: wallet.address,
            to: receiver,
            time: result.confirm
              ? null
              : moment().format('YYYY-MM-DD HH:mm:ss'),
            platformFee: estimateResult && estimateResult.platformFee,
            exchangePlatformFee:
              estimateResult && estimateResult.exchangePlatformFee,
            blockchainFee: estimateResult && estimateResult.blockchainFee,
            exchangeBlockchainFee:
              estimateResult && estimateResult.exchangeBlockchainFee,
            description: description,
            memo: memo,
            exchangeCurrency: exchangeCurrency,
            exchangeAmount: wallet.isFungible
              ? null
              : getExchangeAmount(
                  (estimateResult && estimateResult.amount) || amount,
                  3,
                  wallet,
                  exchangeCurrency,
                  currencyPrice
                ),
          }}
          onButtonClick={() => {
            if (result.type === TYPE_CONFIRM) {
              setResult(null);
              NavigationService.navigate('InputPinSms', {
                modal: true,
                from: 'Withdraw',
                callback: (pinSecret, type, actionToken, code) => {
                  // NavigationService.navigate('Withdraw', {});
                  _createTransaction(pinSecret, type, actionToken, code);
                },
              });
            } else if (result.type === TYPE_SUCCESS) {
              setResult(null);
              if (onComplete) {
                onComplete();
              }
              goBack();
            } else {
              if (result.onPress) {
                result.onPress();
              }
              setResult(null);
            }
          }}
          secondaryConfig={_getSecondaryConfigByStatus({
            amount: wallet.isFungible
              ? selectedTokenId
              : (estimateResult && estimateResult.amount) || amount,
            currency: wallet.currencySymbol,
            isFungible: wallet.isFungible,
            from: wallet.address,
            to: receiver,
            other: '',
            time: moment().format('YYYY-MM-DD HH:mm:ss'),
          })}
        />
      )}

      {(loading || fee.loading) && (
        <ActivityIndicator
          color={theme.colors.primary}
          size="large"
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: height / 2,
          }}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  formItemHasValue: {
    borderColor: Theme.colors.primary,
    minHeight: 80,
  },
  balanceLabel: {
    color: Theme.colors.text,
    fontSize: 12,
    opacity: 0.4,
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 2,
  },
  balanceSubText: {
    color: Theme.colors.text,
    fontSize: 16,
    maxWidth: '60%',
    fontWeight: '500',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 0,
  },
  bottomBoarderContainer: {
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 8,
    width: '100%',
  },
  inputFinalHint: {
    color: Theme.colors.text,
    fontSize: 12,
    // marginBottom: 1,
    opacity: 0.35,
    width: '90%',
  },
});
export default withTheme(WithdrawScreen);
