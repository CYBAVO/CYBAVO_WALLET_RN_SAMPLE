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
  ImageBackground,
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
  approveSessionRequest,
  dequeueRequest,
  fetchApiHistory,
  killAllSession,
  rejectRequest,
  rejectSessionRequest,
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
  EDIT_ICON,
  ROUND_BUTTON_HEIGHT,
  sliderInnerWidth,
  sliderOuterWidth,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { titleKeys, TYPE_CANCEL } from '../components/ReplaceTransactionModal';
import {
  Wallets,
  WalletConnectSdk,
  getEstimateGas,
} from '@cybavo/react-native-wallet-service';
const { WalletConnectManager, WalletConnectHelper } = WalletConnectSdk;
import {
  checkAuthType,
  convertAmountFromRawNumber,
  convertHexToString,
  convertHexToUtf8,
  extractAddress,
  focusNext,
  getAddressTagObjFromResult,
  getAddressTagsFromResult,
  getAvailableBalance,
  getEstimateFee,
  getExchangeAmount,
  getFeeUnit,
  getScoreColor,
  getWalletKeyByWallet,
  getWarningView,
  hasValue,
  isETHForkChain,
  sleep,
  toastError,
} from '../Helpers';
import { Theme } from '../styles/MainTheme';
import BigNumber from 'bignumber.js';
import walletconnect from '../store/reducers/walletconnect';
import InputPinCodeModal from './InputPinCodeModal';
import FeeDegreeSelector from '../components/FeeDegreeSelector';
import CheckBox from '../components/CheckBox';
import CompoundTextInput from '../components/CompoundTextInput';
import { EIP155_SIGNING_METHODS } from '../data/EIP155Data';
const { width, height } = Dimensions.get('window');
const STEP_INIT = 0;
const STEP_AML = 1;

