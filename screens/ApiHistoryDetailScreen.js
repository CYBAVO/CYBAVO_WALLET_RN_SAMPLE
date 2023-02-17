import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { withTheme, ActivityIndicator, Text, Portal } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { FileLogger } from 'react-native-file-logger';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import NavigationService from '../NavigationService';
const { width, height } = Dimensions.get('window');
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { fetchApiHistory, startFetchFee, stopFetchFee } from '../store/actions';
import { Container } from 'native-base';
import Styles from '../styles/Styles';
import Headerbar from '../components/Headerbar';
import {
  AUTH_TYPE_BIO,
  AUTH_TYPE_OLD,
  AUTH_TYPE_SMS,
  CANCEL_SVG,
  Coin,
  noHigherFeeKeys,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
  ROUND_BUTTON_LARGE_HEIGHT,
  sliderInnerWidth,
  sliderOuterWidth,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import ReplaceTransactionModal, {
  titleKeys,
  TYPE_ACCELERATE,
  TYPE_CANCEL,
} from '../components/ReplaceTransactionModal';
import { Wallets, WalletConnectSdk } from '@cybavo/react-native-wallet-service';
const { WalletConnectManager, WalletConnectHelper } = WalletConnectSdk;
import {
  checkAuthType,
  explorer,
  getEstimateGasFee,
  getEthGasFeeWithPreLimit,
  getFeeNote,
  getFeeUnit,
  getTotalFeeFromLimit,
  getTransactionExplorerUri,
  getWalletKey,
  hasValue,
} from '../Helpers';
import { useAppState } from '@react-native-community/hooks';
import { Theme } from '../styles/MainTheme';
import BigNumber from 'bignumber.js';
import walletconnect from '../store/reducers/walletconnect';
import InputPinSmsModal from './InputPinSmsModal';
import apihistory from '../store/reducers/apihistory';
import { SvgXml } from 'react-native-svg';
import TopDownHint from '../components/TopDownHint';
import { CANCELLED } from '../store/reducers/transactions';
const expolreImg = require('../assets/image/open_window.png');
const tagConfig = {
  0: { i18n: 'pending_up', color: Theme.colors.pending }, //WAITING
  1: { i18n: 'failed_up', color: Theme.colors.error }, //FAILED
  3: { i18n: 'failed_up', color: Theme.colors.errorBg }, //DROPPED
};
const ApiHistoryDetailScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const config = useSelector(state => {
    return state.auth.config;
  });
  const [selectedFeeInfo, setSelectedFeeInfo] = useState(null);
  const apihistory = useNavigationParam('apiHistory');
  const [usedFee, setUsedFee] = useState(null);
  const [fee, setFee] = useState(null);
  const [replaceTransaction, setReplaceTransaction] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { navigate, goBack } = useNavigation();
  const title = I18n.t('api_history_detail');
  const wallet = apihistory.wallet;
  const feeUnit = useSelector(state => {
    if (!wallet) {
      return '';
    }
    return getFeeUnit(wallet, state.currency.currencies);
  });
  const feeNote = wallet
    ? getFeeNote(wallet.currency, wallet.tokenAddress)
    : '';
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
  const appState = useAppState();
  useEffect(() => {
    if (appState == 'active' && wallet) {
      dispatch(startFetchFee(wallet.currency));
    } else if (appState === 'background') {
      dispatch(stopFetchFee());
    }
  }, [appState]);

  const rawFee = useSelector(state => {
    if (!wallet) {
      return null;
    }
    if (!state.fee.fee[wallet.currency]) {
      return null;
    }
    if (
      !state.fee.fee[wallet.currency] ||
      !state.fee.fee[wallet.currency].data ||
      !state.fee.fee[wallet.currency].data.high
    ) {
      return null;
    }
    return state.fee.fee[wallet.currency].data;
  });
  useEffect(() => {
    if (rawFee == null || usedFee == null) {
      return;
    }
    getEstimateGasFee(
      rawFee,
      wallet.currency,
      wallet.tokenAddress,
      usedFee.total.toFixed(usedFee.total.decimalPlaces()),
      '0',
      wallet.walletId,
      wallet.address
    ).then(ethGasFee => {
      let immediateSelectedFeeInfo = selectedFeeInfo;
      if (immediateSelectedFeeInfo == null) {
        immediateSelectedFeeInfo = {
          level: 'high',
          amount: ethGasFee.high.amount,
        };
        setSelectedFeeInfo(immediateSelectedFeeInfo);
      }
      if (
        replaceTransaction != null &&
        ethGasFee[immediateSelectedFeeInfo.level].amount !=
          immediateSelectedFeeInfo.amount
      ) {
        setReplaceTransaction(null);
        //need to update selectedFeeInfo, otherwise this condition will always be true
        setSelectedFeeInfo({
          level: immediateSelectedFeeInfo.level,
          amount: ethGasFee[immediateSelectedFeeInfo.level].amount,
        });
      }
      setFee(ethGasFee);
    });
  }, [rawFee, usedFee]);
  useEffect(() => {
    if (apihistory.cancelable) {
      dispatch(startFetchFee(wallet.currency));
    }
    setUsedFee(getTotalFeeFromLimit(apihistory.gasPrice, apihistory.gasLimit));
  }, []);

  const _cancelWalletConnectTransaction = async (
    pinSecret,
    feeStr,
    type,
    actionToken,
    code
  ) => {
    try {
      setLoading(true);
      FileLogger.debug(
        `>>_cancelWalletConnectTransaction${feeStr}, apihistory:${JSON.stringify(
          apihistory
        )}`
      );

      let result;
      switch (type) {
        case AUTH_TYPE_SMS:
          result = await Wallets.cancelWalletConnectTransactionSms(
            actionToken,
            code,
            apihistory.walletId,
            apihistory.accessId,
            feeStr,
            pinSecret
          );
          break;
        case AUTH_TYPE_BIO:
          result = await Wallets.cancelWalletConnectTransactionBio(
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            apihistory.walletId,
            apihistory.accessId,
            feeStr,
            pinSecret
          );
          break;
        case AUTH_TYPE_OLD:
          result = await Wallets.cancelWalletConnectTransaction(
            apihistory.walletId,
            apihistory.accessId,
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
          dispatch(fetchApiHistory());
          goBack();
        },
      });
      FileLogger.debug(
        `_cancelWalletConnectTransaction success:${JSON.stringify(result)}`
      );
    } catch (error) {
      console.debug(`cancelWalletConnectTransactionF:${error}`);
      FileLogger.debug(`_cancelWalletConnectTransaction fail:${error.message}`);
      if (error.code != -7) {
        setResult({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t('cancel_failed'),
          buttonClick: () => {
            setResult(null);
          },
        });
      }
    }
    // dispatch(walletconnectSync());
    setLoading(false);
  };
  const _getSubView = () => {
    const decorationLine =
      apihistory.replaceStatus === CANCELLED ? 'line-through' : 'none';
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}>
        {apihistory.cancelable && fee && (
          <RoundButton2
            height={ROUND_BUTTON_LARGE_HEIGHT}
            style={[
              {
                backgroundColor: theme.colors.pickerBg,
                alignSelf: 'center',
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
            onPress={() => setReplaceTransaction(TYPE_CANCEL)}>
            {I18n.t('cancel')}
          </RoundButton2>
        )}
        <Text
          style={[
            Styles.secLabel,
            Theme.fonts.default.regular,
            { marginTop: 0 },
          ]}>
          {I18n.t('api_name')}
        </Text>
        <View style={Styles.bottomBoarderContainer}>
          <Text
            selectable
            style={[
              Styles.secContent,
              {
                textDecorationLine: decorationLine,
              },
              Theme.fonts.default.regular,
            ]}>
            {apihistory.apiName}
          </Text>
        </View>
        {hasValue(apihistory.txid) && (
          <View style={{ flexDirection: 'row' }}>
            <Text style={Styles.secLabel}>{I18n.t('txid')}</Text>
            {tagConfig[apihistory.status] && (
              <Text
                style={[
                  Styles.tag,
                  Theme.fonts.default.medium,
                  {
                    backgroundColor: tagConfig[apihistory.status].color,
                    marginLeft: 10,
                    fontSize: 12,
                    alignSelf: 'flex-start',
                  },
                ]}>
                {I18n.t(tagConfig[apihistory.status].i18n)}
              </Text>
            )}
          </View>
        )}
        {hasValue(apihistory.txid) && (
          <View style={Styles.bottomBoarderContainer}>
            <Text
              selectable
              style={[
                Styles.secContent,
                {
                  textDecorationLine: decorationLine,
                },
                Theme.fonts.default.regular,
              ]}>
              {apihistory.txid}
            </Text>
          </View>
        )}
        {usedFee != null && (
          <Text style={Styles.secLabel}>{I18n.t('transaction_fee')}</Text>
        )}
        {usedFee != null && (
          <View style={Styles.bottomBoarderContainer}>
            <Text
              selectable
              style={[Styles.secContent, Theme.fonts.default.regular]}>
              {`${usedFee.total.toFixed(
                usedFee.total.decimalPlaces()
              )} ${feeUnit} (${apihistory.gasPrice} wei * ${
                apihistory.gasLimit
              })`}
            </Text>
          </View>
        )}
        {hasValue(apihistory.nonce) && (
          <Text style={Styles.secLabel}>{I18n.t('nonce')}</Text>
        )}
        {hasValue(apihistory.nonce) && (
          <View style={Styles.bottomBoarderContainer}>
            <Text
              selectable
              style={[Styles.secContent, Theme.fonts.default.regular]}>
              {apihistory.nonce}
            </Text>
          </View>
        )}
        {hasValue(apihistory.message) && (
          <Text style={Styles.secLabel}>{I18n.t('message')}</Text>
        )}
        {hasValue(apihistory.message) && (
          <View style={Styles.bottomBoarderContainer}>
            <Text
              selectable
              style={[Styles.secContent, Theme.fonts.default.regular]}>
              {apihistory.message}
            </Text>
          </View>
        )}
        <Text style={Styles.secLabel}>{I18n.t('time')}</Text>
        <View style={Styles.bottomBoarderContainer}>
          <Text
            selectable
            style={[Styles.secContent, Theme.fonts.default.regular]}>
            {apihistory.formatTime}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <Container
      style={[Styles.bottomContainer, { justifyContent: 'space-between' }]}>
      <Headerbar
        // backIcon={require('../assets/image/ic_cancel.png')}
        transparent
        title={title}
        onBack={() => {
          goBack();
        }}
      />

      <ScrollView>{_getSubView()}</ScrollView>
      {hasValue(apihistory.txid) &&
        getTransactionExplorerUri(
          wallet.currency,
          wallet.tokenAddress,
          apihistory.txid,
          config
        ) && (
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={Styles.bottomButton}
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
                apihistory.txid,
                config
              )
            }>
            {I18n.t('explore')}
          </RoundButton2>
        )}
      {replaceTransaction && fee && (
        <ReplaceTransactionModal
          type={replaceTransaction}
          fee={fee}
          feeNote={feeNote}
          feeUnit={feeUnit}
          onCancel={() => {
            setReplaceTransaction(null);
            dispatch(stopFetchFee());
          }}
          onButtonClick={async selectedFee => {
            setReplaceTransaction(null);
            dispatch(stopFetchFee());

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
              modal: true,
              from: 'ApiHistoryDetail',
              isSms: isSms,
              callback: (pinSecret, type, actionToken, code) => {
                _cancelWalletConnectTransaction(
                  pinSecret,
                  selectedFee,
                  type,
                  actionToken,
                  code
                );
              },
              onError: error => {
                FileLogger.debug(
                  `_cancelWalletConnectTransaction fail:${error.message}`
                );
              },
            });
          }}
          onSelect={select => {
            setSelectedFeeInfo(select);
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
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          message={result.message}
          errorMsg={result.error}
          type={result.type}
          onButtonClick={result.buttonClick}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default withTheme(ApiHistoryDetailScreen);
