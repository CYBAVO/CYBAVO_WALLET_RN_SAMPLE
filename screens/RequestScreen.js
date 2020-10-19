import React, { useState, useEffect } from 'react';
import { FileLogger } from 'react-native-file-logger';
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useBackHandler } from '@react-native-community/hooks';
import { withTheme, Text } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
} from '../components/ResultModal';
import {
  approveRequest,
  fetchApiHistory,
  rejectRequest,
} from '../store/actions';
import { Container } from 'native-base';
import Styles from '../styles/Styles';
import Headerbar from '../components/Headerbar';
import DegreeSlider from '../components/DegreeSlider';
import {
  Coin,
  ROUND_BUTTON_HEIGHT,
  sliderInnerWidth,
  sliderOuterWidth,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { Wallets, WalletConnectSdk } from '@cybavo/react-native-wallet-service';
const { WalletConnectManager, WalletConnectHelper } = WalletConnectSdk;
import {
  convertAmountFromRawNumber,
  convertHexToString,
  getAvailableBalance,
  getEstimateFee,
  getExchangeAmount,
  getWalletKeyByWallet,
  hasValue,
  toastError,
} from '../Helpers';
import { convertHexToUtf8 } from '@walletconnect/utils';
import { Theme } from '../styles/MainTheme';
import BigNumber from 'bignumber.js';
import InputPinCodeModal from './InputPinCodeModal';

const RequestScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();
  const peerId = useNavigationParam('peerId');
  const payload = useNavigationParam('payload');
  const walletId = useNavigationParam('walletId');
  const [amountError, setAmountError] = useState({});
  const isSessionRequest = WalletConnectHelper.isSessionRequest(payload.method);
  const [inputPinCode, setInputPinCode] = useState(null);
  const [fee, setFee] = useState({});
  const [feeKeys, setFeeKeys] = useState([]);
  const [selectedFee, setSelectedFee] = useState('high');
  const [amountNum, setAmountNum] = useState(0);
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
    payload.method == 'eth_sendTransaction'
      ? I18n.t('transaction_request')
      : I18n.t('sign_request');
  const exchangeCurrency = useSelector(
    state => state.currencyPrice.exchangeCurrency
  );
  const currencyPrice = useSelector(
    state => state.currencyPrice.currencyPrice || {}
  );
  const _finishInputPinCode = () => {
    setInputPinCode(null);
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
            _rejectRequest(peerId, error.message);
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
    if (payload.method == 'eth_sendTransaction') {
      const tx = payload.params[0];
      const amount = convertAmountFromRawNumber(convertHexToString(tx.value));
      setAmountNum(amount);
      _fetchWithdrawInfo(amount, tx.gas);
    }
  }, []);

  const _walletConnectSignTypedData = async pinSecret => {
    try {
      setLoading(true);
      let message = payload.params[1];
      FileLogger.debug(
        `>>_walletConnectSignTypedData${message}, walletId:${walletId}`
      );
      let result = await Wallets.walletConnectSignTypedData(
        walletId,
        message,
        pinSecret
      );
      let response = { result: '0x' + result.signedTx, id: payload.id };
      await dispatch(approveRequest(peerId, response));
      _finishInputPinCode();
      goBack();
    } catch (error) {
      _finishInputPinCode();

      FileLogger.debug(`_walletConnectSignTypedData fail:${error.message}`);
      setResult({
        type: TYPE_FAIL,
        error: error.message,
        title: I18n.t('failed_template', { name: 'SignTypedData' }),
        buttonClick: () => {
          setResult(null);
          goBack();
        },
      });
      _rejectRequest(peerId, error.message);
    }
    setLoading(false);
  };
  const _walletConnectSignMessage = async pinSecret => {
    try {
      setLoading(true);
      let message = payload.params[0];
      let utf8Msg = convertHexToUtf8(message);

      FileLogger.debug(
        `>>_walletConnectSignMessage_${message},utf8:${utf8Msg}`
      );
      let result = await Wallets.walletConnectSignMessage(
        walletId,
        utf8Msg,
        pinSecret
      );
      let response = { result: result.signedMessage, id: payload.id };
      await dispatch(approveRequest(peerId, response));
      _finishInputPinCode();
      goBack();
    } catch (error) {
      _finishInputPinCode();
      FileLogger.debug(`>>_walletConnectSignMessage fail:${error}`);
      setResult({
        type: TYPE_FAIL,
        error: error.message,
        title: I18n.t('failed_template', { name: 'SignMessage' }),
        buttonClick: () => {
          setResult(null);
          goBack();
        },
      });
      _rejectRequest(peerId, error.message);
    }
    setLoading(false);
  };
  const _walletConnectSignTransaction = async pinSecret => {
    try {
      setLoading(true);
      const tx = payload.params[0];
      const transactionFee = fee[selectedFee];
      // let signParams = JSON.stringify(tx);
      let result = await Wallets.walletConnectSignTransaction(
        walletId,
        tx,
        transactionFee.amount,
        pinSecret,
        true,
        value => {
          console.debug('onLog', value);
          FileLogger.debug(
            `>>_walletConnectSignTransaction_${payload.method}, ${value}`
          );
        }
      );
      console.debug(
        '_walletConnectSignTransaction1:' + result.signedTx,
        payload.id
      );
      FileLogger.debug(
        `walletConnectSignTransaction success: ${result.signedTx}, walletId:${walletId}`
      );
      let result2 = await Wallets.walletConnectSendSignedTransaction(
        walletId,
        result.signedTx
      );
      console.debug(
        '_walletConnectSignTransaction2:' + result2.txid,
        result2.state
      );
      FileLogger.debug(
        `walletConnectSendSignedTransaction success: ${result2.txid}, state:${result2.state}`
      );
      let response = { result: result2.txid, id: payload.id };
      console.debug(
        'walletConnectSignTransaction3:' + JSON.stringify(response)
      );
      await dispatch(approveRequest(peerId, response));
      _finishInputPinCode();
      goBack();
    } catch (error) {
      FileLogger.debug(`_walletConnectSignTransaction fail: ${error.message}`);
      _finishInputPinCode();
      setResult({
        type: TYPE_FAIL,
        error: error.message,
        title: I18n.t('failed_template', { name: 'SignTransaction' }),
        buttonClick: () => {
          setResult(null);
          goBack();
        },
      });
      console.debug(error);
      _rejectRequest(error.message);
    }
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
  const _approveRequest = async pinSecret => {
    let response;
    switch (payload.method) {
      case 'eth_sendTransaction':
        _walletConnectSignTransaction(pinSecret);
        break;
      case 'eth_sign':
      case 'personal_sign':
        _walletConnectSignMessage(pinSecret);
        break;
      case 'eth_signTypedData':
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData_v3':
        _walletConnectSignTypedData(pinSecret);
        break;
    }
  };
  const _getSubView = () => {
    switch (payload.method) {
      case 'eth_sendTransaction':
        return _getTransactionView();
      case 'eth_sign':
      case 'personal_sign':
        return _getSignView();
      case 'eth_signTypedData':
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData_v3':
        return _getSignTypedDataView();
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
            Theme.fonts.default.regular,
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
  const _getSignView = () => {
    const message = payload.params[0];
    const address = payload.params[1];
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
  const _getSignTypedDataView = () => {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}>
        {_getBasicInfoView()}
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
            <DegreeSlider
              // keys={feeKeys}
              getValue={(item = {}) => `${item.amount} ETH`}
              valueObj={fee}
              outerWidth={sliderOuterWidth[Platform.OS || 'android']}
              innerWidth={sliderInnerWidth[Platform.OS || 'android']}
              style={{
                paddingHorizontal: 16,
              }}
              onSlidingComplete={value => {
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
            onPress={() => {
              setInputPinCode(payload.method);
            }}>
            {I18n.t('approve')}
          </RoundButton2>
        </View>
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
      <InputPinCodeModal
        title={title}
        isVisible={inputPinCode != null}
        onCancel={() => {
          _finishInputPinCode();
        }}
        loading={loading}
        onInputPinCode={_approveRequest}
      />
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
