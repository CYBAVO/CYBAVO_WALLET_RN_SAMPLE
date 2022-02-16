import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
  Linking,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { Container, Badge, Button } from 'native-base';
const { width, height } = Dimensions.get('window');
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import {
  startColors,
  endColors,
  Theme,
  nftStartColors,
  nftEndColors,
} from '../styles/MainTheme';
import {
  ACCELERATE_SVG,
  AUTH_TYPE_BIO,
  AUTH_TYPE_OLD,
  AUTH_TYPE_SMS,
  ASK_USE_SMS_ERROR_CODE,
  BADGE_FONT_SIZE,
  CANCEL_SVG,
  noHigherFeeKeys,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
  ROUND_BUTTON_LARGE_HEIGHT,
  SMALL_ICON_SIMPLE_SIZE,
  TX_EXPLORER_URIS,
  Coin,
  nftIcons,
} from '../Constants';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import BackgroundImage from '../components/BackgroundImage';
import { Wallets } from '@cybavo/react-native-wallet-service';
import IconSvgXml from '../components/IconSvgXml';
import DisplayTime from '../components/DisplayTime';
import { CardPatternImg } from '../components/CurrencyIcon';
import CurrencyText from '../components/CurrencyText';
import {
  withTheme,
  Text,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import {
  checkAuthType,
  explorer,
  getEstimateGasFee,
  getExchangeAmount,
  getTransactionExplorerUri,
  getTransactionKey,
  getWalletKeyByWallet,
  getFeeNote,
  hasValue,
  sleep,
  getFeeUnit,
} from '../Helpers';
import RoundButton2 from '../components/RoundButton2';
import { signIn } from '../store/actions/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopDownHint from '../components/TopDownHint';
import { useClipboard } from '@react-native-community/hooks';
import ReplaceTransactionModal, {
  titleKeys,
  TYPE_CANCEL,
  TYPE_ACCELERATE,
} from '../components/ReplaceTransactionModal';
import InputPinCodeModal from './InputPinCodeModal';
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { CANCELLED } from '../store/reducers/transactions';
import ActivityLogList from '../components/ActivityLogList';
import { SvgXml } from 'react-native-svg';
import InputPinSmsModal from './InputPinSmsModal';
import NavigationService from '../NavigationService';
import { BIO_SETTING_USE_SMS, updateBioSetting } from '../store/actions';

const HEADER_EXPANDED_HEIGHT = 168;
const HEADER_COLLAPSED_HEIGHT = 56;
const TransactionDetailScreen: () => React$Node = ({ theme }) => {
  const [scrollY] = useState(new Animated.Value(0));
  const [transparent, setTransparent] = useState(true);
  const [fee, setFee] = useState({});
  const [result, setResult] = useState(null);
  const enableBiometrics = useSelector(
    state => state.user.userState.enableBiometrics
  );
  const skipSmsVerify = useSelector(
    state => state.user.userState.skipSmsVerify
  );
  const accountSkipSmsVerify = useSelector(
    state => state.user.userState.accountSkipSmsVerify
  );
  const bioSetting = useSelector(state => state.user.userState.bioSetting);
  const [loading, setLoading] = useState(false);
  const [replaceTransaction, setReplaceTransaction] = useState(null);
  const [_, setClipboard] = useClipboard();
  const [hint, setHint] = useState(null);
  const wallet = useNavigationParam('wallet');
  const paramTransaction = useNavigationParam('transaction');
  const { goBack } = useNavigation();
  const onComplete = useNavigationParam('onComplete');
  const dispatch = useDispatch();
  const key = getWalletKeyByWallet(wallet);
  const txKey = getTransactionKey(key, paramTransaction);
  const config = useSelector(state => {
    return state.auth.config;
  });
  const transaction = useSelector(state => {
    if (
      state.transactions.transactions[key] &&
      state.transactions.transactions[key].data
    ) {
      if (state.transactions.transactions[key].data[txKey]) {
        return state.transactions.transactions[key].data[txKey];
      } else if (
        state.transactions.transactions[key].nonceMap &&
        state.transactions.transactions[key].nonceMap[paramTransaction.nonce]
      ) {
        return (
          state.transactions.transactions[key].nonceMap[paramTransaction.nonce]
            .realHead || paramTransaction
        );
      }
    }
    return paramTransaction;
  });
  if (!wallet || !transaction) {
    console.warn('No wallet/transaction specified');
    goBack();
  }

  const feeUnit = useSelector(state => {
    return getFeeUnit(wallet, state.currency.currencies);
  });

  const feeNote = getFeeNote(wallet.currency, wallet.tokenAddress);
  const expolreImg = require('../assets/image/open_window.png');
  const exchangeCurrency = useSelector(
    state => state.currencyPrice.exchangeCurrency
  );
  const _copy = async (text, copiedHint) => {
    setClipboard(text);
    setHint(copiedHint);
  };
  const currencyPrice = useSelector(
    state => state.currencyPrice.currencyPrice || {}
  );
  const [confirmBlocks, setConfirmBlocks] = useState(null);
  const [replaceable, setReplaceable] = useState(true);
  const _fetchTransactionDetail = async () => {
    if (transaction.txid === '' || transaction.dropped) {
      return;
    }
    try {
      const { confirmBlocks, data } = await Wallets.getTransactionInfo(
        wallet.currency,
        transaction.txid
      );
      if (confirmBlocks == null) {
        return;
      }
      let maxBlock = 20;
      if (confirmBlocks > maxBlock) {
        setConfirmBlocks(`${maxBlock}+`);
      } else {
        setConfirmBlocks(confirmBlocks);
      }
    } catch (error) {
      console.log('Wallets.getTransactionInfo failed', error);
    }
  };
  const _replaceTransaction = async (
    type,
    pinSecret,
    bioType,
    actionToken,
    code,
    feeStr
  ) => {
    let config = {
      [TYPE_CANCEL]: {
        api: {
          [AUTH_TYPE_OLD]: Wallets.cancelTransaction,
          [AUTH_TYPE_SMS]: Wallets.cancelTransactionSms,
          [AUTH_TYPE_BIO]: Wallets.cancelTransactionBio,
        },
        i18n: 'cancel_failed',
      },
      [TYPE_ACCELERATE]: {
        api: {
          [AUTH_TYPE_OLD]: Wallets.increaseTransactionFee,
          [AUTH_TYPE_SMS]: Wallets.increaseTransactionFeeSms,
          [AUTH_TYPE_BIO]: Wallets.increaseTransactionFeeBio,
        },
        i18n: 'accelerate_failed',
      },
    };
    setLoading(true);
    try {
      let result;
      switch (bioType) {
        case AUTH_TYPE_SMS:
          result = await config[type].api[bioType](
            actionToken,
            code,
            wallet.walletId,
            transaction.txid,
            feeStr,
            pinSecret
          );
          break;
        case AUTH_TYPE_BIO:
          await sleep(1000); // wait InputPinSms dismiss
          result = await config[type].api[bioType](
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            wallet.walletId,
            transaction.txid,
            feeStr,
            pinSecret
          );
          break;
        case AUTH_TYPE_OLD:
          result = await config[type].api[bioType](
            wallet.walletId,
            transaction.txid,
            feeStr,
            pinSecret
          );
          break;
      }
      setResult({
        type: TYPE_SUCCESS,
        title: I18n.t('change_complete'),
        buttonClick: () => {
          setResult(null);
          if (onComplete) {
            onComplete();
          }
          goBack();
        },
      });
    } catch (error) {
      console.log(
        'Wallets.increaseTransactionFee failed',
        error.code,
        error.message
      );
      if (error.code == 393) {
        setReplaceable(false);
      }

      if (error.code == 185) {
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
          title: I18n.t(config[type].i18n),
          useSms:
            bioType == AUTH_TYPE_BIO &&
            ASK_USE_SMS_ERROR_CODE.includes(error.code),
          buttonClick: () => {
            setResult(null);
          },
        });
        setLoading(false);
        return;
      }
      if (error.code != -7) {
        setResult({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t(config[type].i18n),
          useSms:
            bioType == AUTH_TYPE_BIO &&
            ASK_USE_SMS_ERROR_CODE.includes(error.code),
          buttonClick: () => {
            setResult(null);
          },
        });
      }
    }
    setLoading(false);
  };
  const _fetchWithdrawInfo = async type => {
    setLoading(true);
    try {
      const rawFee = await Wallets.getTransactionFee(wallet.currency);
      if (
        rawFee != null &&
        rawFee.high != null &&
        rawFee.medium != null &&
        rawFee.low != null &&
        hasValue(rawFee.high.amount) &&
        hasValue(rawFee.medium.amount) &&
        hasValue(rawFee.low.amount)
      ) {
        let ethGasFee = await getEstimateGasFee(
          rawFee,
          wallet.currency,
          wallet.tokenAddress,
          transaction.transactionFee,
          type == TYPE_ACCELERATE ? transaction.amount : '0',
          wallet.walletId,
          transaction.fromAddress
        );
        setFee(ethGasFee);
        if (ethGasFee.high.lessThenMin) {
          setResult({
            type: TYPE_FAIL,
            error: I18n.t(noHigherFeeKeys[type]),
            title: I18n.t('no_higher_fee_title'),
            buttonClick: () => {
              setResult(null);
            },
          });
        } else {
          setReplaceTransaction(type);
        }
      } else {
        setFee(null);
      }
    } catch (error) {
      console.log('_fetchWithdrawInfo failed', error);
      setResult({
        type: TYPE_FAIL,
        error: I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        }),
        title: I18n.t('estimate_fee_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    _fetchTransactionDetail();
  }, [transaction]);

  let exchangeAmount = getExchangeAmount(
    transaction.amount,
    3,
    wallet,
    exchangeCurrency,
    currencyPrice
  );
  let exchangeTransactionFee = getExchangeAmount(
    transaction.transactionFee,
    3,
    { currency: wallet.currency, tokenAddress: '' },
    exchangeCurrency,
    currencyPrice
  );
  const _getCopyIcon = text => (
    <Image
      source={require('../assets/image/ic_copy.png')}
      style={{
        width: 16,
        height: 16,
        marginHorizontal: 9,
        marginTop: 2,
        alignSelf: 'flex-start',
      }}
    />
  );

  const decorationLine =
    transaction.replaceStatus === CANCELLED ? 'line-through' : 'none';

  let tokenId =
    wallet.tokenVersion == 721
      ? transaction.amount
      : wallet.tokenVersion == 1155
      ? transaction.tokenId
      : null;
  let amount = wallet.tokenVersion == 1155 ? transaction.amount : null;
  return (
    <Container style={Styles.bottomContainer}>
      {Platform.OS == 'android' && (
        <Animated.View //walkaround for headerbar's background
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            elevation: 1,
            opacity: scrollY.interpolate({
              inputRange: [0, 90],
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
        title={
          transaction.out ? I18n.t('send_detail') : I18n.t('receive_detail')
        }
        onBack={() => goBack()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          elevation: 2,
          zIndex: 5,
        }}
      />
      <ScrollView
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
              if (offsetY > 90) {
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
          imageSource={wallet.isNft ? null : CardPatternImg}
          startColor={
            (wallet.isNft
              ? nftStartColors[wallet.colorIndex]
              : startColors[wallet.currencySymbol]) || startColors.UNKNOWN
          }
          endColor={
            (wallet.isNft
              ? nftEndColors[wallet.colorIndex]
              : endColors[wallet.currencySymbol]) || endColors.UNKNOWN
          }
          start={{ x: 0, y: 0 }}
          end={wallet.isNft ? { x: 0, y: 1 } : { x: 1, y: 0 }}>
          <Animated.View
            style={{
              opacity: scrollY.interpolate({
                inputRange: [0, 20],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            }}>
            <SafeAreaView
              style={{ marginTop: HEADER_COLLAPSED_HEIGHT, width: width }}
            />
            <View style={Styles.numContainer}>
              {wallet.isNft ? (
                <Image
                  resizeMode="stretch"
                  source={nftIcons[wallet.iconIndex]}
                  style={{
                    height: 32,
                    width: 32,
                    alignSelf: 'center',
                  }}
                />
              ) : (
                <IconSvgXml
                  xmlkey={wallet.currencySymbol}
                  width={SMALL_ICON_SIMPLE_SIZE}
                  height={SMALL_ICON_SIMPLE_SIZE}
                />
              )}

              <CurrencyText
                currency={wallet.currency}
                tokenAddress={wallet.tokenAddress}
                currencySymbol={wallet.currencySymbol}
                textStyle={[Styles.currencyTextMain, Theme.fonts.default.heavy]}
              />
            </View>
            {transaction.out ? (
              <Text
                style={[
                  Theme.fonts.default.heavyBold,
                  Styles.tag,
                  {
                    fontWeight: '800',
                    backgroundColor: 'white',
                    color: theme.colors.send,
                    fontSize: 12,
                    alignSelf: 'center',
                    marginTop: 10,
                  },
                ]}>
                {I18n.t('send')}
              </Text>
            ) : (
              <Text
                style={[
                  Styles.tag,
                  Theme.fonts.default.heavyBold,
                  {
                    fontWeight: '800',
                    backgroundColor: 'white',
                    color: theme.colors.receive,
                    fontSize: 12,
                    alignSelf: 'center',
                    marginTop: 10,
                  },
                ]}>
                {I18n.t('receive')}
              </Text>
            )}
          </Animated.View>
        </BackgroundImage>
        <View
          style={{
            justifyContent: 'space-between',
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
          }}>
          {replaceable &&
            transaction.replaceable &&
            transaction.replaceStatus == null && (
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <RoundButton2
                  height={ROUND_BUTTON_LARGE_HEIGHT}
                  style={[
                    {
                      backgroundColor: theme.colors.pickerBg,
                      marginLeft: 16,
                      width: width / 2 - 32,
                    },
                  ]}
                  icon={({ size, color }) => (
                    <SvgXml
                      xml={CANCEL_SVG}
                      style={{
                        tintColor: theme.colors.white35,
                        width: 24,
                        height: 24,
                      }}
                    />
                  )}
                  labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
                  color={theme.colors.pickerBg}
                  onPress={() => _fetchWithdrawInfo(TYPE_CANCEL)}>
                  {I18n.t('cancel')}
                </RoundButton2>
                <RoundButton2
                  height={ROUND_BUTTON_LARGE_HEIGHT}
                  style={[
                    {
                      backgroundColor: theme.colors.pickerBg,
                      marginLeft: 16,
                      width: width / 2 - 32,
                    },
                  ]}
                  icon={({ size, color }) => {
                    return (
                      <SvgXml
                        xml={ACCELERATE_SVG}
                        style={{
                          tintColor: theme.colors.white35,
                          width: 24,
                          height: 24,
                        }}
                      />
                    );
                  }}
                  labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
                  color={theme.colors.pickerBg}
                  onPress={() => _fetchWithdrawInfo(TYPE_ACCELERATE)}>
                  {I18n.t('accelerate')}
                </RoundButton2>
              </View>
            )}
          <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
            {I18n.t('from')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={Styles.bottomBoarderContainer}
            onPress={() => {
              _copy(transaction.fromAddress, I18n.t('copied'));
            }}>
            <Text style={[Styles.secContent, Theme.fonts.default.regular]}>
              {transaction.fromAddress}
            </Text>
            {_getCopyIcon(transaction.fromAddress)}
          </TouchableOpacity>
          <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
            {I18n.t('to')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={Styles.bottomBoarderContainer}
            onPress={() => {
              _copy(transaction.toAddress, I18n.t('copied'));
            }}>
            <Text style={[Styles.secContent, Theme.fonts.default.regular]}>
              {transaction.toAddress}
            </Text>
            {_getCopyIcon(transaction.toAddress)}
          </TouchableOpacity>
          {tokenId && (
            <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {I18n.t('token_id')}
            </Text>
          )}
          {tokenId && (
            <View style={Styles.bottomBoarderContainer}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {`#${tokenId}`}
              </Text>
            </View>
          )}
          {(amount || !wallet.isNft) && (
            <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {I18n.t('transfer_amount')}
            </Text>
          )}
          {amount && (
            <View style={Styles.bottomBoarderContainer}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {amount}
              </Text>
            </View>
          )}
          {!wallet.isNft && !hasValue(exchangeAmount) && (
            <View style={Styles.bottomBoarderContainer}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {transaction.amount}
              </Text>
            </View>
          )}
          {!wallet.isNft && hasValue(exchangeAmount) && (
            <View
              style={[
                Styles.bottomBoarderContainer,
                { flexDirection: 'column', alignItems: 'flex-start' },
              ]}>
              <Text
                selectable
                style={[
                  Styles.secContent,
                  Theme.fonts.default.regular,
                  { textDecorationLine: decorationLine },
                ]}>
                {`${transaction.amount}  ${wallet.currencySymbol}`}
              </Text>

              <Text
                selectable
                style={[
                  Styles.convertedNumText,
                  Theme.fonts.default.regular,
                  {
                    marginTop: 5,
                    fontSize: 12,
                    textDecorationLine: decorationLine,
                  },
                ]}>
                {`≈ ${exchangeCurrency} \$${exchangeAmount}`}
              </Text>
            </View>
          )}
          {hasValue(transaction.transactionFee) && (
            <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {I18n.t('transaction_fee')}
            </Text>
          )}
          {hasValue(transaction.transactionFee) && (
            <View
              style={[
                Styles.bottomBoarderContainer,
                { flexDirection: 'column', alignItems: 'flex-start' },
              ]}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {`${transaction.transactionFee} ${feeUnit}`}
              </Text>
              <Text
                selectable
                style={[
                  Styles.convertedNumText,
                  Theme.fonts.default.regular,
                  {
                    marginTop: 5,
                    fontSize: 12,
                  },
                ]}>
                {`≈ ${exchangeCurrency} \$${exchangeTransactionFee}`}
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row' }}>
            <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {I18n.t('txid')}
            </Text>
            {transaction.pending && (
              <Text
                style={[
                  Styles.tag,
                  Theme.fonts.default.medium,
                  {
                    backgroundColor: theme.colors.melon,
                    marginLeft: 10,
                    fontSize: 12,
                  },
                ]}>
                {I18n.t('pending_up')}
              </Text>
            )}
            {!transaction.success && (
              <Text
                style={[
                  Styles.tag,
                  Theme.fonts.default.medium,
                  {
                    backgroundColor: Theme.colors.error,
                    marginLeft: 10,
                    fontSize: 12,
                  },
                ]}>
                {I18n.t('failed_up')}
              </Text>
            )}
            {transaction.dropped && (
              <Text
                style={[
                  Styles.tag,
                  Theme.fonts.default.medium,
                  {
                    backgroundColor: Theme.colors.error,
                    marginLeft: 10,
                    fontSize: 12,
                  },
                ]}>
                {I18n.t('dropped_up')}
              </Text>
            )}
            {confirmBlocks != null && confirmBlocks != 0 && (
              <Text
                style={[
                  Theme.fonts.default.medium,
                  Styles.tag,
                  {
                    backgroundColor: theme.colors.success,
                    marginLeft: 10,
                    fontSize: 12,
                    alignSelf: 'center',
                  },
                ]}>
                {`${confirmBlocks} ${I18n.t('confirmed_up')}`}
              </Text>
            )}
          </View>
          <View
            style={[
              Styles.bottomBoarderContainer,
              {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
              },
            ]}>
            {transaction.txid != null && transaction.txid.length > 0 ? (
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {transaction.txid}
              </Text>
            ) : (
              <Text
                selectable
                style={[Styles.secContent, { color: Theme.colors.error }]}>
                {transaction.error}
              </Text>
            )}
          </View>
          <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
            {I18n.t('time')}
          </Text>
          <View style={Styles.bottomBoarderContainer}>
            <DisplayTime
              selectable
              textStyle={[Styles.secContent, Theme.fonts.default.regular]}
              unix={transaction.timestamp}
            />
          </View>
          {hasValue(transaction.memo) && (
            <Text
              selectable
              style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {I18n.t('memo')}
            </Text>
          )}
          {hasValue(transaction.memo) && (
            <View style={Styles.bottomBoarderContainer}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {transaction.memo}
              </Text>
            </View>
          )}
          {hasValue(transaction.description) && (
            <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {I18n.t('description')}
            </Text>
          )}
          {hasValue(transaction.description) && (
            <View style={Styles.bottomBoarderContainer}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {transaction.description}
              </Text>
            </View>
          )}
          {transaction.replaceStatus != null && (
            <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {I18n.t('activity_log')}
            </Text>
          )}
          {transaction.logs != null && transaction.logs.length > 0 && (
            <View style={Styles.bottomBoarderContainer}>
              <ActivityLogList
                data={transaction.logs}
                replaceStatus={transaction.replaceStatus}
              />
            </View>
          )}
          {getTransactionExplorerUri(
            wallet.currency,
            wallet.tokenAddress,
            transaction.txid,
            'main'
          ) && (
            <RoundButton2
              height={ROUND_BUTTON_HEIGHT}
              style={Styles.bottomButton}
              outlined={true}
              icon={({ size, color }) => (
                <Image
                  source={expolreImg}
                  style={{
                    width: ROUND_BUTTON_ICON_SIZE,
                    height: ROUND_BUTTON_ICON_SIZE,
                  }}
                />
              )}
              labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
              color={theme.colors.primaryColor}
              onPress={() =>
                explorer(
                  wallet.currency,
                  wallet.tokenAddress,
                  transaction.txid,
                  config
                )
              }>
              {I18n.t('explore')}
            </RoundButton2>
          )}
        </View>
      </ScrollView>
      {replaceTransaction && (
        <ReplaceTransactionModal
          type={replaceTransaction}
          feeUnit={feeUnit}
          feeNote={feeNote}
          fee={fee}
          onCancel={() => {
            setReplaceTransaction(null);
          }}
          onButtonClick={async selectedFee => {
            const type = replaceTransaction;
            setReplaceTransaction(null);

            setLoading(true);
            let { isSms, error } = await checkAuthType(
              enableBiometrics,
              skipSmsVerify,
              bioSetting,
              accountSkipSmsVerify
            );
            setLoading(false);
            if (error) {
              setResult({
                type: TYPE_FAIL,
                error: I18n.t(`error_msg_${error.code}`, {
                  defaultValue: error.message,
                }),
                title: I18n.t('check_failed'),
              });
              return;
            }
            NavigationService.navigate('InputPinSms', {
              title: I18n.t(titleKeys[type]),
              modal: true,
              isSms: isSms,
              from: 'TransactionDetail',
              callback: (pinSecret, bioType, actionToken, code) => {
                _replaceTransaction(
                  type,
                  pinSecret,
                  bioType,
                  actionToken,
                  code,
                  selectedFee
                );
                // NavigationService.navigate('Withdraw', {});
                // _createTransaction(pinSecret, type, actionToken, code);
              },
            });
          }}
        />
      )}
      {loading && (
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
      <TopDownHint
        style={{
          elevation: 2,
          zIndex: 5,
        }}
        title={hint}
        onDismiss={() => {
          setHint(null);
        }}
      />
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          message={result.message}
          errorMsg={result.error}
          type={result.type}
          onButtonClick={result.buttonClick}
          secondaryConfig={
            result.type === TYPE_FAIL && result.useSms
              ? {
                  color: theme.colors.primary,
                  text: I18n.t('use_sms_temp'),
                  onClick: () => {
                    dispatch(updateBioSetting(BIO_SETTING_USE_SMS));
                    setResult(null);
                  },
                }
              : null
          }
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  badgeText: {
    fontSize: BADGE_FONT_SIZE,
    color: Theme.colors.text,
    fontWeight: 'bold',
  },
});
export default withTheme(TransactionDetailScreen);