const Eip155RequestScreen: () => React$Node = ({ theme }) => {
  const refs = [useRef()];
  const scrollView = useRef();
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();
  const requestEvent = useNavigationParam('requestEvent');
  const requestSession = useNavigationParam('requestSession');
  const payload = requestEvent ? requestEvent.params.request : {};
  const wallet = useNavigationParam('wallet');

  const [amountError, setAmountError] = useState({});
  const [fee, setFee] = useState({});
  const [selectedFee, setSelectedFee] = useState('high');
  const [amountNum, setAmountNum] = useState(0);
  const [eip155, setEip155] = useState(false);
  const [isHex, setIsHex] = useState(true);
  const [legacySign, setLegacySign] = useState(false);
  const [permitConfirmed, setPermitConfirmed] = useState(false);
  const [initAml, setInitAml] = useState(false);
  const [initGasLimit, setInitGasLimit] = useState(false);
  const [amlConfirmed, setAmlConfirmed] = useState(false);
  const [addressTagsObj, setAddressTagsObj] = useState(null); //score, tags, model
  const [gasLimit, setGasLimit] = useState('121000'); //121000
  const [gasLimitError, setGasLimitError] = useState(null);
  const [minGasLimit, setMinGasLimit] = useState('21000');
  const [showAdvanceSign, setShowAdvanceSign] = useState(false);
  const [customFeeGwei, setCustomFeeGwei] = useState('');
  const [customFee, setCustomFee] = useState('');
  const [customFeeErr, setCustomFeeErr] = useState(null);
  const [step, setStep] = useState(STEP_INIT);
  const CUSTOM_FEE_KEY = 'custom';
  const feeUnit = useSelector(state => {
    return getFeeUnit(wallet, state.currency.currencies);
  });
  const enableBiometrics = useSelector(
    state => state.user.userState.enableBiometrics
  );
  const apiVersion = useSelector(state => state.walletconnect.apiVersion);
  const skipSmsVerify = useSelector(
    state => state.user.userState.skipSmsVerify
  );
  const accountSkipSmsVerify = useSelector(
    state => state.user.userState.accountSkipSmsVerify
  );
  const bioSetting = useSelector(state => state.user.userState.bioSetting);
  const [loading, setLoading] = useState(false);
  const { navigate, goBack } = useNavigation();
  const balanceItem = useSelector(state => {
    let balances = state.balance.balances || {};
    return balances[getWalletKeyByWallet(wallet)];
  });
  const isTransactionRequest =
    payload.method == EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION ||
    payload.method == EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION;

  const title = isTransactionRequest
    ? I18n.t('transaction_request')
    : payload.method == EIP155_SIGNING_METHODS.ETH_SEND_RAW_TRANSACTION
    ? I18n.t('send_signed_transaction')
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

  const _leaveAndDequeue = () => {
    goBack();
    dispatch(dequeueRequest());
  };
  const _fetchWithdrawInfo = async (amount, gas) => {
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
        rawFee.custom = {
          amount: '',
          description: '',
          editable: true,
        };
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
            _rejectRequest();
            setResult(null);
            _leaveAndDequeue();
          },
        },
      });

      setFee({
        low: { amount: '0.000000108', description: 'low d' },
        medium: { amount: '0.000000108', description: 'medium d' },
        high: { amount: '0.000000108', description: 'high d' },
        custom: {
          amount: '',
          description: '',
          editable: true,
        },
      });
      _checkAmountNumerical(amount, 'low', fee);
    }
    setLoading(false);
  };
  // handle back
  useBackHandler(() => {
    return true;
  });
  useEffect(() => {
    if (requestEvent == null || wallet == null) {
      _leaveAndDequeue();
    }
  }, [requestEvent, wallet]);
  useEffect(() => {
    if (apiVersion.signOptions == false) {
      setIsHex(false);
    }
  }, [apiVersion]);
  useEffect(() => {
    _getAddressTag();
    if (
      payload.method == 'eth_sendTransaction' ||
      payload.method == 'eth_signTransaction'
    ) {
      _initGasLimit(payload, wallet.walletId);
      const tx = payload.params[0];
      const amount = convertAmountFromRawNumber(convertHexToString(tx.value));
      setAmountNum(amount);
      _fetchWithdrawInfo(amount, tx.gas);
    } else {
      setInitGasLimit(true);
    }
  }, []);

  const _initGasLimit = (payload, walletId) => {
    const tx = payload.params[0];
    let signParams = WalletConnectSdk.WalletConnectHelper.getValidSignParams(
      tx,
      '0.000000009',
      0,
      value => {
        console.debug('onLog', value);
      },
      '21000'
    );
    const minGasLimit = convertHexToString(tx.gas);
    let gasLimitN = Number(minGasLimit);
    Wallets.getEstimateGas(walletId, signParams)
      .then(result => {
        if (result.gasLimit) {
          _setGasLimit(gasLimitN, minGasLimit, new BigNumber(result.gasLimit));
        } else {
          _setGasLimit(gasLimitN, minGasLimit);
        }
        setInitGasLimit(true);
      })
      .catch(error => {
        toastError(error);
        _setGasLimit(gasLimitN, minGasLimit, new BigNumber(result.gasLimit));
        setInitGasLimit(true);
      });
  };
  const _setGasLimit = (gasLimitN, minGasLimit, gasLimit2) => {
    if (isNaN(gasLimitN)) {
      setGasLimit(minGasLimit);
      setMinGasLimit(minGasLimit);
    } else {
      let gasLimit = new BigNumber(gasLimitN);
      if (gasLimit2 != null) {
        gasLimit = gasLimit.isGreaterThan(gasLimit2) ? gasLimit : gasLimit2;
      }
      gasLimit = gasLimit
        .plus(200000)
        .toFixed(0)
        .valueOf();
      setGasLimit(gasLimit);
      setMinGasLimit(minGasLimit);
    }
  };
  const _getAddressTag = () => {
    try {
      let address = [];
      switch (payload.method) {
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
          let tx = payload.params[0];
          address = [tx.to];
          break;
        case 'eth_sign':
          address = [payload.params[0]];
          break;
        case 'personal_sign':
          address = [payload.params[1]];
          break;
        case 'eth_sendRawTransaction':
          return;
        default:
          if (payload.method.startsWith('eth_signTypedData')) {
            address = [payload.params[0]];
            address = address.concat(
              extractAddress(JSON.parse(payload.params[1]))
            );
          }
          break;
      }
      console.debug('getAddressTags>', address.join(','));
      if (false) {
        setAddressTagsObj([
          {
            address: '0x415a47e3333052bd79c63776720452a3db84c633',
            items: [
              {
                bold: 'Score 100: ',
                normal: 'tag1, tag2, tag1,',
              },
              {
                bold: 'Score 80: ',
                normal: 'tag3, tag45678899000qwersdfkjldkjfl;sdkj;sj',
              },
              {
                bold: 'Score 99: ',
                normal:
                  'tag1, tag2, tag1, tag2, tag1, tag2, tag1, tag2333444555666',
              },
              {
                bold: 'Score 93: ',
                normal:
                  'tag1, tag2, tag1, tag2, tag1, tag2, tag1, tag2333444555666',
              },
            ],
          },
          {
            address: '0x123a47e3333052bd79c63776720452a3db84c633',
            items: [
              {
                bold: 'Provider2 - Score 80: ',
                normal: 'tag3j',
              },
              {
                bold: 'Provider3 - Score 99: ',
                normal: 'tag1, tag2, tag1',
              },
              {
                bold: 'Provider4 - Score 93: ',
                normal:
                  'tag1, tag2, tag1, tag2, tag1, tag2, tag1, tag2333444555666',
              },
              {
                bold: 'Provider1 - Score 100: ',
                normal:
                  'tag1, tag2, tag1, tag2, tag1, tag2, tag1, tag2333444555666',
              },
            ],
          },
        ]);
        setInitAml(true);
        return;
      }
      if (false) {
        address = [
          '0x415a47e3333052bd79c63776720452a3db84c633',
          '0x56eb4a5f64fa21e13548b95109f42fa08a644628',
        ];
      }
      Wallets.getAddressesTags(wallet.currency, address)
        .then(result => {
          let { addressTagMap } = result;
          if (false) {
            addressTagMap['0xEEEa47e3333052bd79c63776720452a3db84c633'] = {
              whiteList: false,
              tags: ['test1'],
              score: 70,
              providers: {},
              provider: '',
              blackList: true,
            };
            addressTagMap['0xEEE1a47e3333052bd79c63776720452a3db84c633'] = {
              whiteList: false,
              score: 90,
              providers: {},
              provider: '',
              blackList: true,
            };
            addressTagMap['0xEEE2a47e3333052bd79c63776720452a3db84c633'] = {
              whiteList: false,
              score: 90,
              tags: ['test2'],
              providers: {},
              provider: '',
              blackList: false,
            };
            addressTagMap['0xEEE3a47e3333052bd79c63776720452a3db84c633'] = {
              whiteList: false,
              score: 90,
              tags: [
                'test2',
                'test2',
                'test2',
                'test2',
                'test2',
                'test2',
                'test2',
                'test2',
                'test2',
                'test2',
              ],
              providers: {},
              provider: '',
              blackList: true,
            };
          }
          let { tagObjArr } = getAddressTagObjFromResult(addressTagMap);
          if (tagObjArr.length > 0) {
            setAddressTagsObj(tagObjArr);
          }
          setInitAml(true);
        })
        .catch(error => {
          toastError(error);
          setInitAml(true);
        });
    } catch (err) {
      setInitAml(true);
      console.log('getAddressTag err', err);
    }
  };
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
        `>>_walletConnectSignTypedData${message}, walletId:${wallet.walletId}`
      );
      switch (type) {
        case AUTH_TYPE_SMS:
          tag = 'walletConnectSignTypedDataSms';
          result = await Wallets.walletConnectSignTypedDataSms(
            actionToken,
            code,
            wallet.walletId,
            message,
            pinSecret
          );
          break;
        case AUTH_TYPE_BIO:
          tag = 'walletConnectSignTypedDataBio';
          result = await Wallets.walletConnectSignTypedDataBio(
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            wallet.walletId,
            message,
            pinSecret
          );
          break;
        case AUTH_TYPE_OLD:
          tag = 'walletConnectSignTypedData';
          result = await Wallets.walletConnectSignTypedData(
            wallet.walletId,
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
      await dispatch(approveSessionRequest(requestEvent, result.signedTx));
      _leaveAndDequeue();
      dispatch(fetchApiHistory());
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
    message,
    signMessageActionToken
  ) => {
    let tag = '_walletConnectSignMessage';
    try {
      setLoading(true);
      let paramMsg = _getMessageToSign(message);

      FileLogger.debug(
        `>>_walletConnectSignMessage_${message},paramMsg:${paramMsg}`
      );
      let result;
      let extras = {
        eip155: eip155,
        is_hex: isHex,
        legacy: legacySign,
        confirmed_action_token: signMessageActionToken,
      };
      switch (type) {
        case AUTH_TYPE_SMS:
          tag = '_walletConnectSignMessageSms';
          result = await Wallets.walletConnectSignMessageSms(
            actionToken,
            code,
            wallet.walletId,
            paramMsg,
            pinSecret,
            extras
          );
          break;
        case AUTH_TYPE_BIO:
          tag = '_walletConnectSignMessageBio';
          result = await Wallets.walletConnectSignMessageBio(
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            wallet.walletId,
            paramMsg,
            pinSecret,
            extras
          );
          break;
        case AUTH_TYPE_OLD:
          tag = '_walletConnectSignMessage';
          result = await Wallets.walletConnectSignMessage(
            wallet.walletId,
            paramMsg,
            pinSecret,
            extras
          );
          break;
      }
      await dispatch(approveSessionRequest(requestEvent, result.signedMessage));
      _leaveAndDequeue();
      dispatch(fetchApiHistory());
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
          _leaveAndDequeue();
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
      _leaveAndDequeue();
    }
  };
  const _walletConnectSendRawTransaction = async () => {
    let tag = '_walletConnectSendRawTransaction';
    setLoading(true);
    try {
      const tx = payload.params[0];
      let result2 = await Wallets.walletConnectSendSignedTransaction(
        wallet.walletId,
        tx
      );
      FileLogger.debug(
        `${tag} success: ${result2.txid}, walletId:${wallet.walletId}`
      );
      await dispatch(approveSessionRequest(requestEvent, result2.txid));
      _leaveAndDequeue();
    } catch (error) {
      _handleFail('SendRawTransaction', tag, error);
    }
    dispatch(fetchApiHistory());
    setLoading(false);
  };
  const _walletConnectSignTransaction = async (
    pinSecret,
    type,
    actionToken,
    code,
    onlySign
  ) => {
    let feeAmount = null;
    if (hasValue(customFeeErr)) {
      return;
    }
    if (hasValue(gasLimitError)) {
      return;
    }
    let tag = onlySign
      ? '_walletConnectSignTransaction'
      : '_walletConnectSignSendTransaction';
    try {
      setLoading(true);
      const tx = payload.params[0];
      if (selectedFee == CUSTOM_FEE_KEY) {
        feeAmount = customFee;
      } else {
        feeAmount = fee[selectedFee].amount;
      }
      // let signParams = JSON.stringify(tx);
      let result;
      switch (type) {
        case AUTH_TYPE_SMS:
          tag = tag + 'Sms';
          result = await Wallets.walletConnectSignTransactionSms(
            actionToken,
            code,
            wallet.walletId,
            tx,
            feeAmount,
            pinSecret,
            true,
            value => {
              console.debug('onLog', value);
              FileLogger.debug(`>>${tag}_${payload.method}, ${value}`);
            },
            gasLimit
          );
          break;
        case AUTH_TYPE_BIO:
          tag = tag + 'Bio';
          await sleep(1000); // wait InputPinSms dismiss
          result = await Wallets.walletConnectSignTransactionBio(
            I18n.t('bio_msg'),
            I18n.t('cancel'),
            wallet.walletId,
            tx,
            feeAmount,
            pinSecret,
            true,
            value => {
              console.debug('onLog', value);
              FileLogger.debug(`>>${tag}_${payload.method}, ${value}`);
            },
            gasLimit
          );
          break;
        case AUTH_TYPE_OLD:
          result = await Wallets.walletConnectSignTransaction(
            wallet.walletId,
            tx,
            feeAmount,
            pinSecret,
            true,
            value => {
              console.debug('onLog', value);
              FileLogger.debug(`>>${tag}_${payload.method}, ${value}`);
            },
            gasLimit
          );
          break;
      }
      console.debug(tag + result.signedTx, payload.id, gasLimit);
      FileLogger.debug(
        `${tag} success: ${result.signedTx}, walletId:${wallet.walletId}, gasLimit:${gasLimit}`
      );
      if (onlySign) {
        if (
          !result.signedTx.startsWith('0x') &&
          !result.signedTx.startsWith('0X')
        ) {
          result.signedTx = '0x' + result.signedTx;
        }
        await dispatch(approveSessionRequest(requestEvent, result.signedTx));
        _leaveAndDequeue();
        dispatch(fetchApiHistory());
        setLoading(false);
        return;
      }
      let result2 = await Wallets.walletConnectSendSignedTransaction(
        wallet.walletId,
        result.signedTx
      );
      console.debug(tag + '2:' + result2.txid, result2.state);
      FileLogger.debug(
        `${tag}2 success: ${result2.txid}, state:${result2.state}`
      );
      await dispatch(approveSessionRequest(requestEvent, result2.txid));
      _leaveAndDequeue();
    } catch (error) {
      _handleFail('SignTransaction', tag, error);
    }
    // dispatch(walletconnectSync());
    dispatch(fetchApiHistory());
    setLoading(false);
  };
  const _rejectRequest = async () => {
    await dispatch(rejectSessionRequest(requestEvent));
  };
  const _approveRequest = async (
    pinSecret,
    type,
    actionToken,
    code,
    signMessageActionToken
  ) => {
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
          payload.params[1],
          signMessageActionToken
        );
        break;
      case 'personal_sign':
        _walletConnectSignMessage(
          pinSecret,
          type,
          actionToken,
          code,
          payload.params[0],
          signMessageActionToken
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
    switch (step) {
      case STEP_INIT:
        return _getSubViewStep0();
      case STEP_AML:
        return _getAmlView();
    }
  };
  const _getSubViewStep0 = () => {
    switch (payload.method) {
      case 'eth_signTransaction':
      case 'eth_sendTransaction':
        return _getTransactionView();
      case 'eth_sign':
        return _getSignView(payload.params[0], payload.params[1]);
      case 'personal_sign':
        return _getSignView(payload.params[1], payload.params[0]);
      case 'eth_sendRawTransaction':
        return _getSendView(payload.params[0]);
      default:
        if (payload.method.startsWith('eth_signTypedData')) {
          return _getSignTypedDataView(JSON.parse(payload.params[1]));
        }
    }
  };
  const _getAmlAddressItemView = tagObj => {
    return (
      <View
        style={{
          paddingBottom: 20,
          marginTop: 40,
          borderBottomColor: theme.colors.countryCodeBg,
          borderBottomWidth: 1,
          flex: 0,
        }}>
        <Text style={Styles.secLabel}>{I18n.t('address')}</Text>
        <View
          style={[
            Styles.bottomBoarderContainer,
            { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
          ]}>
          <Text
            selectable
            style={[Styles.secContent, Theme.fonts.default.regular]}>
            {tagObj.address}
          </Text>
        </View>
        {tagObj.items.map((item, index) => {
          return (
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                backgroundColor: theme.colors.error15,
                alignSelf: 'baseline', //wrap-content
              }}>
              <Text
                style={[
                  {
                    color: theme.colors.error,
                    fontSize: 14,
                  },
                  Theme.fonts.default.heavyMax,
                ]}>
                {item.bold}
              </Text>
              <Text
                style={[
                  {
                    color: theme.colors.error,
                    fontSize: 12,
                    flexShrink: 1,
                  },
                ]}>
                {item.normal}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };
  const _getAmlView = () => {
    if (!addressTagsObj) {
      return;
    }
    return (
      <React.Fragment>
        {getWarningView(I18n.t('aml_title'), I18n.t('aml_warning_contract'), {
          marginHorizontal: 16,
        })}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 16,
            paddingTop: 0,
          }}>
          {addressTagsObj.map(tagObj => {
            return _getAmlAddressItemView(tagObj);
          })}
        </View>
        <CheckBox
          style={{ marginTop: 20, marginHorizontal: 16, marginBottom: 16 }}
          text={I18n.t('aml_checkbox_hint')}
          textStyle={{ fontWeight: 'bold' }}
          selected={amlConfirmed}
          onPress={() => setAmlConfirmed(!amlConfirmed)}
        />
      </React.Fragment>
    );
  };
  const _getPermitInfoView = () => {
    if (requestSession == null) {
      return;
    }
    const peerMeta = requestSession.peer.metadata;
    // const chainId = requestEvent.params.chainId;
    let domainName = payload.domainName || '';
    let bgOvalSize = 48 * 1.6;
    return (
      <React.Fragment>
        {getWarningView(
          I18n.t('permit_warning', {
            name: peerMeta.name,
            domainName: domainName,
          }),
          I18n.t('permit_warning_desc', {
            name: peerMeta.name,
            domainName: domainName,
          })
        )}
        <CheckBox
          text={I18n.t('aml_checkbox_hint')}
          style={{ width: '90%', marginTop: 20, marginBottom: 20 }}
          selected={permitConfirmed}
          onPress={() => setPermitConfirmed(!permitConfirmed)}
        />
      </React.Fragment>
    );
  };
  const _getBasicInfoView = () => {
    if (requestSession == null) {
      return;
    }
    const peerMeta = requestSession.peer.metadata;
    // const chainId = requestEvent.params.chainId;
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
            style={{ width: 48, height: 48 }}
          />
        </View>
        <Text
          style={[
            Theme.fonts.default.black,
            {
              textAlign: 'center',
              fontSize: 20,
              marginTop: 16,
            },
          ]}>
          {peerMeta.name}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: Theme.colors.resultTitle,
            textAlign: 'center',
            marginTop: 8,
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
        <CheckBox
          style={{ marginTop: 50 }}
          text={I18n.t('no_eip155_title')}
          subText={I18n.t('no_eip155_desc')}
          selected={!eip155}
          onPress={() => {
            setEip155(!eip155);
          }}
        />
        <CheckBox
          text={I18n.t('no_legacy_sign_title')}
          subText={I18n.t('no_legacy_sign_desc')}
          selected={!legacySign}
          onPress={() => {
            setLegacySign(!legacySign);
          }}
        />
        {showAdvanceSign && (
          <CheckBox
            text={I18n.t('use_hex_title')}
            selected={isHex}
            onPress={() => {
              setIsHex(!isHex);
            }}
          />
        )}

        <TouchableOpacity
          style={{
            marginTop: 0,
            marginLeft: 16,
          }}
          onPress={() => setShowAdvanceSign(!showAdvanceSign)}>
          <Text
            style={[
              {
                color: theme.colors.primary,
                fontSize: 12,
                fontWeight: '800',
                textDecorationLine: 'underline',
              },
              Theme.fonts.default.medium,
            ]}>
            {I18n.t(showAdvanceSign ? 'see_less' : 'see_more')}
          </Text>
        </TouchableOpacity>
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

  const _getSendView = msg => {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}>
        {_getBasicInfoView()}
        <Text style={Styles.secLabel}>{I18n.t('message')}</Text>
        <View style={Styles.bottomBoarderContainer}>
          <Text
            selectable
            style={[Styles.secContent, Theme.fonts.default.regular]}>
            {msg}
          </Text>
        </View>
      </View>
    );
  };
  const _getSignTypedDataView = typedData => {
    const address = payload.params[0];
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}>
        {payload.isPermit ? _getPermitInfoView() : _getBasicInfoView()}

        <Text
          style={[
            Styles.secLabel,
            Theme.fonts.default.regular,
            { marginTop: 0 },
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
        <Text style={[Styles.secLabel, { marginTop: 16 }]}>
          {I18n.t('message')}
        </Text>
        {typedData &&
          Object.keys(typedData).map((key, idx) =>
            typeof typedData[key] === 'object' ? (
              <View key={idx}>
                <Text
                  style={[
                    {
                      fontSize: 14,
                      color: theme.colors.text,
                      marginVertical: 4,
                      marginTop: 16,
                    },
                    Theme.fonts.default.heavyMax,
                  ]}>
                  {key}
                </Text>
                {Object.keys(typedData[key]).map((key2, idx) => (
                  <View style={{}}>
                    <Text
                      style={[
                        Styles.tag,
                        {
                          fontSize: 12,
                          marginTop: 20,
                          color: theme.colors.text,
                          textAlign: 'left',
                          alignSelf: 'flex-start',
                          backgroundColor: theme.colors.tagBg,
                        },
                      ]}>
                      {key2}
                    </Text>
                    <Text
                      style={[
                        {
                          fontSize: 12,
                          color: theme.colors.gray3,
                          marginTop: 8,
                        },
                      ]}>
                      {typeof typedData[key][key2] === 'object'
                        ? JSON.stringify(typedData[key][key2])
                        : `${typedData[key][key2]}`}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{}}>
                <Text
                  style={[
                    {
                      fontSize: 14,
                      color: theme.colors.text,
                      marginTop: 16,
                    },
                    Theme.fonts.default.heavyMax,
                  ]}>
                  {key}
                </Text>
                <Text
                  style={[
                    {
                      fontSize: 12,
                      color: theme.colors.gray3,
                      marginTop: 8,
                    },
                  ]}>
                  {`${typedData[key]}`}
                </Text>
              </View>
            )
          )}
      </View>
    );
  };
  const HIDE_TRANSACTION_ERRORS = [
    'error_input_nan',
    'error_fund_insufficient',
  ];
  const _getFeeCheckValue = (str, ignoreNull) => {
    try {
      if (!hasValue(str)) {
        if (ignoreNull) {
          return { error: null, str: str };
        } else {
          return { error: I18n.t('error_custom_fee_null'), str: str };
        }
      }
      let value = new BigNumber(str);
      if (value.isNaN()) {
        return { error: I18n.t('error_custom_fee_invalid'), str: str };
      }
      if (value.isZero()) {
        return { error: I18n.t('error_custom_fee_is_zero'), str: str };
      }
      return { error: null, str: value.toFixed(value.decimalPlaces()) };
    } catch (e) {
      return { error: e, str: str };
    }
  };
  const _convertGweiToEth = str => {
    try {
      if (!hasValue(str)) {
        return { error: null, str: str };
      }
      let value = new BigNumber(str);
      if (value.isNaN()) {
        return { error: I18n.t('error_custom_fee_invalid'), str: str };
      }
      value = value.times(new BigNumber('10').pow(-9));
      return { error: null, str: value.toFixed(value.decimalPlaces()) };
    } catch (e) {
      return { error: e, str: str };
    }
  };
  const _checkFee = (key, str, isSelect) => {
    let hasErr = false;
    if (key != CUSTOM_FEE_KEY) {
      setCustomFeeErr(null);
      return hasErr;
    }
    let result = _getFeeCheckValue(str, isSelect);
    if (result.error == null) {
      setCustomFee(result.str);
      setCustomFeeErr(null);
      return hasErr;
    }
    setCustomFee(str);
    setCustomFeeErr(result.error);
    hasErr = true;
    return hasErr;
  };
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
      let f = getEstimateFee(wallet.currency, '', feeStr);
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
      return `${I18n.t('available_balance')} ${value} ${wallet.currencySymbol}`;
    }
    return null;
  };
  const _onGasLimitEditClick = () => {
    if (refs[0].current) {
      refs[0].current.focus();
    }
  };
  const _onGasLimitChanged = value => {
    setGasLimit(value);
  };
  const _checkGasLimit = (str, minStr) => {
    let r = _getGasLimitCheckValue(str, minStr);
    if (r.error == null) {
      setGasLimit(r.str);
      setGasLimitError(null);
      return;
    }
    setGasLimit(str);
    setGasLimitError(r.error);
  };
  const _getGasLimitCheckValue = (str, minStr, ignoreNull) => {
    try {
      if (!hasValue(str)) {
        if (ignoreNull) {
          return { error: null, str: str };
        } else {
          return { error: I18n.t('error_gas_limit_null'), str: str };
        }
      }
      let value = new BigNumber(str);
      if (value.isNaN()) {
        return { error: I18n.t('error_gas_limit_invalid'), str: str };
      }
      let minValue = new BigNumber(minStr);
      if (minValue.isNaN()) {
        return { error: null, str: value.toFixed(value.decimalPlaces()) };
      }
      if (value.isLessThan(minValue)) {
        return {
          error: I18n.t('error_gas_limit_less_then_min', { min: minStr }),
          str: str,
        };
      }
      return { error: null, str: value.toFixed(value.decimalPlaces()) };
    } catch (e) {
      return { error: e, str: str };
    }
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
            { marginTop: 24 },
          ]}>
          {I18n.t('transfer_amount')}
        </Text>
        <View
          style={[
            Styles.bottomBoarderContainer,
            { flexDirection: 'column', alignItems: 'flex-start' },
          ]}>
          <Text selectable style={Styles.secContent}>
            {`${amountNum}  ${wallet.currencySymbol}`}
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
              wallet,
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
        <Text style={Styles.secLabel}>{I18n.t('gas_limit')}</Text>
        <CompoundTextInput
          ref={refs[0]}
          enablesReturnKeyAutomatically={true}
          style={Styles.compoundInput}
          value={gasLimit}
          maxLength={21}
          keyboardType="numeric"
          underlineColor={Theme.colors.normalUnderline}
          hasError={hasValue(gasLimitError)}
          onChangeText={_onGasLimitChanged}
          onBlur={() => {
            _checkGasLimit(gasLimit, minGasLimit);
          }}
          errorMsg={gasLimitError}
          onRightIconClick={_onGasLimitEditClick}
          rightIcon={EDIT_ICON}
          placeholder={I18n.t('gas_limit_placeholder')}
        />
        {!HIDE_TRANSACTION_ERRORS.includes(amountError.key) && (
          <>
            <Text style={[Styles.labelBlock]}>{I18n.t('blockchain_fee')}</Text>
            <FeeDegreeSelector
              initValue={0}
              keys={['high', 'medium', 'low', 'custom']}
              getValue={(item = {}) => `${item.amount} ${feeUnit}`}
              valueObj={fee}
              showEditable={true}
              outerWidth={sliderOuterWidth[Platform.OS || 'android']}
              innerWidth={sliderInnerWidth[Platform.OS || 'android']}
              reserveErrorMsg={false}
              style={{
                marginTop: 20,
              }}
              onSelect={value => {
                setSelectedFee(value);
                _checkFee(value, customFee, true);
                // _checkAmountNumerical(amountNum, value, fee);
              }}
              onBlur={() => {
                _checkFee(selectedFee, customFee, false);
              }}
              onInput={message => {
                let r = _convertGweiToEth(message);
                setCustomFeeGwei(message);
                setCustomFee(r.str || '');
              }}
              currentInput={customFeeGwei}
              currentInputCal={customFee ? `${customFee} ${feeUnit}` : ''}
              inputError={customFeeErr}
            />
          </>
        )}
      </View>
    );
  };
  const _isApproveDisable = () => {
    switch (step) {
      case STEP_INIT:
        return (
          amountError.key != null ||
          (payload.isPermit && !permitConfirmed) ||
          gasLimitError ||
          !initAml ||
          customFeeErr
        );
      case STEP_AML:
        return !amlConfirmed && addressTagsObj;
      default:
        return false;
    }
  };
  const _getMessageToSign = message => {
    if (!isHex) {
      return convertHexToUtf8(message);
    }
    return message;
  };
  const _getSignMessageActionToken = isSms => {
    setLoading(true);
    let msg = '';
    switch (payload.method) {
      case 'eth_sign':
        msg = payload.params[1];
        break;
      case 'personal_sign':
        msg = payload.params[0];
        break;
    }
    Wallets.getSignMessageActionToken(_getMessageToSign(msg))
      .then(r => {
        setLoading(false);
        _showInputPin(isSms, r.actionToken);
      })
      .catch(error => {
        setLoading(false);
        console.log('getSignMessageActionToken failed', error);
        setResult({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t('failed_template', {
            name: 'getSignMessageActionToken',
          }),
          buttonClick: () => {
            setResult(null);
          },
        });
      });
  };
  const _showInputPin = (isSms, signMessageActionToken) => {
    NavigationService.navigate('InputPinSms', {
      modal: true,
      from: 'Eip155Request',
      isSms: isSms,
      callback: (pinSecret, type, actionToken, code) => {
        // NavigationService.navigate('Withdraw', {});
        _approveRequest(
          pinSecret,
          type,
          actionToken,
          code,
          signMessageActionToken
        );
      },
      onError: error => {
        FileLogger.debug(`${payload.method} fail: ${error.message}`);
        _rejectRequest(
          I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          })
        );
        _leaveAndDequeue();
      },
    });
  };
  return (
    <Container
      style={[Styles.bottomContainer, { justifyContent: 'space-between' }]}>
      <Headerbar
        backIcon={require('../assets/image/ic_cancel.png')}
        transparent
        title={title}
      />

      <ScrollView style={{ marginTop: 24 }} ref={scrollView}>
        {_getSubView()}
      </ScrollView>
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
              _leaveAndDequeue();
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
              height: ROUND_BUTTON_HEIGHT,
            }}
            onPress={() => {
              _rejectRequest(I18n.t('user_reject_call_request_message'));
              _leaveAndDequeue();
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
            style={[Styles.bottomButton, { marginTop: 8 }]}
            disabled={_isApproveDisable()}
            labelStyle={[{ color: theme.colors.text, fontSize: 16 }]}
            onPress={async () => {
              if (step == STEP_INIT && addressTagsObj != null) {
                setStep(STEP_AML);
                if (scrollView.current) {
                  scrollView.current.scrollTo({
                    y: 0,
                    animated: false,
                  });
                }
                return;
              }
              if (isTransactionRequest && selectedFee == CUSTOM_FEE_KEY) {
                if (_checkFee(selectedFee, customFee, false)) {
                  return;
                }
              }
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
              if (payload.method == 'eth_sendRawTransaction') {
                _walletConnectSendRawTransaction();
                return;
              }
              if (legacySign && isETHForkChain(wallet.currency)) {
                setResult({
                  type: TYPE_CONFIRM,
                  title: I18n.t('warning'),
                  message: I18n.t('confirm_legacy_sign_message_desc'),
                  buttonClick: () => {
                    setResult(null);
                    _getSignMessageActionToken(isSms);
                  },
                  secondaryConfig: {
                    color: theme.colors.primary,
                    text: I18n.t('cancel'),
                    onClick: () => {
                      setResult(null);
                    },
                  },
                });
                return;
              }
              _showInputPin(isSms);
            }}>
            {I18n.t('approve')}
          </RoundButton2>
        </View>
      )}

      {(!initGasLimit || !initAml || loading) && (
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
export default withTheme(Eip155RequestScreen);
