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
  getWalletKey,
  getParentCurrency,
  getTransactionType,
} from '../Helpers';
import RoundButton2 from '../components/RoundButton2';
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
import NavigationService from '../NavigationService';
import { BIO_SETTING_USE_SMS, updateBioSetting } from '../store/actions';
import { useSafeArea } from 'react-native-safe-area-context';

const HEADER_EXPANDED_HEIGHT = 168;
const HEADER_COLLAPSED_HEIGHT = 56;
const UserHistoryDetailScreen: () => React$Node = ({ theme }) => {
  const insets = useSafeArea();
  const [scrollY] = useState(new Animated.Value(0));
  const [transparent, setTransparent] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [_, setClipboard] = useClipboard();
  const [hint, setHint] = useState(null);
  const transaction = useNavigationParam('transaction');
  const currencyObj = useNavigationParam('currencyObj');
  const feeUnit = useNavigationParam('feeUnit');
  const { goBack } = useNavigation();
  const dispatch = useDispatch();
  if (!transaction) {
    console.warn('No wallet/transaction specified');
    goBack();
  }

  const config = useSelector(state => {
    return state.auth.config;
  });

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
  const _fetchTransactionDetail = async () => {
    if (transaction.txid === '' || transaction.dropped) {
      return;
    }
    try {
      const { confirmBlocks, data } = await Wallets.getTransactionInfo(
        transaction.currency,
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

  useEffect(() => {
    _fetchTransactionDetail();
  }, [transaction]);

  let exchangeAmount = getExchangeAmount(
    transaction.amount,
    3,
    { currency: transaction.currency, tokenAddress: transaction.tokenAddress },
    exchangeCurrency,
    currencyPrice
  );
  let exchangeTransactionFee = getExchangeAmount(
    transaction.transactionFee,
    3,
    { currency: transaction.currency, tokenAddress: '' },
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
  const isNft = false;
  const decorationLine =
    transaction.replaceStatus === CANCELLED ? 'line-through' : 'none';

  let tokenId = null;
  let amount = null;
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
              inputRange: [0, 148],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          }}>
          <View
            style={{
              height: HEADER_COLLAPSED_HEIGHT + 20,
              width: width,
              backgroundColor: theme.colors.background,
              paddingTop: insets.top,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            }}
          />
        </Animated.View>
      )}

      <Headerbar
        transparent={transparent}
        title={
          transaction.direction === Wallets.Transaction.Direction.OUT
            ? I18n.t('send_detail')
            : I18n.t('receive_detail')
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
              if (Platform.OS === 'android') {
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
          imageSource={isNft ? null : CardPatternImg}
          startColor={startColors[currencyObj.symbol] || startColors.UNKNOWN}
          endColor={endColors[currencyObj.symbol] || endColors.UNKNOWN}
          start={{ x: 0, y: 0 }}
          end={isNft ? { x: 0, y: 1 } : { x: 1, y: 0 }}>
          <Animated.View
            style={{
              opacity: scrollY.interpolate({
                inputRange: [0, 44],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            }}>
            <View
              style={{
                marginTop: HEADER_COLLAPSED_HEIGHT,
                width: width,
                paddingTop: insets.top,
                paddingLeft: insets.left,
                paddingRight: insets.right,
              }}
            />
            <View style={[Styles.numContainer, { marginTop: 24 }]}>
              <IconSvgXml
                xmlkey={currencyObj.symbol}
                width={SMALL_ICON_SIMPLE_SIZE}
                height={SMALL_ICON_SIMPLE_SIZE}
              />

              <Text
                style={[Styles.currencyTextMain, Theme.fonts.default.heavy]}>
                {currencyObj.symbol}
              </Text>
            </View>
            {transaction.direction === Wallets.Transaction.Direction.OUT ? (
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
          {transaction.type != Wallets.Transaction.Type.Unknown && (
            <Text
              style={[
                Styles.cardDesc,
                {
                  color: Theme.colors.send,
                  opacity: 1,
                  marginLeft: 0,
                  marginRight: 0,
                  marginTop: 4,
                  marginBottom: 16,
                  flexShrink: 1,
                },
                Theme.fonts.default.regular,
              ]}>
              {getTransactionType(transaction.type)}
            </Text>
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
          {(amount || !isNft) && (
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
          {!isNft && !hasValue(exchangeAmount) && (
            <View style={Styles.bottomBoarderContainer}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {transaction.amount}
              </Text>
            </View>
          )}
          {!isNft && hasValue(exchangeAmount) && (
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
                {`${transaction.amount}  ${currencyObj.symbol}`}
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
          {transaction.transactionFee && transaction.transactionFee != '0' && (
            <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {I18n.t('transaction_fee')}
            </Text>
          )}
          {transaction.transactionFee && transaction.transactionFee != '0' && (
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
            transaction.currency,
            transaction.tokenAddress,
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
                  transaction.currency,
                  transaction.tokenAddress,
                  transaction.txid,
                  config
                )
              }>
              {I18n.t('explore')}
            </RoundButton2>
          )}
        </View>
      </ScrollView>
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
export default withTheme(UserHistoryDetailScreen);
