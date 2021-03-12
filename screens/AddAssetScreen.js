import React, { useState, useEffect, useRef } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
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
const AddAssetScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const refs = [useRef(), useRef()];

  const paramCurrency = useNavigationParam('currency');
  const _getAvailableCurrencies = (currencies, wallets) => {
    if (paramCurrency) {
      return [paramCurrency];
    }
    return getRestCurrencies(currencies, wallets);
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
  const _getAvailableParents = (wallets, currency) => {
    if (!wallets || !currency) {
      return [];
    }
    const r = wallets.filter(
      w => w.currency === currency.currency && !w.tokenAddress
    );
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
        let result = await Wallets.createWallet(
          parentCurrency.currency, // currency
          parentCurrency.tokenAddress, // tokenAddress
          0, // parentWalletId
          `My ${parentCurrency.symbol}`, // name
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
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
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
          <CompoundTextInput
            ref={refs[0]}
            onSubmitEditing={
              refs[1].current
                ? () => {
                    focusNext(refs, 0);
                  }
                : null
            }
            label={I18n.t('name_this_wallet')}
            style={{ backgroundColor: 'transparent', marginTop: 15 }}
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
