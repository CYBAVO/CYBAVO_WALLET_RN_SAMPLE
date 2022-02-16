import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as Progress from 'react-native-progress';
import { BigNumber } from 'bignumber.js';
import {
  StyleSheet,
  View,
  Dimensions,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Container } from 'native-base';
const { width, height } = Dimensions.get('window');
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { Theme } from '../styles/MainTheme';
import {
  FULL_WIDTH_WITH_PADDING,
  HEADER_BAR_PADDING,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import { Wallets } from '@cybavo/react-native-wallet-service';
import InputPinCodeModal from './InputPinCodeModal';
import {
  checkCameraPermission,
  hasValue,
  isValidEosAccount,
  toastError,
} from '../Helpers';
import Headerbar from '../components/Headerbar';
import { withTheme, Text } from 'react-native-paper';
import { fetchBalance } from '../store/actions';
import SingleSelect from '../components/SingleSelect';
import CompoundTextInput from '../components/CompoundTextInput';
import RoundButton2 from '../components/RoundButton2';

const EosResourceScreen: () => React$Node = ({ theme }) => {
  const wallet = useNavigationParam('wallet');
  const onComplete = useNavigationParam('onComplete');
  const { navigate, goBack } = useNavigation();
  const dispatch = useDispatch();
  if (!wallet) {
    console.warn('No wallet/transaction specified');
    goBack();
  }
  const qrCode = useNavigationParam('qrCode');
  const [loading, setLoading] = useState(false);
  const [inputPinCode, setInputPinCode] = useState(null);
  const [iosImeHeight, setiosImeHeight] = useState(0);
  const [ramPrice, setRamPrice] = useState(0);
  const [cpuAmount, setCpuAmount] = useState(0);
  const [cpuAmountPrecision, setCpuAmountPrecision] = useState();
  const [cpuAvailable, setCpuAvailable] = useState(0);
  const [cpuMax, setCpuMax] = useState(0);
  const [cpuRefund, setCpuRefund] = useState(0);
  const [cpuRefundPrecision, setCpuRefundPrecision] = useState(0);
  const [cpuUsed, setCpuUsed] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [netAmountPrecision, setNetAmountPrecision] = useState(0);
  const [netAvailable, setNetAvailable] = useState(0);
  const [netMax, setNetMax] = useState(0);
  const [netRefund, setNetRefund] = useState(0);
  const [netRefundPrecision, setNetRefundPrecision] = useState(0);
  const [netUsed, setNetUsed] = useState(0);
  const [ramQuota, setRamQuota] = useState(0);
  const [ramUsage, setRamUsage] = useState(0);
  const [selected, setSelected] = useState(0);
  //text input
  const [amount, setAmount] = useState(0);
  const [numBytes, setNumBytes] = useState(0);
  const [receiver, setReceiver] = useState(qrCode || wallet.address);
  //text input error
  const [amountError, setAmountError] = useState(null);
  const [numBytesError, setNumBytesError] = useState(null);
  const [receiverError, setReceiverError] = useState(null);
  // const [exchangeAmount, setExchangeAmount] = useState(0);
  const _fetchResourceInfo = async () => {
    setLoading(true);
    try {
      const { ramPrice } = await Wallets.getEosRamPrice();
      const {
        cpuAmount,
        cpuAmountPrecision,
        cpuAvailable,
        cpuMax,
        cpuRefund,
        cpuRefundPrecision,
        cpuUsed,
        netAmount,
        netAmountPrecision,
        netAvailable,
        netMax,
        netRefund,
        netRefundPrecision,
        netUsed,
        ramQuota,
        ramUsage,
      } = await Wallets.getEosResourceState(wallet.address);
      setRamPrice(ramPrice);
      setCpuAmount(cpuAmount);
      setCpuAmountPrecision(cpuAmountPrecision);
      setCpuAvailable(cpuAvailable);
      setCpuMax(cpuMax);
      setCpuRefund(cpuRefund);
      setCpuRefundPrecision(cpuRefundPrecision);
      setCpuUsed(cpuUsed);
      setNetAmount(netAmount);
      setNetAmountPrecision(netAmountPrecision);
      setNetAvailable(netAvailable);
      setNetMax(netMax);
      setNetRefund(netRefund);
      setNetRefundPrecision(netRefundPrecision);
      setNetUsed(netUsed);
      setRamQuota(ramQuota);
      setRamUsage(ramUsage);
    } catch (error) {
      console.log('_fetchWithdrawInfo failed', error);
      // setFee({});
      // setUsage({});
    }
    setLoading(false);
  };
  const _checkReceiver = value => {
    if (!hasValue(value)) {
      setReceiverError(
        I18n.t('error_input_empty', { label: I18n.t('receiver') })
      );
      return;
    }
    if (isValidEosAccount(value)) {
      setReceiverError(null);
      return;
    }
    setReceiverError(I18n.t('error_eos_receiver'));
  };
  const _onReceiverChanged = value => {
    setReceiver(value);
    if (receiverError) {
      _checkReceiver(value);
    }
  };
  const _onAmountChanged = value => {
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
      _checkAmountNumerical(floatValue);
    }
  };

  const _checkAmount = value => {
    if (!_checkAmountLiteral(value)) {
      return;
    }
    let floatValue = parseFloat(value);
    _checkAmountNumerical(floatValue);
  };

  const _checkAmountLiteral = value => {
    if (!hasValue(value)) {
      setAmountError(I18n.t('error_input_empty', { label: I18n.t('amount') }));
      return false;
    }
    setAmountError(null);
    return true;
  };
  const _checkAmountNumerical = value => {
    if (isNaN(value)) {
      setAmountError(I18n.t('error_input_nan', { label: I18n.t('amount') }));
      return;
    }
    //TODO
    setAmountError(null);
  };

  const _isValid = () => {
    switch (TRANSACTIONS[selected].type) {
      case Wallets.EosResourceTransactionType.BUY_RAM:
        return numBytes >= 1024 && !!receiver;
      case Wallets.EosResourceTransactionType.SELL_RAM:
        return numBytes >= 1024;
      case Wallets.EosResourceTransactionType.DELEGATE_CPU:
      case Wallets.EosResourceTransactionType.DELEGATE_NET:
        return Number(amount) > 0 && !!receiver;
      case Wallets.EosResourceTransactionType.UNDELEGATE_CPU:
      case Wallets.EosResourceTransactionType.UNDELEGATE_NET:
        return Number(amount) > 0;
      default:
        return false;
    }
  };
  const _setInputPinCode = () => {
    setInputPinCode(true);
  };
  const _finishInputPinCode = () => {
    setInputPinCode(false);
  };
  const _onNumBytesChanged = numBytes => {
    let numBytesNum = new BigNumber(0);
    try {
      numBytesNum = new BigNumber(numBytes);
    } catch (error) {
      if (hasValue(numBytesError)) {
        setNumBytesError(
          I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          })
        );
      }
      return;
    }
    if (numBytesNum.isNaN()) {
      setNumBytes(numBytes);
      return;
    }
    setNumBytes(numBytesNum);
    setAmount(
      numBytesNum
        .div(1024)
        .multipliedBy(ramPrice)
        .toString()
    );
    if (hasValue(numBytesError)) {
      _checkNumBytesNumerical(numBytesNum);
    }
  };

  const _checkNumBytesLiteral = value => {
    if (!hasValue(value)) {
      setNumBytesError(
        I18n.t('error_input_empty', { label: I18n.t('number_of_bytes') })
      );
      return false;
    }
    setNumBytesError(null);
    return true;
  };
  const _checkNumBytesNumerical = value => {
    if (!value.isNaN || value.isNaN()) {
      setNumBytesError(
        I18n.t('error_input_nan', { label: I18n.t('number_of_bytes') })
      );
      return false;
    }
    //TODO
    if (value < 1024) {
      setNumBytesError(
        I18n.t('error_input_cannot_less', {
          label: I18n.t('number_of_bytes'),
          value: '1024',
        })
      );
      return false;
    }
    setNumBytesError(null);
    return true;
  };
  // const _checkNumBytes = value => {
  //   if (!_checkNumBytesLiteral(value)) {
  //     return;
  //   }
  //   _checkNumBytesNumerical(new BigNumber(value));
  // };
  const _setSelected = idx => {
    setSelected(idx);
    setAmount('0');
    setNumBytes(0);
    setReceiver(wallet.address);
    setAmountError(null);
    setNumBytesError(null);
  };
  const _setReceiver = receiver => {
    setReceiver(receiver);
    _checkReceiver(receiver);
  };
  const calcProgress = (used, max) => {
    return max > 0 ? used / max : 0;
  };
  const _goScan = async () => {
    if (await checkCameraPermission()) {
      navigate('Scan2', { onResult: _setReceiver });
    }
  };
  const calcWithPrec = (amount, precision) => {
    const div = new BigNumber(10).pow(precision);
    const big = new BigNumber(amount);
    let result = big.div(div);
    return isNaN(result) ? '0' : result.toString();
  };
  const _createTransaction = async pinSecret => {
    setLoading(true);
    try {
      await Wallets.createTransaction(
        wallet.walletId,
        receiver,
        amount,
        '', // fee
        '', // description
        pinSecret,
        {
          // EOS resource specific extras
          eos_transaction_type: TRANSACTIONS[selected].type,
          num_bytes: Number(numBytes),
        }
      );
      await _fetchResourceInfo();
      dispatch(
        fetchBalance(wallet.currency, wallet.tokenAddress, wallet.address, true)
      );
      setAmount('0');
      setNumBytes(0);
      _finishInputPinCode();
      goBack();
    } catch (error) {
      console.log('Wallets.createTransaction failed', error);
      toastError(error);
      _finishInputPinCode();
    }
    if (onComplete) {
      onComplete();
    }
    setLoading(false);
  };
  const _updateKeyboardSpace = (frames: Object) => {
    setiosImeHeight(frames.endCoordinates.height);
  };

  const _resetKeyboardSpace = (frames: Object) => {
    setiosImeHeight(0);
  };
  const TRANSACTIONS = [
    {
      label: I18n.t('buy_ram'),
      type: Wallets.EosResourceTransactionType.BUY_RAM,
      showAmount: false,
      showNumBytes: true,
      showReceiver: true,
    },
    {
      label: I18n.t('sell_ram'),
      type: Wallets.EosResourceTransactionType.SELL_RAM,
      showAmount: false,
      showNumBytes: true,
      showReceiver: false,
    },
    {
      label: I18n.t('delegate_cpu'),
      type: Wallets.EosResourceTransactionType.DELEGATE_CPU,
      showAmount: true,
      showNumBytes: false,
      showReceiver: true,
    },
    {
      label: I18n.t('undelegate_cpu'),
      type: Wallets.EosResourceTransactionType.UNDELEGATE_CPU,
      showAmount: true,
      showNumBytes: false,
      showReceiver: false,
    },
    {
      label: I18n.t('delegate_net'),
      type: Wallets.EosResourceTransactionType.DELEGATE_NET,
      showAmount: true,
      showNumBytes: false,
      showReceiver: true,
    },
    {
      label: I18n.t('undelegate_net'),
      type: Wallets.EosResourceTransactionType.UNDELEGATE_NET,
      showAmount: true,
      showNumBytes: false,
      showReceiver: false,
    },
  ];
  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', _updateKeyboardSpace);
    Keyboard.addListener('keyboardWillHide', _resetKeyboardSpace);
    return () => {
      Keyboard.removeListener('keyboardWillShow', _updateKeyboardSpace);
      Keyboard.removeListener('keyboardWillHide', _resetKeyboardSpace);
    };
  }, []);
  useEffect(() => {
    _fetchResourceInfo();
  }, []);

  return (
    <Container style={Styles.bottomContainer}>
      <Headerbar
        transparent
        title={I18n.t('eos_resources')}
        onBack={() => goBack()}
      />
      {/*<View style={{ justifyContent: 'space-between', flex: 1 }}>*/}
      <ScrollView>
        <View style={styles.barBlock}>
          <Text style={[styles.barLabel, Theme.fonts.default.heavy]}>
            {I18n.t('ram')}
          </Text>
          <Progress.Bar
            indeterminate={loading}
            progress={calcProgress(ramUsage, ramQuota)}
            width={null}
            animated={false}
            borderWidth={0}
            unfilledColor={theme.colors.unfilled}
            color={theme.colors.primary}
            style={styles.bar}
            useNativeDriver={true}
          />
          <View style={styles.barDescBlock}>
            <Text style={styles.barDescPrimary}>
              {`${ramPrice} ${I18n.t('eos_kbytes')}`}
            </Text>
            <Text style={styles.barDescPrimary}>
              {`${ramUsage} / ${ramQuota} ${I18n.t('bytes')}`}
            </Text>
          </View>
        </View>

        <View style={styles.barBlock}>
          <Text style={[styles.barLabel, Theme.fonts.default.heavy]}>
            {I18n.t('cpu')}
          </Text>
          <Progress.Bar
            indeterminate={loading}
            progress={calcProgress(cpuUsed, cpuMax)}
            width={null}
            animated={false}
            borderWidth={0}
            unfilledColor={theme.colors.unfilled}
            color={theme.colors.primary}
            style={styles.bar}
            useNativeDriver={true}
          />
          <View style={styles.barDescBlock}>
            <Text style={styles.barDescPrimary}>
              {`${calcWithPrec(cpuAmount, cpuAmountPrecision)} ${I18n.t(
                'staked'
              )} • ${calcWithPrec(cpuRefund, cpuRefundPrecision)} ${I18n.t(
                'refunding'
              )}`}
            </Text>
            <Text style={styles.barDescPrimary}>
              {`${cpuUsed} / ${cpuMax} ${I18n.t('microseconds_symbol')}`}
            </Text>
          </View>
        </View>
        <View style={styles.barBlock}>
          <Text style={[styles.barLabel, Theme.fonts.default.heavy]}>
            {I18n.t('net')}
          </Text>
          <Progress.Bar
            indeterminate={loading}
            progress={calcProgress(cpuUsed, cpuMax)}
            width={null}
            animated={false}
            borderWidth={0}
            unfilledColor={theme.colors.unfilled}
            color={theme.colors.primary}
            style={styles.bar}
            useNativeDriver={true}
          />
          <View style={styles.barDescBlock}>
            <Text style={styles.barDescPrimary}>
              {`${calcWithPrec(netAmount, netAmountPrecision)} ${I18n.t(
                'staked'
              )} • ${calcWithPrec(netRefund, netRefundPrecision)} ${I18n.t(
                'refunding'
              )}`}
            </Text>
            <Text style={styles.barDescPrimary}>
              {`${netUsed} / ${netMax} ${I18n.t('bytes')}`}
            </Text>
          </View>
        </View>

        <Text style={Styles.labelBlock}>{I18n.t('transaction')}</Text>
        {/*<View>*/}
        <ScrollView
          horizontal={true}
          style={{ flexGrow: 0, marginHorizontal: HEADER_BAR_PADDING }}>
          <SingleSelect
            containerStyle={{
              marginVertical: 12,
            }}
            options={TRANSACTIONS}
            getOptionText={opt => opt.label}
            selected={selected}
            onChange={idx => {
              _setSelected(idx);
            }}
          />
        </ScrollView>
        {TRANSACTIONS[selected].showNumBytes && (
          <Text style={Styles.labelBlock}>{I18n.t('number_of_bytes')}</Text>
        )}
        {TRANSACTIONS[selected].showNumBytes && (
          <CompoundTextInput
            style={Styles.compoundInput}
            value={String(numBytes)}
            maxLength={21}
            autoCapitalize="none"
            keyboardType="number-pad"
            underlineColor={Theme.colors.normalUnderline}
            hasError={hasValue(numBytesError)}
            onChangeText={_onNumBytesChanged}
            onBlur={() => _checkNumBytesNumerical(numBytes)}
            errorMsg={numBytesError}
            convertText={amount == null ? null : `≈ ${amount} EOS`}
          />
        )}
        {TRANSACTIONS[selected].showAmount && (
          <Text style={Styles.labelBlock}>{I18n.t('amount')}</Text>
        )}
        {TRANSACTIONS[selected].showAmount && (
          <CompoundTextInput
            style={Styles.compoundInput}
            value={amount}
            maxLength={21}
            autoCapitalize="none"
            keyboardType="numeric"
            underlineColor={Theme.colors.normalUnderline}
            hasError={hasValue(amountError)}
            onChangeText={_onAmountChanged}
            onBlur={() => _checkAmount(amount)}
            errorMsg={amountError}
          />
        )}
        {TRANSACTIONS[selected].showReceiver && (
          <Text style={Styles.labelBlock}>{I18n.t('receiver')}</Text>
        )}
        {TRANSACTIONS[selected].showReceiver && (
          <CompoundTextInput
            style={Styles.compoundInput}
            value={receiver}
            maxLength={12}
            autoCapitalize="none"
            keyboardType="email-address"
            underlineColor={Theme.colors.normalUnderline}
            hasError={hasValue(receiverError)}
            onChangeText={_onReceiverChanged}
            onBlur={() => _checkReceiver(receiver)}
            errorMsg={receiverError}
            goScan={_goScan}
          />
        )}
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={Styles.bottomButton}
          labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
          onPress={_setInputPinCode}>
          {TRANSACTIONS[selected].label}
        </RoundButton2>
      </ScrollView>
      {/*</View>*/}
      <View style={{ height: iosImeHeight }} />
      <InputPinCodeModal
        title={I18n.t('eos_resources')}
        isVisible={!!inputPinCode}
        onCancel={() => {
          _finishInputPinCode();
        }}
        loading={loading}
        onInputPinCode={pinSecret => {
          _createTransaction(pinSecret);
        }}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  barBlock: {
    backgroundColor: Theme.colors.pickerBg,
    marginTop: 10,
    padding: HEADER_BAR_PADDING,
    width: FULL_WIDTH_WITH_PADDING,
    alignSelf: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    borderRadius: 6,
  },
  barLabel: {
    color: Theme.colors.text,
    fontSize: 14,
  },
  bar: {
    marginTop: 10,
  },
  barDescPrimary: {
    fontSize: 12,
    color: Theme.colors.text2,
  },
  barDescBlock: {
    marginTop: 10,
    // marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formItemHasValue: {
    borderColor: Theme.colors.primary,
    minHeight: 80,
  },
  balanceLabel: {
    color: Theme.colors.text,
    fontSize: 15,
    opacity: 0.4,
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 2,
  },
  balanceSubText: {
    color: Theme.colors.text,
    fontSize: 22,
    maxWidth: '60%',
    fontWeight: '500',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 15,
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
});
export default withTheme(EosResourceScreen);
