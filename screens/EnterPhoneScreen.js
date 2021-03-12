/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { Container, Content } from 'native-base';
import {
  Auth,
  Wallets,
  NumericPinCodeInputView,
} from '@cybavo/react-native-wallet-service';
import {
  CHANGE_MODE,
  Coin,
  COOL_TIME,
  COUNTRIES,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
const { width, height } = Dimensions.get('window');
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n, { Country } from '../i18n/i18n';
import { withTheme, Text, IconButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import {
  AUTH_UPDATE_UI_FLAG,
  fetchCurrencyPricesIfNeed,
  fetchUserState,
  fetchWallets,
  signOut,
} from '../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  animateSwitchPin,
  focusInput,
  focusNext,
  sleep,
  toast,
  toastError,
} from '../Helpers';
import RoundButton2 from '../components/RoundButton2';
import { useBackHandler, useLayout } from '@react-native-community/hooks';
import NavigationService from '../NavigationService';
import SmoothPinCodeInput from '../components/SmoothPinCodeInput';
import { useKeyboard, useShakeAnimation } from '../utils/Hooks';
import CountryCode from '../components/CountryCode';
import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';
import CountryCodePicker from '../components/CountryCodePicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
const PhoneUtil = PhoneNumberUtil.getInstance();
function validatePhoneNumber(countryCode, nationalNumber) {
  if (!countryCode || !nationalNumber) {
    return { possible: false, valid: false };
  }
  const number = new PhoneNumber();
  number.setCountryCode(countryCode);
  number.setNationalNumber(nationalNumber);
  const possible = PhoneUtil.isPossibleNumber(number);
  const valid = PhoneUtil.isValidNumber(number);
  return { possible, valid };
}

function formatNationalNumber(countryCoce, nationalNumber) {
  if (!nationalNumber) {
    return '';
  }
  const international = `${nationalNumber}`;
  return international.replace(/^(\+\d*) /g, '');
}

let EnterPhoneScreen: () => React$Node = ({
  theme,
  navigation: { goBack, navigate },
  // route: { params = {} },
}) => {

  const webviewRef = useRef(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [regionCode, setRegionCode] = useState('US');
  const [countryCode, setCountryCode] = useState('1');
  const [nationalNumber, setNationalNumber] = useState(null);
  const [numberError, setNumberError] = useState(null);
  const authLoading = useSelector(state => state.auth.loading);
  const setPin = useSelector(state => state.user.userState.setPin);
  const [result, setResult] = useState(null);
  const _initRegionCode = () => {
    let item = COUNTRIES[Country];
    if (item) {
      setRegionCode(Country);
      setCountryCode(item.countryCode);
    }
  };
  // select countryCode
  useEffect(() => {
    _initRegionCode();
  }, [dispatch]);


  // handle keyboard
  const { keyboardVisible, keyboardHeight } = useKeyboard();

  const _goSelectCountry = () => {
    navigate('SelectCountry', {
      source: 'EnterPhone',
      selected: regionCode,
    });
  };
  const _onSelectCountryCode = (regionCode, countryCode) => {
    setCountryCode(countryCode);
    setRegionCode(regionCode);
    let result = validatePhoneNumber(countryCode, nationalNumber);
    if (result.possible && !result.valid) {
      setNumberError(I18n.t('message_phone_invalid'));
    } else {
      setNumberError(null);
    }
  };
  const _onInputNationalNumber = text => {
    let value = Number(text.replace(/[^0-9]/g, ''));
    setNationalNumber(value);
    let result = validatePhoneNumber(countryCode, value);
    if (result.possible && !result.valid) {
      setNumberError(I18n.t('message_phone_invalid'));
    } else {
      setNumberError(null);
    }
  };

  const _submit = () => {
    let result = validatePhoneNumber(countryCode, nationalNumber);
    if (!result.possible || !result.valid) {
      setNumberError(I18n.t('message_phone_invalid'));
      return;
    }
    setNumberError(null);
    _registerPhoneNumber();
  };
  const _registerPhoneNumber = async () => {
    setLoading(true);
    try {
      console.log(
        `+registerPhoneNumber:${countryCode},${fotmattedNationalNumber}`
      );
      const now = Math.floor(Date.now() / 1000);
      const res = await Auth.registerPhoneNumber(
        countryCode,
        fotmattedNationalNumber,
        COOL_TIME
      );
      console.log('-registerPhoneNumber:', res.actionToken);
      setLoading(false);
      NavigationService.navigate('VerifyOtp', {
        actionToken: res.actionToken,
        type: Wallets.OtpType.SMS_SETUP_PHONE_OTP,
        countryCode,
        phone: fotmattedNationalNumber,
        lastRequestTime: now,
      });
    } catch (error) {
      console.warn('registerPhoneNumber failed:', error);
      setResult({
        type: TYPE_FAIL,
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
        title: I18n.t('register_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const fotmattedNationalNumber = formatNationalNumber(
    countryCode,
    nationalNumber
  );


  return (
    <Container style={[{ flex: 1, backgroundColor: theme.colors.mask }]}>
      <Headerbar
        title={
          setPin
            ? I18n.t('register')
            : `${I18n.t('register')} - ${I18n.t('step', { num: 1 })}`
        }
        titleColor={theme.colors.text}
        style={{
          zIndex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 62,
          backgroundColor: theme.colors.navy,
        }}
        ParentIos={SafeAreaView}
        Parent={SafeAreaView}
        onBack={() => {
          setLoading(true);
          dispatch(signOut(false, true));
        }}
        backIcon={require('../assets/image/ic_cancel.png')}
      />
      <View
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.navy,
          flex: 1,
          padding: 16,
        }}>
        <Text style={[Styles.registerMainText, Theme.fonts.default.heavyMax]}>
          {I18n.t('register_phone_main')}
        </Text>
        <Text style={[Styles.registerSubText]}>
          {setPin
            ? I18n.t('register_phone_sub_final')
            : I18n.t('register_phone_sub_setpin')}
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 24 }}>
          <CountryCodePicker
            style={styles.countryCode}
            initSelected={regionCode}
            clickItem={_onSelectCountryCode}
          />
          <TextInput
            autoFocus={true}
            value={fotmattedNationalNumber}
            onChangeText={_onInputNationalNumber}
            keyboardType="numeric"
            placeholder={I18n.t('hint_national_number')}
            placeholderTextColor={theme.colors.placeholder}
            style={[
              styles.nationalNumber,
              theme.fonts.medium,
              {
                marginLeft: 8,
                flex: 1,
                backgroundColor: theme.colors.pickerBg,
                borderColor: numberError
                  ? theme.colors.alert
                  : theme.colors.pickerBg,
              },
            ]}
          />
        </View>
        <Text style={[Styles.phoneInvalid, { color: theme.colors.error }]}>
          {numberError ? numberError : ''}
        </Text>

        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[Styles.bottomButton, { marginTop: 16 }]}
          disabled={numberError != null}
          color={theme.colors.primary}
          outlined={true}
          labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
          onPress={() => {
            _submit();
          }}>
          {I18n.t('continue')}
        </RoundButton2>
        <View
          style={{
            width: width,
            height: 80,
            marginTop: 0,
          }}>
          <WebView
            ref={webviewRef}
            useWebKit={true}
            source={{ html: I18n.t(`sign_in_agreement_${Platform.OS}`) }}
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
            }}
            onShouldStartLoadWithRequest={event => {
              if (!/^[data:text, about:blank]/.test(event.url)) {
                Linking.openURL(event.url);
                return false;
              }
              return true;
            }}
          />
        </View>
      </View>
      {(authLoading || loading) && (
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
  inputCellText: {
    color: Theme.colors.text,
    fontSize: 16,
  },
  nationalNumberContainer: {
    marginLeft: 8,
    flex: 1,
  },
  countryCode: {
    height: 44,
  },
  nationalNumber: {
    height: 44,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    color: Theme.colors.text,
  },
  phoneNumber: {
    marginTop: 24,
    flexDirection: 'row',
  },
});
export default withTheme(EnterPhoneScreen);
