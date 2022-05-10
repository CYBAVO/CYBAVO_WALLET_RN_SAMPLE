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
import {
  startColors,
  endColors,
  Theme,
  nftStartColors,
  nftEndColors,
} from '../styles/MainTheme';
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
  checkAuthType,
  checkCameraPermission,
  effectiveBalance,
  focusInput,
  focusNext,
  getAvailableBalance,
  getEstimateFee,
  getEstimateResultKey,
  getExchangeAmount,
  getRankSvg,
  getTopRightMarkerSvg,
  getWalletKey,
  getWalletKeyByWallet,
  getFeeNote,
  hasMemo,
  hasValue,
  isBsc,
  isBsc20,
  isErc20,
  isValidEosAccount,
  sleep,
  strToBigNumber,
  toastError,
  getParentCurrency,
  getFeeUnit,
  getAddressTagsFromResult,
  getAddressTagObjFromResult,
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
import FeeDegreeSelector from '../components/FeeDegreeSelector';
import currency from '../store/reducers/currency';
const paddingBottom = {
  ios: 220 * (height / 667),
  android: 0,
};

const WithdrawScreen: () => React$Node = ({ theme }) => {
  const appState = useAppState();
  const dispatch = useDispatch();
  const [transparent, setTransparent] = useState(true);
  const [deductedAmountText, setDeductedAmountText] = useState('');
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const scrollView = useRef();
  const [scrollY] = useState(new Animated.Value(0));
  const w = useNavigationParam('wallet');
  const paramTokenId = useNavigationParam('tokenId');
  const [wallet, setWallet] = useState(w);
  const [currencyTraits, setCurrencyTraits] = useState({});
  const onComplete = useNavigationParam('onComplete');
  const { navigate, goBack } = useNavigation();
  const exchangeCurrency = useSelector(
    state => state.currencyPrice.exchangeCurrency
  );

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
  const time = useSelector(state => state.clock.time);
  const lastRequestSmsTime = useSelector(
    state => state.clock.lastRequestSmsTime
  );
  const countDown = COOL_TIME - (time - lastRequestSmsTime);
  const inCoolTime = countDown > 0;
  const currencies = useSelector(state => {
    return state.currency.currencies;
  });
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
    return getFeeUnit(wallet, state.currency.currencies);
  });
  const feeNote = getFeeNote(wallet.currency, wallet.tokenAddress);
  const balanceTextForFee = useSelector(state => {
    if (hasValue(wallet.tokenAddress)) {
      let balances = state.balance.balances || {};
      const r = wallets.filter(
        w => w.currency === wallet.currency && !w.tokenAddress
      );
      if (r.length > 0) {
        let balanceText = getAvailableBalance(
          balances[getWalletKeyByWallet(r[0])]
        );
        console.debug(`EEE_balanceTextForFee:${balanceText}, ${r[0].name}`);
        return balanceText;
      }
    }
    return null;
  });
  const ACTION_WITHDRAW = 'withdraw';
  const ACTION_SECURE_TOKEN = 'secure_token';

  const _getIndexFromTokenId = id => {
    if (id == null) {
      return 0;
    }
    if (wallet.isNft) {
      let tokens = balanceItem.tokens || [];
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] == id) {
          return i;
        }
      }
      return 0;
    }
  };
  const qrCode = useNavigationParam('qrCode');
  const [showMenu1, setShowMenu1] = useState(false);
  const [receiver, setReceiver] = useState(qrCode);
  const [estimateResultMap, setEstimateResultMap] = useState({});
  const [estimateResult, setEstimateResult] = useState(null);
  const [addressTags, setAddressTags] = useState(null);
  const [addressTagsObj, setAddressTagsObj] = useState(null); //score, tags, model
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFee, setSelectedFee] = useState('high');
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(
    _getIndexFromTokenId(paramTokenId)
  );
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
    _estimateTransaction(r);
  };
  const _hasTransactionFee = () => {
    return fee != null && fee.data != null && fee.data.low != null;
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
      value = value.trim();
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
    if (wallet.tokenVersion == 721) {
      return true;
    }
    if (wallet.tokenVersion == 1155) {
      let intValue = parseInt(value);
      setAmount(intValue ? `${intValue}` : '');
      if (amountError) {
        let intB = parseInt(tokenIds[selectedTokenIndex].amount);
        if (intValue > intB) {
          setAmountError(I18n.t('error_fund_insufficient'));
          return;
        }
        setAmountError(null);
        return;
      }
      return;
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
  const _strToBigNumber = s => {
    try {
      let value = Number(s);
      if (isNaN(value)) {
        return null;
      }
      let v = new BigNumber(value);
      return v;
    } catch (e) {
      return null;
    }
  };
  const _checkAmountMinBalance = (value, fee, minStr) => {
    let valueText = getAvailableBalance(balanceItem);
    let b = _strToBigNumber(valueText);
    if (b == null) {
      return true;
    }
    let min = _strToBigNumber(minStr);
    let remain = b.minus(fee).minus(value);
    if (remain.isLessThan(min)) {
      setAmountError(
        I18n.t('amount_check_template_min_balance', {
          v: minStr,
          symbol: wallet.currencySymbol,
        })
      );
      return false;
    }
    return true;
  };
  const _checkAmountByCurrencyTraits = (value, fee) => {
    if (value == null) {
      return true;
    }
    if (currencyTraits.granularity) {
      if (currencyTraits.tokenVersion == 777) {
        let g = _strToBigNumber(currencyTraits.granularity);
        if (g != null) {
          if (value.mod(g) != 0) {
            setAmountError(
              I18n.t('amount_check_template_multiples', {
                v: currencyTraits.granularity,
              })
            );
            return false;
          }
        }
      }
    }
    let walletCurrency = currencyTraits.walletCurrency;
    if (currencyTraits.existentialDeposit) {
      let pass = _checkAmountMinBalance(
        value,
        fee,
        currencyTraits.existentialDeposit
      );
      return pass;
    }
    if (currencyTraits.minimumAccountBalance) {
      let pass = _checkAmountMinBalance(
        value,
        fee,
        currencyTraits.minimumAccountBalance
      );
      return pass;
    }
    return true;
  };
  const _checkAmountNumerical = async (value, selectedFee) => {
    if (wallet.tokenVersion == 721) {
      return true;
    }
    if (wallet.tokenVersion == 1155) {
      return true;
    }
    if (isNaN(value)) {
      setAmountError(I18n.t('error_input_nan', { label: I18n.t('amount') }));
      return false;
    }
    let balance = getAvailableBalance(balanceItem);
    const feeStr = _hasTransactionFee() ? fee.data[selectedFee].amount : '0';
    let toAddress = _trimReceiver(receiver);
    let { chain, platformFee } = await _getEstimateResult(
      value.toString(),
      toAddress
    );
    let v = new BigNumber(value);
    if (balance) {
      let balanceNum = Number(balance);
      let b = new BigNumber(balanceNum);
      if (b.isZero() || v.isGreaterThan(b)) {
        setAmountError(I18n.t('error_fund_insufficient'));
        return false;
      } else if (balanceTextForFee != null) {
        let balanceNumForFee = Number(balanceTextForFee);
        let bForFee = new BigNumber(balanceNumForFee);
        if (bForFee.isZero() || chain.isGreaterThan(bForFee)) {
          setAmountError(
            I18n.t('error_insufficient_to_cover_transaction_fee_template', {
              name: feeUnit,
              balance: balanceTextForFee,
            })
          );
          return false;
        }
      } else if (
        v
          .plus(chain)
          .plus(platformFee)
          .isGreaterThan(b)
      ) {
        setAmountError(
          I18n.t('error_fund_insufficient_to_cover_transaction_fee')
        );
        return false;
      }
    }
    let r = _checkAmountByCurrencyTraits(v, chain.plus(platformFee));
    if (r) {
      setAmountError(null);
      return true;
    }
    return false;
  };
  const _checkAmount = (value, selectedFee) => {
    if (wallet.tokenVersion == 721) {
      return true;
    }
    if (!_checkAmountLiteral(value)) {
      return false;
    }
    if (wallet.tokenVersion == 1155) {
      let intValue = parseInt(value);
      let intB = parseInt(tokenIds[selectedTokenIndex].amount);
      if (intValue > intB) {
        setAmountError(I18n.t('error_fund_insufficient'));
        return false;
      }
      setAmountError(null);
      return true;
    }
    let floatValue = parseFloat(value);
    return _checkAmountNumerical(floatValue, selectedFee);
  };
  const _checkTokenId = () => {
    if (!wallet.isNft) {
      return true;
    }
    if (tokenIds.length > 0) {
      setTokenIdError(null);
      return true;
    }
    setTokenIdError(I18n.t('error_no_nft'));
    return false;
  };
  const _getEstimateResult = async (aStr, toAddress) => {
    const transactionFee = _hasTransactionFee() ? fee.data[selectedFee] : '0';
    let feeStr = transactionFee ? transactionFee.amount : '0';
    try {
      let r = _trimReceiver(receiver);
      let key = getEstimateResultKey(
        wallet.currency,
        wallet.tokenAddress,
        aStr,
        feeStr,
        wallet.walletId,
        toAddress
      );
      let er = estimateResultMap[key];
      if (er != null) {
        let text = _getDeductedAmountText(
          wallet.currencySymbol,
          er.chain,
          er.platformFee
        );
        setDeductedAmountText(text);
        return er;
      }
      setLoading(true);
      let {
        tranasctionAmout,
        platformFee,
        blockchainFee,
      } = await Wallets.estimateTransaction(
        wallet.currency,
        wallet.tokenAddress,
        amount,
        feeStr,
        wallet.walletId,
        toAddress
      );
      er = {
        chain: strToBigNumber(blockchainFee),
        platformFee: strToBigNumber(platformFee),
      };
      estimateResultMap[key] = er;
      setEstimateResultMap(estimateResultMap);
      setLoading(false);

      let text = _getDeductedAmountText(
        wallet.currencySymbol,
        er.chain,
        er.platformFee
      );
      console.log(
        `DeductedAmountText-:${text}, ${platformFee}, ${blockchainFee}, ${tranasctionAmout}`
      );
      setDeductedAmountText(text);
      return er;
    } catch (error) {
      setLoading(false);
      let er = {
        chain: getEstimateFee(wallet.currency, wallet.tokenAddress, fee),
        platformFee: BigNumber(0),
      };

      let text = _getDeductedAmountText(
        wallet.currencySymbol,
        er.chain,
        er.platformFee
      );
      setDeductedAmountText(text);
      return er;
    }
  };
  const _estimateTransactionSub = toAddress => {
    const transactionFee = _hasTransactionFee() ? fee.data[selectedFee] : '0';
    let feeStr = transactionFee ? transactionFee.amount : '0';
    let amountStr = amount || '0';
    console.log(
      `_estimateTransactionSub+:${amountStr}, ${toAddress}, ${feeStr}`
    );
    Wallets.estimateTransaction(
      wallet.currency,
      wallet.tokenAddress,
      amountStr,
      feeStr,
      wallet.walletId,
      toAddress
    )
      .then(result => {
        setLoading(false);
        let { tranasctionAmout, platformFee, blockchainFee } = result;
        console.log(
          `_estimateTransactionSub-:${tranasctionAmout}, ${platformFee}, ${blockchainFee}`
        );
        let estimate = {};
        if (platformFee && platformFee != '0') {
          estimate.platformFee = platformFee;
        }
        if (tranasctionAmout && tranasctionAmout !== '0') {
          if (wallet.tokenVersion == 721) {
            estimate.tokenId = tranasctionAmout;
          } else if (wallet.tokenVersion == 1155) {
            estimate.tokenId = tokenIds[selectedTokenIndex].tokenId;
            estimate.amount = tranasctionAmout;
          } else {
            estimate.amount = tranasctionAmout;
          }
        }
        let unit = '';
        let exchangeBlockchainFee = '';
        //for ERC20
        if (hasValue(wallet.tokenAddress)) {
          unit = ` ${feeUnit}`;
          exchangeBlockchainFee = `≈ ${exchangeCurrency} \$${getExchangeAmount(
            blockchainFee,
            3,
            { currency: wallet.currency, tokenAddress: '' },
            exchangeCurrency,
            currencyPrice
          )}`;
        } else {
          unit = wallet.isNft ? '' : ` ${wallet.currencySymbol}`;
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

        let floatValue = parseFloat(amountStr);
        setEstimateResult(estimate);
        return _checkAmountNumerical(floatValue, selectedFee);
      })
      .then(pass => {
        if (!pass) {
          return;
        }
        console.log('!!!Wallets.estimateTransaction pass', pass);

        setResult({
          type: TYPE_CONFIRM,
          title: I18n.t('confirm_send_currency', wallet),
          transactionFee: transactionFee,
          selectedFee: selectedFee,
        });
      })
      .catch(error => {
        setEstimateResult(null);
        console.log('Wallets.estimateTransaction failed', error.message);
        setResult({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t('transaction_failed'),
        });

        setLoading(false);
      });
  };
  const _estimateTransaction = toAddress => {
    setLoading(true);
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
      ]);
      setAddressTags([
        'SanctionsRisk',
        'ciphertrace',
        '1234567890asdfghjkl',
        'aaa',
        'vvv',
      ]);
      _estimateTransactionSub(toAddress);
    } else {
      //0x415a47e3333052bd79c63776720452a3db84c633
      Wallets.getAddressesTags(wallet.currency, [receiver])
        .then(result => {
          let { addressTagMap } = result;
          let { tagObjArr, tagArr } = getAddressTagObjFromResult(
            addressTagMap,
            true
          );
          if (tagArr.length > 0) {
            setAddressTags(tagArr);
          }
          if (tagObjArr.length > 0) {
            setAddressTagsObj(tagObjArr);
          }
          _estimateTransactionSub(toAddress);
        })
        .catch(error => {
          toastError(error);
          _estimateTransactionSub(toAddress);
        });
    }
  };
  const _warningCallback = () => {};
  const _createTransaction = async (pinSecret, type, actionToken, code) => {
    const transactionFee = _hasTransactionFee() ? fee.data[selectedFee] : null;
    let extras = {};
    if (hasMemo(wallet)) {
      extras = {
        ...extras,
        memo,
      };
    }
    // if (toAddressTags != null) {
    if (addressTags != null) {
      extras.to_address_tag = addressTags;
    }
    if (wallet.tokenVersion == 1155) {
      extras.token_id = tokenIds[selectedTokenIndex].tokenId;
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
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
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
    let value =
      wallet.tokenVersion == 1155
        ? tokenIds[selectedTokenIndex].amount
        : getAvailableBalance(balanceItem);
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
    _syncTokenIdToAmount(0);
    return () => {
      dispatch(stopFetchFee());
    };
  }, [wallet]);
  useEffect(() => {
    let c = currencies.filter(
      currency =>
        wallet.currency == currency.currency &&
        wallet.tokenAddress == currency.tokenAddress
    );
    if (c.length > 0) {
      fetchCurrencyTraits(
        c[0].currency,
        c[0].tokenAddress,
        c[0].tokenVersion,
        wallet.address
      );
    } else {
      fetchCurrencyTraits(
        wallet.currency,
        wallet.tokenAddress,
        0,
        wallet.address
      );
    }
  }, [wallet, currencies]);
  const fetchCurrencyTraits = (
    currency = -1,
    tokenAddress = '',
    tokenVersion = 0,
    walletAddress = ''
  ) => {
    if (false) {
      setCurrencyTraits({
        granularity: '0.03',
        existentialDeposit: '0.1',
        minimumAccountBalance: '0.2',
        tokenVersion: 0,
      });
      return;
    }
    // currency = Coin.WND;
    // walletAddress = 'GA6H55GY5BLBCZNKJTHZPJCWO4ETLCWZQ7KH3TUBKEJQG5OPFQ5NFQ64';
    Wallets.getCurrencyTraits(
      currency,
      tokenAddress,
      tokenVersion,
      walletAddress
    )
      .then(result => {
        if (result != null) {
          result.tokenVersion = tokenVersion;
          result.walletCurrency = currency;
          setCurrencyTraits(result);
        }
      })
      .catch(error => {
        console.log(error);
        // toastError(error);
      });
  };
  useEffect(() => {
    _checkTokenId();
    _syncTokenIdToAmount(selectedTokenIndex);
  }, [selectedTokenIndex]);
  const _syncTokenIdToAmount = index => {
    if (wallet.tokenVersion == 721) {
      if (tokenIds.length > 0) {
        setAmount(tokenIds[index]);
      }
    }
  };
  const _getDeductedAmountText = (currencySymbol, chain, platformFee) => {
    let value = Number(amount);
    if (isNaN(amount)) {
      value = 0;
    }
    let v = new BigNumber(value);
    if (!hasValue(wallet.tokenAddress)) {
      let r = v.plus(chain).plus(platformFee);
      return `${r.toFixed()} ${currencySymbol}`;
    } else {
      if (wallet.isNft) {
        let r = chain.plus(platformFee);
        return `${r.toFixed()} ${feeUnit}${feeNote}`;
      }
      let r = v.plus(platformFee);
      return `${r.toFixed()} ${currencySymbol}, ${chain.toFixed()} ${feeUnit}${feeNote}`;
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
            if (detail.isNft && estimateResult.amount) {
              detail.other = `\n${I18n.t('amount')}: ${estimateResult.amount}`;
            }
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
            message: detail.isNft
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
  const _getTokenIds = () => {
    if (balanceItem == null) {
      return [];
    }
    if (!wallet.isNft) {
      return [];
    }
    if (wallet.tokenVersion == 721) {
      return balanceItem.tokens || [];
    } else if (wallet.tokenVersion == 1155) {
      return balanceItem.tokenIdAmounts || [];
    }
    return [];
  };
  const tokenIds = _getTokenIds();
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
                isNftTop={wallet.isNft}
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
                { marginTop: 5, maxWidth: '80%' },
              ]}
              balanceItem={balanceItem}
              isErc1155={wallet.tokenVersion == 1155}
              tokenIdIndex={selectedTokenIndex}
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
              if (wallet.isNft) {
                refs[0].current.blur();
              } else {
                focusNext(refs, 0);
              }
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
            onRightIconClick={_goScan}
            placeholder={I18n.t('to_address_placeholder')}
            onClear={() => {
              setReceiver('');
            }}
          />
          <Text style={Styles.labelBlock}>
            {wallet.isNft ? I18n.t('token_id') : I18n.t('transfer_amount')}
          </Text>
          {wallet.isNft && (
            <>
              <BottomActionMenu
                visible={showMenu1}
                currentSelect={selectedTokenIndex}
                title={I18n.t('token_id')}
                scrollEnabled={true}
                prefix={'#'}
                data={tokenIds}
                getValue={
                  wallet.tokenVersion == 1155
                    ? tokenIdAmount => tokenIdAmount.tokenId
                    : null
                }
                onClick={() => {
                  setShowMenu1(true);
                }}
                onCancel={() => {
                  setShowMenu1(false);
                }}
                onChange={index => {
                  setSelectedTokenIndex(index);
                  _syncTokenIdToAmount(index);
                  setShowMenu1(false);
                }}
                containerStyle={{
                  flex: null,
                  marginTop: 10,
                  paddingHorizontal: 10,
                  minHeight: 40,
                  borderRadius: 4,
                  justifyContent: 'space-between',
                }}
              />
              <Text style={[Styles.inputError, { marginHorizontal: 16 }]}>
                {tokenIdError}
              </Text>
            </>
          )}
          {wallet.tokenVersion != 721 && (
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
                wallet.isNft
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
              onPressAvailableBalance={async () => {
                if (wallet.tokenVersion == 1155) {
                  setAmount(tokenIds[selectedTokenIndex].amount);
                  return;
                }
                let valueText = getAvailableBalance(balanceItem);
                let value = Number(valueText);
                const feeStr = _hasTransactionFee()
                  ? fee.data[selectedFee].amount
                  : '0';
                if (isNaN(value)) {
                  setAmount(valueText);
                  return;
                }
                setAmount(valueText);
                let toAddress = _trimReceiver(receiver);
                let { chain, platformFee } = await _getEstimateResult(
                  valueText,
                  toAddress
                );
                let v = BigNumber(value);
                let r =
                  balanceTextForFee == null
                    ? v.minus(chain).minus(platformFee)
                    : v;
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
              <FeeDegreeSelector
                getValue={(item = {}) => `${item.amount} ${feeUnit}`}
                valueObj={fee.data}
                reserveErrorMsg={false}
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
        )} ${deductedAmountText}`}</Text>

        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          disabled={receiverError || amountError || tokenIdError}
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
            addressTagsObj: addressTagsObj,
            amount: (estimateResult && estimateResult.amount) || amount,
            tokenId: estimateResult && estimateResult.tokenId,
            currency: wallet.currencySymbol,
            isNft: wallet.isNft,
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
            exchangeAmount: wallet.isNft
              ? null
              : getExchangeAmount(
                  (estimateResult && estimateResult.amount) || amount,
                  3,
                  wallet,
                  exchangeCurrency,
                  currencyPrice
                ),
          }}
          onButtonClick={async () => {
            if (result.type === TYPE_CONFIRM) {
              setResult(null);
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
              NavigationService.navigate('Warning', {
                modal: true,
                from: 'Withdraw',
                isSms: isSms,
                callback: () => {
                  NavigationService.navigate('InputPinSms', {
                    modal: true,
                    from: 'Withdraw',
                    isSms: isSms,
                    callback: (pinSecret, type, actionToken, code) => {
                      _createTransaction(pinSecret, type, actionToken, code);
                    },
                  });
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
            amount: wallet.isNft
              ? amount
              : (estimateResult && estimateResult.amount) || amount,
            currency: wallet.currencySymbol,
            isNft: wallet.isNft,
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
    opacity: 0.8,
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
