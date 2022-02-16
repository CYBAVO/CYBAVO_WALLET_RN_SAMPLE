import React, { useState, useEffect, useRef } from 'react';
import { FileLogger } from 'react-native-file-logger';
import {
  StyleSheet,
  View,
  Modal,
  ScrollView,
  Platform,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useBackHandler } from '@react-native-community/hooks';
import { withTheme, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../store/actions/auth';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
} from '../components/ResultModal';
import {
  approveRequest,
  approveSession,
  fetchApiHistory,
  killAllSession,
  rejectRequest,
  walletconnectSync,
} from '../store/actions';
import NavigationService from '../NavigationService';
import { Container } from 'native-base';
import Styles from '../styles/Styles';
import Headerbar from '../components/Headerbar';
import DegreeSlider from '../components/DegreeSlider';
import {
  AUTH_TYPE_BIO,
  AUTH_TYPE_OLD,
  AUTH_TYPE_SMS,
  Coin,
  ROUND_BUTTON_HEIGHT,
  sliderInnerWidth,
  sliderOuterWidth,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { titleKeys, TYPE_CANCEL } from '../components/ReplaceTransactionModal';
import { Wallets, WalletConnectSdk } from '@cybavo/react-native-wallet-service';
const { WalletConnectManager, WalletConnectHelper } = WalletConnectSdk;
import {
  checkAuthType,
  convertAmountFromRawNumber,
  convertHexToString,
  getAvailableBalance,
  getEstimateFee,
  getEthGasFee,
  getExchangeAmount,
  getWalletKeyByWallet,
  hasValue,
  sleep,
  toastError,
} from '../Helpers';
import { convertHexToUtf8 } from '@walletconnect/utils';
import { Theme } from '../styles/MainTheme';
import BigNumber from 'bignumber.js';
import walletconnect from '../store/reducers/walletconnect';
import InputPinCodeModal from './InputPinCodeModal';
import DegreeSelecter from '../components/DegreeSelecter';
const { width, height } = Dimensions.get('window');

const RequestScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();
  const peerId = useNavigationParam('peerId');
  const payload = useNavigationParam('payload');
  const walletId = useNavigationParam('walletId');
  const [amountError, setAmountError] = useState({});
  const isSessionRequest = WalletConnectHelper.isSessionRequest(payload.method);
  const [fee, setFee] = useState({});
  const [feeKeys, setFeeKeys] = useState([]);
  const [selectedFee, setSelectedFee] = useState('high');
  const [amountNum, setAmountNum] = useState(0);
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
  const { navigate, goBack } = useNavigation();
  const connectorWrapper = useSelector(
    state => state.walletconnect.connecting[peerId] || null
  );
  const balanceItem = useSelector(state => {
    let balances = state.balance.balances || {};
    return balances[getWalletKeyByWallet(state.wallets.ethWallet)];
  });
  const title =
    payload.method == 'eth_sendTransaction' ||
    payload.method == 'eth_signTransaction'
      ? I18n.t('transaction_request')
      : I18n.t('sign_request');
  const exchangeCurrency = useSelector(
    state => state.currencyPrice.exchangeCurrency
  );
  const currencyPrice = useSelector(
    state => state.currencyPrice.currencyPrice || {}
  );
  const _getFeeKey = feeObj => {
    let keys = Object.keys(feeObj);
    keys.sort((a, b) => {
      let an = new BigNumber(Number(feeObj[a].amount));
      let bn = new BigNumber(Number(feeObj[b].amount));
      let r = an.isGreaterThan(bn);
      return r ? 1 : -1;
    });
    return keys;
  };
  const _fetchWithdrawInfo = async (amount, gas) => {
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
        setFee(rawFee);
      } else {
        setFee(null);
      }
      _checkAmountNumerical(amount, 'low', rawFee);
    } catch (error) {
      toastError(error);
      console.log('_fetchWithdrawInfo failed', error);
      setResult({
        type: TYPE_CONFIRM,
        title: I18n.t('fetch_transaction_fee_fail'),
        message: I18n.t('would_you_like_to_try_again'),
        successButtonText: I18n.t('try_again'),
        buttonClick: () => {
          _fetchWithdrawInfo(amountNum);
          setResult(null);
        },
        secondaryConfig: {
          color: theme.colors.primary,
          text: I18n.t('cancel'),
          onClick: () => {
            _rejectRequest(
              peerId,
              I18n.t(`error_msg_${error.code}`, {
                defaultValue: error.message,
              })
            );
            setResult(null);
            goBack();
          },
        },
      });

      setFee({
        low: { amount: '0.000000108', description: 'low d' },
        medium: { amount: '0.000000108', description: 'medium d' },
        high: { amount: '0.000000108', description: 'high d' },
      });
      setFeeKeys(['low', 'medium', 'high']);
      _checkAmountNumerical(amount, 'low', fee);
    }
    setLoading(false);
  };
  // handle back
  useBackHandler(() => {
    return true;
  });
  useEffect(() => {
    if (connectorWrapper == null) {
      goBack();
    }
  }, [connectorWrapper]);
  useEffect(() => {
    if (
      payload.method == 'eth_sendTransaction' ||
      payload.method == 'eth_signTransaction'
    ) {
      const tx = payload.params[0];
      const amount = convertAmountFromRawNumber(convertHexToString(tx.value));
      setAmountNum(amount);
      _fetchWithdrawInfo(amount, tx.gas);
    }
  }, []);

  const _walletConnectSignTypedData = async (
    pinSecret,
    type,
    actionToken,
    code
  ) => {
    let tag = '_walletConnectSignTypedData';
    try {
      setLoading(true);
      let message = payload.params[1];
      let result;
      FileLogger.debug(
        `>>_walletConnectSignTypedData${message}, walletId:${walletId}`
      );
      switch (type) {
        case AUTH_TYPE_SMS:
          tag = 'walletConnectSignTypedDataSms';
          result = await Wallets.walletConnectSignTypedDataSms(
            actionToken,
            code,
            walletId,
            message,
            pinSecret
          );
          break;
        case AUTH_TYPE_BIO:
          tag = 'walletConnectSignTypedDataBio';
          result = await Wallets.walletConnectSignTypedDataBio(
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            walletId,
            message,
            pinSecret
          );
          break;
        case AUTH_TYPE_OLD:
          tag = 'walletConnectSignTypedData';
          result = await Wallets.walletConnectSignTypedData(
            walletId,
            message,
            pinSecret
          );
          break;
      }
      if (
        !result.signedTx.startsWith('0x') &&
        !result.signedTx.startsWith('0X')
      ) {
        result.signedTx = '0x' + result.signedTx;
      }
      let response = { result: result.signedTx, id: payload.id };
      await dispatch(approveRequest(peerId, response));
      goBack();
    } catch (error) {
      _handleFail('SignTypedData', tag, error);
    }
    setLoading(false);
  };
  const _walletConnectSignMessage = async (
    pinSecret,
    type,
    actionToken,
    code,
    message
  ) => {
    let tag = '_walletConnectSignMessage';
    try {
      setLoading(true);
      let utf8Msg = convertHexToUtf8(message);

      FileLogger.debug(
        `>>_walletConnectSignMessage_${message},utf8:${utf8Msg}`
      );
      let result;
      switch (type) {
        case AUTH_TYPE_SMS:
          tag = '_walletConnectSignMessageSms';
          result = await Wallets.walletConnectSignMessageSms(
            actionToken,
            code,
            walletId,
            utf8Msg,
            pinSecret
          );
          break;
        case AUTH_TYPE_BIO:
          tag = '_walletConnectSignMessageBio';
          result = await Wallets.walletConnectSignMessageBio(
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            walletId,
            utf8Msg,
            pinSecret
          );
          break;
        case AUTH_TYPE_OLD:
          tag = '_walletConnectSignMessage';
          result = await Wallets.walletConnectSignMessage(
            walletId,
            utf8Msg,
            pinSecret
          );
          break;
      }
      let response = { result: result.signedMessage, id: payload.id };
      await dispatch(approveRequest(peerId, response));
      goBack();
    } catch (error) {
      _handleFail('SignMessage', tag, error);
    }
    setLoading(false);
  };
  const _handleFail = async (name, tag, error) => {
    FileLogger.debug(`${tag} fail: ${error.message}`);
    if (error.code != -7) {
      let msg;
      if (error.code == 185) {
        //Biometrics setting not found
        msg = I18n.t('error_msg_185_retry');
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
      } else {
        msg = I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        });
      }
      setResult({
        type: TYPE_FAIL,
        error: msg,
        title: I18n.t('failed_template', { name: name }),
        buttonClick: () => {
          setResult(null);
          goBack();
        },
      });
      console.debug(error);
      _rejectRequest(
        I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        })
      );
    } else {
      console.debug(error);
      _rejectRequest(
        I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        })
      );
      goBack();
    }
  };
  const _walletConnectSignTransaction = async (
    pinSecret,
    type,
    actionToken,
    code,
    onlySign
  ) => {
    let tag = onlySign
      ? '_walletConnectSignTransaction'
      : '_walletConnectSignSendTransaction';
    try {
      setLoading(true);
      const tx = payload.params[0];
      const transactionFee = fee[selectedFee];
      // let signParams = JSON.stringify(tx);
      let result;
      switch (type) {
        case AUTH_TYPE_SMS:
          tag = tag + 'Sms';
          result = await Wallets.walletConnectSignTransactionSms(
            actionToken,
            code,
            walletId,
            tx,
            transactionFee.amount,
            pinSecret,
            true,
            value => {
              console.debug('onLog', value);
              FileLogger.debug(`>>${tag}_${payload.method}, ${value}`);
            }
          );
          break;
        case AUTH_TYPE_BIO:
          tag = tag + 'Bio';
          await sleep(1000); // wait InputPinSms dismiss
          result = await Wallets.walletConnectSignTransactionBio(
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            walletId,
            tx,
            transactionFee.amount,
            pinSecret,
            true,
            value => {
              console.debug('onLog', value);
              FileLogger.debug(`>>${tag}_${payload.method}, ${value}`);
            }
          );
          break;
        case AUTH_TYPE_OLD:
          result = await Wallets.walletConnectSignTransaction(
            walletId,
            tx,
            transactionFee.amount,
            pinSecret,
            true,
            value => {
              console.debug('onLog', value);
              FileLogger.debug(`>>${tag}_${payload.method}, ${value}`);
            }
          );
          break;
      }
      console.debug(tag + result.signedTx, payload.id);
      FileLogger.debug(
        `${tag} success: ${result.signedTx}, walletId:${walletId}`
      );
      if (onlySign) {
        let response = { result: result.signedTx, id: payload.id };
        await dispatch(approveRequest(peerId, response));
        goBack();
        dispatch(fetchApiHistory());
        setLoading(false);
        return;
      }
      let result2 = await Wallets.walletConnectSendSignedTransaction(
        walletId,
        result.signedTx
      );
      console.debug(tag + '2:' + result2.txid, result2.state);
      FileLogger.debug(
        `${tag}2 success: ${result2.txid}, state:${result2.state}`
      );
      let response = { result: result2.txid, id: payload.id };
      console.debug(tag + '3:' + JSON.stringify(response));
      await dispatch(approveRequest(peerId, response));
      goBack();
    } catch (error) {
      _handleFail('SignTransaction', tag, error);
    }
    // dispatch(walletconnectSync());
    dispatch(fetchApiHistory());
    setLoading(false);
  };
  const _rejectRequest = async message => {
    await dispatch(
      rejectRequest(peerId, {
        id: payload.id,
        error: { message: message },
      })
    );
  };
  const _approveRequest = async (pinSecret, type, actionToken, code) => {
    switch (payload.method) {
      case 'eth_signTransaction':
        _walletConnectSignTransaction(pinSecret, type, actionToken, code, true);
        break;
      case 'eth_sendTransaction':
        _walletConnectSignTransaction(pinSecret, type, actionToken, code);
        break;
      case 'eth_sign':
        _walletConnectSignMessage(
          pinSecret,
          type,
          actionToken,
          code,
          payload.params[1]
        );
        break;
      case 'personal_sign':
        _walletConnectSignMessage(
          pinSecret,
          type,
          actionToken,
          code,
          payload.params[0]
        );
        break;
      default:
        if (payload.method.startsWith('eth_signTypedData')) {
          _walletConnectSignTypedData(pinSecret, type, actionToken, code);
        }
        break;
    }
  };
  const _getSubView = () => {
    switch (payload.method) {
      case 'eth_sendTransaction':
        return _getTransactionView();
      case 'eth_sign':
        return _getSignView(payload.params[0], payload.params[1]);
      case 'personal_sign':
        return _getSignView(payload.params[1], payload.params[0]);
      default:
        if (payload.method.startsWith('eth_signTypedData')) {
          return _getSignTypedDataView(payload.params[1]);
        }
    }
  };
  const _getBasicInfoView = () => {
    if (connectorWrapper == null) {
      return;
    }
    const {
      peerMeta,
      chainId,
    } = connectorWrapper.getSessionPayload().params[0];
    return (
      <React.Fragment>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 60 / 2,
            backgroundColor: theme.colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Image
            source={{ uri: peerMeta.icons[0] }}
            style={{ width: 50, height: 50 }}
          />
        </View>
        <Text
          style={[
            Theme.fonts.default.black,
            {
              textAlign: 'center',
              fontSize: 20,
              marginTop: 8,
            },
          ]}>
          {peerMeta.name}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: Theme.colors.resultTitle,
            textAlign: 'center',
            marginVertical: 4,
          }}>
          {peerMeta.url}
        </Text>
      </React.Fragment>
    );
  };
  const _getSignView = (address, message) => {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}>
        {_getBasicInfoView()}
        <Text
          style={[
            Styles.secLabel,
            Theme.fonts.default.regular,
            { marginTop: 40 },
          ]}>
          {I18n.t('address')}
        </Text>
        <View style={Styles.bottomBoarderContainer}>
          <Text
            selectable
            style={[Styles.secContent, Theme.fonts.default.regular]}>
            {address}
          </Text>
        </View>
        <Text style={Styles.secLabel}>{I18n.t('message')}</Text>
        <View style={Styles.bottomBoarderContainer}>
          <Text
            selectable
            style={[Styles.secContent, Theme.fonts.default.regular]}>
            {convertHexToUtf8(message)}
          </Text>
        </View>
      </View>
    );
  };
  const _getSignTypedDataView = typedData => {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}>
        {_getBasicInfoView()}

        <Text
          style={{
            fontSize: 12,
            color: Theme.colors.resultTitle,
            textAlign: 'center',
            marginVertical: 4,
          }}>
          {typedData}
        </Text>
      </View>
    );
  };
  const HIDE_TRANSACTION_ERRORS = [
    'error_input_nan',
    'error_fund_insufficient',
  ];
  const _checkAmountNumerical = (value, selectedFee, fee) => {
    if (isNaN(value)) {
      setAmountError({
        key: 'error_input_nan',
        p: { label: I18n.t('amount') },
      });
      return false;
    }
    let balance = getAvailableBalance(balanceItem);
    if (balance) {
      let balanceNum = Number(balance);
      let b = new BigNumber(balanceNum);
      let v = new BigNumber(value);
      if (b.isZero() || v.isGreaterThan(b)) {
        setAmountError({
          key: 'error_fund_insufficient',
        });
        return false;
      }
      const feeStr =
        fee != null && fee[selectedFee] != null ? fee[selectedFee].amount : '0';
      let f = getEstimateFee(Coin.ETH, '', feeStr);
      if (v.plus(f).isGreaterThan(b)) {
        setAmountError({
          key: 'error_fund_insufficient_to_cover_transaction_fee',
        });
        return false;
      }
    }
    //TODO
    setAmountError({});
    return true;
  };
  const _getAvailableBalanceText = () => {
    let value = getAvailableBalance(balanceItem);
    if (hasValue(value)) {
      return `${I18n.t('available_balance')} ${value} ETH`;
    }
    return null;
  };
  const _getTransactionView = () => {
    const tx = payload.params[0];
    let balanceText = _getAvailableBalanceText();
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}>
        {_getBasicInfoView()}
        <Text
          style={[
            Styles.secLabel,
            Theme.fonts.default.regular,
            { marginTop: 40 },
          ]}>
          {I18n.t('transfer_amount')}
        </Text>
        <View
          style={[
            Styles.bottomBoarderContainer,
            { flexDirection: 'column', alignItems: 'flex-start' },
          ]}>
          <Text selectable style={Styles.secContent}>
            {`${amountNum}  ETH`}
          </Text>
          <Text
            selectable
            style={[
              Styles.convertedNumText,
              Theme.fonts.default.regular,
              { marginTop: 5, fontSize: 12 },
            ]}>
            {`≈ ${exchangeCurrency} \$${getExchangeAmount(
              amountNum,
              3,
              { currency: Coin.ETH, tokenAddress: '' },
              exchangeCurrency,
              currencyPrice,
              '0.000'
            )}`}
          </Text>
          {balanceText && (
            <Text style={[Styles.inputAvailableValue]}>{balanceText}</Text>
          )}
          {amountError.key && (
            <Text style={[Styles.inputError]}>
              {I18n.t(amountError.key, amountError.p)}
            </Text>
          )}
        </View>
        <Text style={Styles.secLabel}>{I18n.t('from')}</Text>
        <View style={Styles.bottomBoarderContainer}>
          <Text
            selectable
            style={[Styles.secContent, Theme.fonts.default.regular]}>
            {tx.from}
          </Text>
        </View>
        <Text style={Styles.secLabel}>{I18n.t('to')}</Text>
        <View style={Styles.bottomBoarderContainer}>
          <Text
            selectable
            style={[Styles.secContent, Theme.fonts.default.regular]}>
            {tx.to}
          </Text>
        </View>
        {!HIDE_TRANSACTION_ERRORS.includes(amountError.key) && (
          <>
            <Text style={[Styles.labelBlock]}>{I18n.t('blockchain_fee')}</Text>
            <DegreeSelecter
              itemStyle={Styles.block}
              getValue={(item = {}) => `${item.amount} ETH`}
              valueObj={fee}
              outerWidth={sliderOuterWidth[Platform.OS || 'android']}
              innerWidth={sliderInnerWidth[Platform.OS || 'android']}
              reserveErrorMsg={false}
              style={{
                marginTop: 16,
              }}
              labels={[I18n.t('slow'), I18n.t('medium'), I18n.t('fast')]}
              onSelect={value => {
                setSelectedFee(value);
                _checkAmountNumerical(amountNum, value, fee);
              }}
            />
          </>
        )}
      </View>
    );
  };
  return (
    <Container
      style={[Styles.bottomContainer, { justifyContent: 'space-between' }]}>
      <Headerbar
        backIcon={require('../assets/image/ic_cancel.png')}
        transparent
        title={title}
      />

      <ScrollView>{_getSubView()}</ScrollView>
      {HIDE_TRANSACTION_ERRORS.includes(amountError.key) ? (
        <View style={{ marginTop: 8 }}>
          <Text
            style={[Styles.inputError, { width: '86%', alignSelf: 'center' }]}>
            {I18n.t('cannot_approve_template', {
              msg: I18n.t(amountError.key, amountError.p),
            })}
          </Text>
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={[
              Styles.bottomButton,
              {
                backgroundColor: theme.colors.error,
                marginBottom: 3,
                marginTop: 6,
              },
            ]}
            // disabled={feeError != null}
            labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
            onPress={() => {
              _rejectRequest(I18n.t(amountError.key, amountError.p));
              goBack();
            }}>
            {I18n.t('cancel')}
          </RoundButton2>
        </View>
      ) : (
        <View style={{ marginTop: 8 }}>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              _rejectRequest(I18n.t('user_reject_call_request_message'));
              goBack();
            }}>
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 16,
              }}>
              {I18n.t('reject')}
            </Text>
          </TouchableOpacity>

          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={[Styles.bottomButton]}
            disabled={amountError.key != null}
            labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
            onPress={async () => {
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
                from: 'Request',
                isSms: isSms,
                callback: (pinSecret, type, actionToken, code) => {
                  // NavigationService.navigate('Withdraw', {});
                  _approveRequest(pinSecret, type, actionToken, code);
                },
                onError: error => {
                  FileLogger.debug(`${payload.method} fail: ${error.message}`);
                  _rejectRequest(
                    I18n.t(`error_msg_${error.code}`, {
                      defaultValue: error.message,
                    })
                  );
                  goBack();
                },
              });
            }}>
            {I18n.t('approve')}
          </RoundButton2>
        </View>
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
          successButtonText={result.successButtonText}
          secondaryConfig={result.secondaryConfig}
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
export default withTheme(RequestScreen);
