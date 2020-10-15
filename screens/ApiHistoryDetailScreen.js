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
import { withTheme, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { FileLogger } from 'react-native-file-logger';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
const { width, height } = Dimensions.get('window');
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { fetchApiHistory } from '../store/actions';
import { Container } from 'native-base';
import Styles from '../styles/Styles';
import Headerbar from '../components/Headerbar';
import {
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
  TYPE_CANCEL,
} from '../components/ReplaceTransactionModal';
import { Wallets, WalletConnectSdk } from '@cybavo/react-native-wallet-service';
const { WalletConnectManager, WalletConnectHelper } = WalletConnectSdk;
import {
  explorer,
  getEthGasFeeWithPreLimit,
  getTotalFeeFromLimit,
  getWalletKey,
  hasValue,
} from '../Helpers';
import { convertHexToUtf8 } from '@walletconnect/utils';
import { Theme } from '../styles/MainTheme';
import BigNumber from 'bignumber.js';
import walletconnect from '../store/reducers/walletconnect';
import InputPinCodeModal from './InputPinCodeModal';
import apihistory from '../store/reducers/apihistory';
import { SvgXml } from 'react-native-svg';
import TopDownHint from '../components/TopDownHint';
import { CANCELLED } from '../store/reducers/transactions';
const expolreImg = require('../assets/image/open_window.png');
const tagConfig = {
  0: { i18n: 'pending_up', color: Theme.colors.pending },
  1: { i18n: 'failed_up', color: Theme.colors.error },
  3: { i18n: 'failed_up', color: Theme.colors.errorBg },
};
const ApiHistoryDetailScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const config = useSelector(state => {
    return state.auth.config;
  });
  const apihistory = useNavigationParam('apiHistory');
  const [inputPinCode, setInputPinCode] = useState(null);
  const [fee, setFee] = useState({});
  const [usedFee, setUsedFee] = useState(null);
  const [replaceTransaction, setReplaceTransaction] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { navigate, goBack } = useNavigation();
  const title = I18n.t('api_history_detail');
  const _finishInputPinCode = () => {
    setInputPinCode(null);
  };
  const _fetchWithdrawInfo = async type => {
    setLoading(true);
    try {
      const rawFee = await Wallets.getTransactionFee(Coin.ETH);
      if (
        rawFee != null &&
        rawFee.high != null &&
        rawFee.medium != null &&
        rawFee.low != null &&
        hasValue(rawFee.high.amount) &&
        hasValue(rawFee.medium.amount) &&
        hasValue(rawFee.low.amount)
      ) {
        let ethGasFee = getEthGasFeeWithPreLimit(rawFee, usedFee);
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
        error: error.message,
        title: I18n.t('estimate_fee_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    setUsedFee(getTotalFeeFromLimit(apihistory.gasPrice, apihistory.gasLimit));

  }, []);

  const _cancelWalletConnectTransaction = async (pinSecret, feeStr) => {
    try {
      setLoading(true);
      FileLogger.debug(
        `>>_cancelWalletConnectTransaction${feeStr}, apihistory:${JSON.stringify(
          apihistory
        )}`
      );
      let result = await Wallets.cancelWalletConnectTransaction(
        apihistory.walletId,
        apihistory.accessId,
        feeStr,
        pinSecret
      );
      setInputPinCode(null);
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
      setResult({
        type: TYPE_FAIL,
        error: error.message,
        title: I18n.t('cancel_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
      setInputPinCode(null);
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
        {apihistory.cancelable && (
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
            onPress={() => _fetchWithdrawInfo(TYPE_CANCEL)}>
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
              {`${usedFee.total.toFixed(usedFee.total.decimalPlaces())} ETH (${
                apihistory.gasPrice
              } wei * ${apihistory.gasLimit})`}
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
        transparent
        title={title}
        onBack={() => {
          goBack();
        }}
      />

      <ScrollView>{_getSubView()}</ScrollView>
      {hasValue(apihistory.txid) && (
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
          onPress={() => explorer(Coin.ETH, '', apihistory.txid, config)}>
          {I18n.t('explore')}
        </RoundButton2>
      )}
      <InputPinCodeModal
        title={inputPinCode ? I18n.t(titleKeys[inputPinCode.type]) : ''}
        isVisible={inputPinCode != null}
        onCancel={() => {
          _finishInputPinCode();
        }}
        loading={loading}
        onInputPinCode={pinsecret => {
          _cancelWalletConnectTransaction(pinsecret, inputPinCode.selectedFee);
        }}
      />

      {replaceTransaction && (
        <ReplaceTransactionModal
          type={replaceTransaction}
          fee={fee}
          onCancel={() => {
            setReplaceTransaction(null);
          }}
          feeNote={` (${I18n.t('estimated')})`}
          onButtonClick={selectedFee => {
            const type = replaceTransaction;
            setReplaceTransaction(null);
            setInputPinCode({ type, selectedFee });
          }}
        />
      )}
      {loading && !inputPinCode && (
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
