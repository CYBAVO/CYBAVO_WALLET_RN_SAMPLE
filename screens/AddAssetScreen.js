import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Container } from 'native-base';
import { Coin, ROUND_BUTTON_HEIGHT } from '../Constants';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { withTheme, Text } from 'react-native-paper';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import { Theme } from '../styles/MainTheme';
import {
  fetchWallets,
  fetchCurrenciesIfNeed,
  fetchCurrencyPricesIfNeed,
} from '../store/actions';
import InputPinCodeModal from './InputPinCodeModal';
import CurrencyPicker from '../components/CurrencyPicker';
import {
  focusInput,
  focusNext,
  getRestCurrencies,
  hasValue,
  isValidEosAccount,
  sleep,
  toastError,
} from '../Helpers';
import { Wallets } from '@cybavo/react-native-wallet-service';
import Headerbar from '../components/Headerbar';
import RoundButton2 from '../components/RoundButton2';
import CompoundTextInput from '../components/CompoundTextInput';
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { useLayout } from '@react-native-community/hooks';
const AddAssetScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const refs = [useRef(), useRef()];
  const { onLayout, ...layout } = useLayout();
  const [iosImeHeight, setiosImeHeight] = useState(0);

  const _updateKeyboardSpace = (frames: Object) => {
    console.log('_updateKeyboardSpace: ', frames.endCoordinates.height);
    setiosImeHeight(frames.endCoordinates.height - layout.height);
  };

  const _resetKeyboardSpace = (frames: Object) => {
    setiosImeHeight(0);
    console.log('_resetKeyboardSpace');
  };

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }
    Keyboard.addListener('keyboardWillShow', _updateKeyboardSpace);
    Keyboard.addListener('keyboardWillHide', _resetKeyboardSpace);
    return () => {
      Keyboard.removeListener('keyboardWillShow', _updateKeyboardSpace);
      Keyboard.removeListener('keyboardWillHide', _resetKeyboardSpace);
    };
  }, []);

  const walletLimit = useSelector(state => {
    return state.wallets.walletLimit;
  });
  const paramCurrency = useNavigationParam('currency');
  const _getAvailableCurrencies = (currencies, wallets) => {
    if (paramCurrency) {
      return [paramCurrency];
    }
    return getRestCurrencies(currencies, wallets, walletLimit);
  };

  const currencies = useSelector(state => {
    return _getAvailableCurrencies(
      state.currency.currencies,
      state.wallets.wallets
    );
  });
  const _hasAccountName = currency =>
    Coin.EOS === currency.currency && !currency.tokenAddress;
  const wallets = useSelector(state => state.wallets.wallets);
  const scrollView = useRef();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [inputPinCode, setInputPinCode] = useState(false);
  const [accountNameError, setAccountNameError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [result, setResult] = useState(null);
  const [currency, setCurrency] = useState(
    currencies.length > 0 ? currencies[0] : {}
  );
  const [parent, setParent] = useState({});
  const _getParentName = (wallets, currency) => {
    let count = 0;
    for (let w of wallets) {
      if (w.currency === currency.currency && !w.tokenAddress) {
        count++;
      }
    }
    if (count > 0) {
      return `My ${currency.symbol}${count + 1}`;
    } else {
      return `My ${currency.symbol}`;
    }
  };
  const _getAvailableParents = (wallets, currency) => {
    if (!wallets || !currency) {
      return [];
    }
    if (!currency.tokenAddress) {
      return [];
    }
    let map = {}; //string: object|false
    for (let w of wallets) {
      if (w.currency !== currency.currency) {
        continue;
      }
      if (!w.tokenAddress) {
        if (map[w.address] != false) {
          map[w.address] = w;
        }
      } else if (w.tokenAddress == currency.tokenAddress) {
        map[w.address] = false;
      }
    }
    const r = Object.values(map).filter(v => v != false);
    return r;
  };
  const [parents, setParents] = useState(
    _getAvailableParents(wallets, currency)
  );
  const [initShowModal, setInitShowModal] = useState(currencies.length > 1);
  useEffect(() => {
    if (!initShowModal) {
      focusInput(refs, 0);
    }
  }, [initShowModal]);
  useEffect(() => {
    if (parents.length > 0) {
      setParent(parents[0]);
    } else {
      setParent({});
    }
  }, [parents]);
  const _getParentCurrency = currency => {
    const r = currencies.find(
      c => c.currency === currency.currency && !c.tokenAddress
    );
    return r || { symbol: '', currency: currency.currency, tokenAddress: '' };
  };
  const _needParent = () => hasParent && parents.length == 0;
  const _createWallet = async pinSecret => {
    setLoading(true);
    try {
      let parentId = parent.walletId || 0;
      if (_needParent()) {
        let parentCurrency = _getParentCurrency(currency);
        let name = _getParentName(wallets, parentCurrency);
        let result = await Wallets.createWallet(
          parentCurrency.currency, // currency
          parentCurrency.tokenAddress, // tokenAddress
          0, // parentWalletId
          name, // name
          { pinSecret, retain: true }, // pinSecret
          {
            account_name: undefined,
            // EOS specified extras
          } // extraAttributes
        );
        parentId = result.walletId;
        await sleep(3000);
      }
      await Wallets.createWallet(
        currency.currency, // currency
        currency.tokenAddress, // tokenAddress
        parentId, // parentWalletId
        name, // name
        pinSecret, // pinSecret
        {
          account_name:
            currency.currency === Coin.EOS ? accountName : undefined,
          // EOS specified extras
        } // extraAttributes
      );
      await dispatch(fetchWallets(currency));
      await dispatch(fetchCurrencyPricesIfNeed(true));
      setResult({
        type: TYPE_SUCCESS,
        title: I18n.t('add_successfully'),
        message: I18n.t('add_asset_success_desc'),
        buttonClick: () => {
          setResult(null);
          goBack();
        },
      });
    } catch (error) {
      console.log('_createWallet failed', error);
      setResult({
        type: TYPE_FAIL,
        error: I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        }),
        title: I18n.t('add_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setInputPinCode(false);
    setLoading(false);
  };
  const _submit = () => {
    let accountNameCheck = _checkAccountName(accountName, true);
    let nameCheck = _checkName(name);
    if (!accountNameCheck || !nameCheck) {
      return;
    }
    setInputPinCode(true);
  };
  const hasParent = !!currency.tokenAddress;
  useEffect(() => {
    dispatch(fetchWallets());
    dispatch(fetchCurrenciesIfNeed());
  }, [dispatch]);

  const _checkAccountName = async (value, furtherCheck = false) => {
    if (!_hasAccountName(currency)) {
      return true;
    }
    if (!hasValue(value)) {
      setAccountNameError(
        I18n.t('error_input_empty', { label: I18n.t('account_name') })
      );
      return false;
    }
    if (isValidEosAccount(value)) {
      if (furtherCheck) {
        try {
          setLoading(true);
          const result = await Wallets.validateEosAccount(accountName);
          setLoading(false);
          if (!result.valid) {
            setAccountNameError(I18n.t('invalid_eos_account'));
            return false;
          }
          if (result.exist) {
            setAccountNameError(I18n.t('invalid_eos_account_exist'));
            return false;
          }
        } catch (error) {
          console.log('validateEosAccount failed', error);
          toastError(error);
        }
      }
      setAccountNameError(null);
      return true;
    }
    setAccountNameError(I18n.t('error_eos_receiver'));
    return false;
  };
  const _onAccountNameChanged = value => {
    setAccountName(value);
    if (accountNameError) {
      _checkAccountName(value);
    }
  };
  const _checkName = value => {
    if (!hasValue(value)) {
      setNameError(
        I18n.t('error_input_empty', { label: I18n.t('wallet_name') })
      );
      return false;
    }
    setNameError(null);
    return true;
  };
  const _onNameChanged = value => {
    setName(value);
    if (nameError) {
      _checkName(value);
    }
  };
  return (
    <>
      <Container style={Styles.bottomContainer}>
        <Headerbar
          transparent
          title={I18n.t('add_asset')}
          onBack={() => goBack()}
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          ref={scrollView}
          style={styles.contentContainer}
          contentContainerStyle={{ justifyContent: 'space-between' }}>
          <Text
            style={[
              Styles.secLabel,
              styles.labelItem,
              Theme.fonts.default.regular,
            ]}>
            {I18n.t('currency')}
          </Text>
          <CurrencyPicker
            rawData={currencies}
            initShowModal={initShowModal}
            onBack={() => {
              if (initShowModal) {
                // enter this screen and press cancel, go back
                goBack();
                return;
              }
              if (!hasValue(name)) {
                focusInput(refs, 0);
              }
            }}
            clickItem={item => {
              //has selected currency, mark so that don't go back when cancel picker
              setInitShowModal(false);
              setCurrency(item);
              setParents(_getAvailableParents(wallets, item));
              focusInput(refs, 0);
            }}
          />
          {parents.length > 1 && (
            <Text
              style={[
                Styles.secLabel,
                styles.labelItem,
                Theme.fonts.default.regular,
              ]}>
              {I18n.t('parent_wallet')}
            </Text>
          )}
          {parents.length > 1 && (
            <CurrencyPicker
              rawData={parents}
              clickItem={item => setParent(item)}
              getKey={item => item.walletId}
              getMainText={item => item.currencySymbol}
              getSubText={item => item.name}
              getXmlKey={item => {
                return item.currencySymbol;
              }}
              title={I18n.t('select_parent_wallet')}
            />
          )}
          <CompoundTextInput
            ref={refs[0]}
            onLayout={onLayout}
            onSubmitEditing={
              refs[1].current
                ? () => {
                    focusNext(refs, 0);
                  }
                : null
            }
            label={I18n.t('name_this_wallet')}
            style={{ backgroundColor: 'transparent', marginTop: 0 }}
            value={name}
            onClear={() => {
              setName('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            underlineColor={Theme.colors.normalUnderline}
            hasError={hasValue(nameError)}
            onChangeText={_onNameChanged}
            errorMsg={nameError}
          />
          {_hasAccountName(currency) && (
            <CompoundTextInput
              ref={refs[1]}
              label={I18n.t('account_name')}
              style={{ backgroundColor: 'transparent', marginTop: 15 }}
              value={accountName}
              onClear={() => {
                setAccountName('');
              }}
              maxLength={12}
              autoCapitalize="none"
              keyboardType="email-address"
              underlineColor={Theme.colors.normalUnderline}
              hasError={hasValue(accountNameError)}
              onChangeText={_onAccountNameChanged}
              onBlur={() => _checkAccountName(accountName)}
              errorMsg={accountNameError}
            />
          )}
          <View style={{ height: iosImeHeight }} />
        </ScrollView>
        <View style={{ marginTop: 50 }}>
          {_needParent() && (
            <View
              style={[
                Styles.infoBackground,
                { marginHorizontal: 16, marginTop: 0, marginBottom: 4 },
              ]}>
              <Image
                style={{ marginTop: 3 }}
                source={require('../assets/image/ic_Info.png')}
              />
              <Text
                style={[
                  Theme.fonts.default.regular,
                  {
                    textAlign: 'left',
                    marginLeft: 5,
                  },
                ]}>
                {I18n.t(
                  'also_create_parent_wallet',
                  _getParentCurrency(currency)
                )}
              </Text>
            </View>
          )}
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={[Styles.bottomButton]}
            labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
            onPress={_submit}
            disabled={loading}>
            {I18n.t('submit_confirm')}
          </RoundButton2>
        </View>
      </Container>
      <InputPinCodeModal
        title={I18n.t('add_asset')}
        isVisible={!!inputPinCode}
        onCancel={() => setInputPinCode(false)}
        loading={loading}
        onInputPinCode={_createWallet}
      />
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
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
    paddingBottom: 0, // need to make a distance from bottom, to fix abnormal move while focus next TextInput on iOS
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 8,
  },
  labelItem: {
    marginTop: 15,
    marginBottom: 10,
  },
});
export default withTheme(AddAssetScreen);
