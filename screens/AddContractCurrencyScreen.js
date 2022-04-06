import React, { useState, useEffect, useRef } from 'react';
import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Container, Content } from 'native-base';
import {
  chainI18n,
  Coin,
  ROUND_BUTTON_HEIGHT,
  sliderInnerWidth,
  sliderOuterWidth,
} from '../Constants';
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
  fetchCurrencies,
} from '../store/actions';
import InputPinCodeModal from './InputPinCodeModal';
import CurrencyPicker from '../components/CurrencyPicker';
import {
  checkCameraPermission,
  focusInput,
  focusNext,
  getInfoSvg,
  getRestCurrencies,
  getWalletConnectSvg2,
  hasValue,
  isETHForkChain,
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
import DegreeSelector from '../components/DegreeSelector';
import NavigationService from '../NavigationService';
import { SvgXml } from 'react-native-svg';
import BottomActionMenu from '../components/BottomActionMenu';
const AddContractCurrencyScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const [loading, setLoading] = useState(false);
  const refs = [useRef(), useRef()];
  const [address, setAddress] = useState('');
  // const [currency, setCurrency] = useState(Coin.ETH);
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [inputPinCode, setInputPinCode] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [result, setResult] = useState(null);
  const [showMenu1, setShowMenu1] = useState(false);
  const valueObjArr = useSelector(state => {
    if (state.currency.currencies == null) {
      return [];
    }
    let c = state.currency.currencies || [];
    let others = [];
    let top3 = [];
    for (let i = 0; i < c.length; i++) {
      if (hasValue(c[i].tokenAddress)) {
        continue;
      }
      switch (c[i].currency) {
        case Coin.ETH:
          top3[0] = c[i];
          break;
        case Coin.BSC:
          top3[1] = c[i];
          break;
        case Coin.ONE:
          top3[2] = c[i];
          break;
        default:
          if (isETHForkChain(c[i].currency)) {
            others.push(c[i]);
          }
          break;
      }
    }
    return top3.concat(others);
  });
  const _setAddress = r => {
    r = r.trim();
    setAddress(r);
    setTimeout(() => {
      if (_checkAddress(r)) {
        refs[0].current.blur();
      } else {
        focusInput(refs, 0);
      }
    }, 500);
  };
  const _goScan = async () => {
    if (await checkCameraPermission()) {
      NavigationService.navigate('scanModal', {
        onResult: _setAddress,
        modal: true,
        scanHint: I18n.t('scan_hint_address_only'),
        disableWalletConnect: true,
      });
    }
  };
  const _checkAddress = value => {
    if (!hasValue(value)) {
      setAddressError(
        I18n.t('error_input_empty', { label: I18n.t('contract_address') })
      );
      return false;
    }
    setAddressError(null);
    return true;
  };
  const _addContractCurrency = async pinSecret => {
    setLoading(true);
    try {
      let c = valueObjArr[currencyIndex].currency;
      let result = await Wallets.addContractCurrency(c, address, pinSecret);
      let msg = '';
      if (result.successResults) {
        if (result.successResults.length == 0) {
          msg = I18n.t('token_exist');
        } else {
          dispatch(fetchCurrencies());
          dispatch(fetchWallets());
          msg = I18n.t('collectible_added');
        }
      }
      setResult({
        type: TYPE_SUCCESS,
        title: I18n.t('add_successfully'),
        message: msg,
        buttonClick: () => {
          setResult(null);
          goBack();
        },
      });
    } catch (error) {
      console.log('_addContractCurrency failed', error);
      setResult({
        type: TYPE_FAIL,
        error: I18n.t(`error_msg_${error.code}`, {
          defaultValue: I18n.t('check_if_token_is_valid_nft', error),
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
    if (!_checkAddress(address)) {
      return;
    }
    setInputPinCode(true);
  };

  const _onAddressChanged = value => {
    setAddress(value);
    if (addressError) {
      setAddressError(null);
    }
  };
  return (
    <>
      <Container style={Styles.bottomContainer}>
        <Headerbar
          transparent
          title={I18n.t('add_collectible')}
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
            {I18n.t('blockchain')}
          </Text>
          <BottomActionMenu
            visible={showMenu1}
            currentSelect={currencyIndex}
            title={I18n.t('blockchain')}
            scrollEnabled={true}
            data={valueObjArr}
            getValue={obj =>
              I18n.t(chainI18n[obj.currency], {
                defaultValue: obj.displayName || '',
              })
            }
            onClick={() => {
              setShowMenu1(true);
            }}
            onCancel={() => {
              setShowMenu1(false);
            }}
            onChange={index => {
              setCurrencyIndex(index);
              setShowMenu1(false);
            }}
            containerStyle={{
              flex: null,
              marginVertical: 10,
              paddingHorizontal: 10,
              minHeight: 40,
              borderRadius: 4,
              justifyContent: 'space-between',
            }}
          />
          <Text style={Styles.labelBlock}>{I18n.t('contract_address')}</Text>
          <CompoundTextInput
            ref={refs[0]}
            onSubmitEditing={
              refs[0].current
                ? () => {
                    refs[0].current.blur();
                  }
                : null
            }
            placeholder={I18n.t('to_address_placeholder')}
            style={{ backgroundColor: 'transparent', marginTop: 15 }}
            value={address}
            onClear={() => {
              setAddress('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            underlineColor={Theme.colors.normalUnderline}
            hasError={hasValue(addressError)}
            onChangeText={_onAddressChanged}
            errorMsg={addressError}
            onRightIconClick={_goScan}
          />
        </ScrollView>
        <View style={{ marginTop: 50 }}>
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
        title={I18n.t('add_collectible')}
        isVisible={!!inputPinCode}
        onCancel={() => setInputPinCode(false)}
        loading={loading}
        onInputPinCode={_addContractCurrency}
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
export default withTheme(AddContractCurrencyScreen);
