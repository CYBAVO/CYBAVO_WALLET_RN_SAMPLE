/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  MIN_LEVEL,
  PIN_CODE_LENGTH,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
const { width, height } = Dimensions.get('window');
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
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
  registerPubkey,
  setPushDeviceToken,
  signOut,
  startClock,
  stopClock,
  USER_UPDATE_USER_STATE,
} from '../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  animateSwitchPin,
  focusInput,
  focusNext,
  secondsToTime,
  sleep,
  toast,
  toastError,
} from '../Helpers';
import RoundButton2 from '../components/RoundButton2';
import { useBackHandler, useLayout } from '@react-native-community/hooks';
import NavigationService from '../NavigationService';
import SmoothPinCodeInput from '../components/SmoothPinCodeInput';
import { useShakeAnimation } from '../utils/Hooks';
import AnimatedProgressButton from '../components/AnimatedProgressButton';


const CODE_LENGTH = 6;
let VerifyOtpScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const type = useNavigationParam('type');
  const countryCode = useNavigationParam('countryCode');
  const phone = useNavigationParam('phone');
  const initActionToken = useNavigationParam('actionToken');
  const initLastRequestTime = useNavigationParam('lastRequestTime');
  const [pinSecret, setPinSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { onLayout, ...layout } = useLayout();
  const [error, setError] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [actionToken, setActionToken] = useState(initActionToken);
  const [lastRequestTime, setLastRequestTime] = useState(
    // initLastRequestTime || -1
    -1
  );
  const pinInput = useRef(null);
  const [lock, setLock] = useState(true);
  const time = useSelector(state => state.clock.time);
  const countDown = COOL_TIME - (time - lastRequestTime);
  const inCoolTime = countDown > 0 && countDown < COOL_TIME;
  let isRegister = type == Wallets.OtpType.SMS_SETUP_PHONE_OTP;
  const setPin = useSelector(state => state.user.userState.setPin);
  useEffect(() => {
    dispatch(startClock());
    if (type == Wallets.OtpType.SMS_LOGIN_OTP) {
      _getSmsCode();
    } else {
      _sleepSet();
    }
    return () => {
      dispatch(stopClock());
    };
  }, [type]);
  // handle back
  useBackHandler(() => {
    return true;
  });

  const { shakeTransform, shake } = useShakeAnimation();

  useEffect(() => {
    if (verifyCode.length === CODE_LENGTH) {
      if (!actionToken) {
        console.log('_verifyOtp no actionToken', actionToken, verifyCode);
        return;
      }
      _verifyOtp(actionToken, verifyCode);
    } else {
      if (actionToken && error) {
        setError(null);
      }
    }
  }, [actionToken, verifyCode]);

  useEffect(() => {
    if (!inCoolTime) {
      setLock(true);
    }
  }, [inCoolTime]);

  const _registerPhoneNumber = async () => {
    setLoading(true);
    try {
      console.log('+_registerPhoneNumber:');
      const res = await Auth.registerPhoneNumber(countryCode, phone, COOL_TIME);
      const now = Math.floor(Date.now() / 1000);
      setLastRequestTime(now);
      setLock(false);
      console.log('-_registerPhoneNumber:', actionToken);
      setActionToken(res.actionToken);
    } catch (error) {
      console.warn('registerPhoneNumber failed:', error);
      setError(I18n.t('get_sms_fail_resend_hint'));
      setResult({
        type: TYPE_FAIL,
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
        title: I18n.t('check_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };

  const _sleepSet = async () => {
    await sleep(1000);
    setLastRequestTime(initLastRequestTime);
    setLock(false);
  };
  const _getSmsCode = async () => {
    setLoading(true);
    try {
      console.log('+_getSmsCode:' + type);
      const res = await Wallets.getSmsCode(type, COOL_TIME);
      const now = Math.floor(Date.now() / 1000);
      setLastRequestTime(now);
      setLock(false);
      console.log('-_getSmsCode:', actionToken);
      setActionToken(res.actionToken);
    } catch (error) {
      console.warn('getLoginSmsCode failed:', error);
      setError(I18n.t('get_sms_fail_resend_hint'));
      setResult({
        type: TYPE_FAIL,
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
        title: I18n.t('get_sms_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const _goNext = async () => {
    dispatch(setPushDeviceToken());
    dispatch(registerPubkey());
    if (!isRegister) {
      NavigationService.navigate('Main');
      return;
    }
    NavigationService.navigate('RegisterSuccess', {});
  };
  const _verifyOtp = useCallback(
    async (aToken, vCode) => {
      setLoading(true);
      try {
        console.log('+verifyOtp:', aToken, vCode);
        const res = await Auth.verifyOtp(aToken, vCode);
        console.log('-verifyOtp:', res);
        _goNext();
      } catch (error) {
        if (pinInput.current) {
          pinInput.current.shake();
        }
        console.warn(`userAction failed: ${aToken}, ${vCode}`, error);
        if (error.code == 112) {
          setError(`(${error.code}) ` + I18n.t('error_msg_112_otp'));
        } else if (error.code == 703) {
          setError(`(${error.code}) ` + I18n.t('error_msg_182'));
        } else {
          setError(
            error.code
              ? `(${error.code}) ` + I18n.t(`error_msg_${error.code}`)
              : error.message
          );
        }
      }
      setLoading(false);
    },
    [shake]
  );
  const _requestOtp = () => {
    if (isRegister) {
      _registerPhoneNumber();
    } else {
      _getSmsCode();
    }
  };
  return (
    <Container style={[{ flex: 1, backgroundColor: theme.colors.mask }]}>
      <Headerbar
        title={
          isRegister
            ? setPin
              ? I18n.t('register')
              : `${I18n.t('register')} - ${I18n.t('step', { num: 1 })}`
            : I18n.t('verify_otp_title')
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
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'column',
          flex: 1,
          paddingHorizontal: 16,
          backgroundColor: theme.colors.navy,
        }}>
        <Text
          style={[
            {
              fontSize: 24,
              color: theme.colors.text,
              marginTop: 40,
              marginHorizontal: 16,
            },
            Theme.fonts.default.heavyMax,
          ]}>
          {I18n.t('verify_otp_main')}
        </Text>
        <Text
          style={[
            {
              fontSize: 14,
              color: theme.colors.text,
              marginTop: 8,
              marginBottom: 24,
              marginHorizontal: 16,
              textAlign: 'center',
            },
          ]}>
          {I18n.t('verify_otp_sub', {
            countryCode: countryCode || '',
            phone: phone || '',
          })}
        </Text>
        <SmoothPinCodeInput
          ref={pinInput}
          textContentType="oneTimeCode"
          animated={true}
          // autoFocus={true}
          codeLength={6}
          cellSize={44}
          cellSpacing={8}
          cellStyle={[
            Styles.inputCell,
            {
              backgroundColor: theme.colors.countryCodeBg,
              borderWidth: error ? 2 : 0,
              borderColor: error
                ? theme.colors.error
                : theme.colors.countryCodeBg,
            },
          ]}
          cellStyleFocused={{
            borderColor: error ? theme.colors.error : theme.colors.primary,
            borderWidth: 2,
          }}
          textStyle={[
            { color: theme.colors.text, fontSize: 16 },
            Theme.fonts.default.heavyBold,
          ]}
          keyboardType="number-pad"
          value={verifyCode}
          onTextChange={setVerifyCode}
          editable={!loading}
        />
        <Text style={[Styles.phoneInvalid, { color: theme.colors.error }]}>
          {error ? error : ''}
        </Text>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 14,
            marginTop: 16,
            color: theme.colors.text,
          }}>
          {I18n.t('message_verify_code_not_received')}
        </Text>
        <AnimatedProgressButton
          fill={countDown > 58 ? 'transparent' : theme.colors.primary}
          total={COOL_TIME}
          current={inCoolTime ? countDown : 0}
          style={{ marginBottom: 0 }}
          disabled={inCoolTime}
          lock={false}
          text={
            inCoolTime
              ? I18n.t('resend_code_template', {
                  time: secondsToTime(countDown),
                })
              : I18n.t('resend_code')
          }
          onPress={() => {
            setVerifyCode('');
            setError(null);
            _requestOtp();
          }}
        />
        {isRegister && (
          <TouchableOpacity
            style={[
              Styles.bottomButton,
              {
                backgroundColor: 'transparent',
                borderRadius: 40,
                marginTop: 24,
              },
            ]}
            disabled={loading}
            onPress={() => {
              setLoading(true);
              dispatch({ type: AUTH_UPDATE_UI_FLAG, showSigninModal: true });
              dispatch(signOut(false, true));
            }}>
            <Text
              style={[
                {
                  fontSize: ROUND_BUTTON_FONT_SIZE,
                  color: Theme.colors.primary,
                  textAlign: 'center',
                },
                Theme.fonts.default.medium,
              ]}>
              {I18n.t('back')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
        />
      )}
    </Container>
  );
};
export default withTheme(VerifyOtpScreen);
