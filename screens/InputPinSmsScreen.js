/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  ActivityIndicator,
  Modal,
  Animated,
  StatusBar,
} from 'react-native';
import { Container, Label, Toast } from 'native-base';
import {
  NumericPinCodeInputView,
  Wallets,
} from '@cybavo/react-native-wallet-service';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import {
  AUTH_TYPE_BIO,
  AUTH_TYPE_OLD,
  AUTH_TYPE_SMS,
  CHANGE_MODE,
  COOL_TIME,
  INPUT_MODE,
  MIN_LEVEL,
  PIN_CODE_LENGTH,
  RECOVER_CODE_MODE,
  RECOVERY_CODE_LENGTH,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
import PinCodeDisplay from '../components/PinCodeDisplay';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import { withTheme, Text } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import {
  animateSwitchPin,
  animateFadeInOut,
  toast,
  toastError,
  secondsToTime,
} from '../Helpers';
import { useLayout } from '@react-native-community/hooks';
import SmoothPinCodeInput from '../components/SmoothPinCodeInput';
import RoundButton2 from '../components/RoundButton2';
import { BIO_SETTING_USE_SMS, startClock, stopClock } from '../store/actions';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import NavigationService from '../NavigationService';
import ResultModal, { TYPE_FAIL } from '../components/ResultModal';
import AnimatedProgressButton from '../components/AnimatedProgressButton';

let InputPinSmsScreen: () => React$Node = ({ theme }) => {
  const from = useNavigationParam('from') || 'Assets';
  const callback = useNavigationParam('callback');
  const { navigate, goBack } = useNavigation();
  const dispatch = useDispatch();
  const errorMsg = '';
  const { onLayout, ...layout } = useLayout();
  const myRef = useRef(null);
  const pinDisplay = useRef(null);
  const [pinCodeLength, setPinCodeLength] = useState(0);
  const [pinSecret, setPinSecret] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [backClick, setBackClick] = useState(0);
  const [animOpacity] = useState(new Animated.Value(0));
  const [verifyCode, setVerifyCode] = useState('');
  const [actionToken, setActionToken] = useState('');
  const [lastRequestTime, setLastRequestTime] = useState(-1);
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [isSms, setIsSms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lock, setLock] = useState(true);
  const enableBiometrics = useSelector(
    state => state.user.userState.enableBiometrics
  );
  const skipSmsVerify = useSelector(
    state => state.user.userState.skipSmsVerify
  );
  const bioSetting = useSelector(state => state.user.userState.bioSetting);
  const countryCode = useSelector(state => state.user.userState.countryCode);
  const phone = useSelector(state => state.user.userState.phone);
  const time = useSelector(state => state.clock.time);
  const countDown = COOL_TIME - (time - lastRequestTime);
  const inCoolTime = countDown > 0;

  useEffect(() => {
    _checkAuthType();
    return function cleanup() {
      dispatch(stopClock());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!inCoolTime) {
      setLock(true);
    }
  }, [inCoolTime]);

  useEffect(() => {
    if (toastMsg) {
      animateFadeInOut(animOpacity, 600, () => setToastMsg(null));
    }
  }, [toastMsg]);

  useEffect(() => {
    if (actionToken && verifyCode.length === PIN_CODE_LENGTH) {
      console.log('_verifyOtp', actionToken, verifyCode);
      _submit(AUTH_TYPE_SMS, actionToken, verifyCode);
    }
  }, [actionToken, verifyCode]);
  const _checkAuthType = async () => {
    console.log('_checkAuthType' + enableBiometrics + ',' + skipSmsVerify);
    if (!enableBiometrics || skipSmsVerify) {
      setIsSms(false);
      return;
    }
    try {
      if (bioSetting == BIO_SETTING_USE_SMS) {
        await Wallets.updateDeviceInfoWithType(Wallets.BiometricsType.NONE);
        setIsSms(true);
        dispatch(startClock());
        return;
      }
      let { exist } = await Wallets.isBioKeyExist();
      let { biometricsType } = await Wallets.getBiometricsType();
      console.debug(`exist:${exist}, biometricsType:${biometricsType}`);
      if (biometricsType == Wallets.BiometricsType.NONE) {
        dispatch(startClock());
        setIsSms(true);
        await Wallets.updateDeviceInfo();
      } else {
        setIsSms(false);
        await Wallets.updateDeviceInfo();
        await Wallets.registerPubkey();
      }
    } catch (error) {
      console.debug('_checkAuthType pack fail', error);
      setResult({
        type: TYPE_FAIL,
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
        title: I18n.t('check_failed'),
      });
    }
  };
  const _inputPinCode = length => {
    _inputMode(length);
  };

  const _inputMode = length => {
    if (length == 0 && pinCodeLength == 0) {
      NavigationService.navigate(from, {});
      return;
    }
    setPinCodeLength(length);
    if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
      if (!enableBiometrics || skipSmsVerify) {
        _submit(AUTH_TYPE_OLD);
        return;
      }
      if (isSms) {
        _getSmsCode();
        setPage(1);
        goToPage(1);
      } else {
        _submit(AUTH_TYPE_BIO);
      }
    }
  };
  const _getSmsCode = async () => {
    try {
      let { actionToken } = await Wallets.getTransactionSmsCode(COOL_TIME);
      setActionToken(actionToken);
      const now = Math.floor(Date.now() / 1000);
      setLastRequestTime(now);
      setLock(false);
    } catch (error) {
      setLastRequestTime(-1);
      console.debug('_getSmsCode fail', error);
      setResult({
        type: TYPE_FAIL,
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
        title: I18n.t('get_sms_failed'),
      });
    }
  };
  const _submit = async (type, actionToken, code) => {
    if (!callback) {
      return;
    }
    try {
      const pinSecret = await myRef.current.submit();
      goBack();
      callback(pinSecret, type, actionToken, code);
    } catch (error) {
      console.warn(error);
    }
  };
  const _getSmsView = () => {
    return (
      <View
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'column',
          flex: 1,
          paddingHorizontal: 16,
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
          {I18n.t('verify_otp_sub', { countryCode: countryCode, phone: phone })}
        </Text>
        <SmoothPinCodeInput
          textContentType="oneTimeCode"
          animated={true}
          disableFullscreenUI={false}
          codeLength={6}
          cellSize={44}
          cellSpacing={8}
          cellStyle={[
            Styles.inputCell,
            {
              borderWidth: 0,
              backgroundColor: theme.colors.normalUnderline,
            },
          ]}
          cellStyleFocused={{
            borderWidth: 2,
            borderColor: theme.colors.primary,
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
          style={{}}
          disabled={inCoolTime}
          text={
            inCoolTime
              ? I18n.t('resend_code_template', {
                  time: secondsToTime(countDown),
                })
              : I18n.t('resend_code')
          }
          lock={lock}
          onPress={() => {
            _getSmsCode();
          }}
        />
      </View>
    );
  };
  const _getPinView = () => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}>
        <Text
          style={[
            {
              color: Theme.colors.text,
              marginTop: 0,
              opacity: 0.8,
              fontSize: 24,
            },
            Theme.fonts.default.heavyBold,
          ]}>
          {I18n.t('enter_pin_code')}
        </Text>

        <View
          style={{
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 30,
            marginBottom: 50,
          }}>
          <PinCodeDisplay
            onLayout={onLayout}
            ref={pinDisplay}
            // style={{ marginTop: 50}}
            maxLength={PIN_CODE_LENGTH}
            length={pinCodeLength}
          />
          {loading && (
            <ActivityIndicator
              color={Theme.colors.primary}
              size="small"
              style={{
                position: 'absolute',
                right: 16,
              }}
            />
          )}
        </View>
        <NumericPinCodeInputView
          ref={myRef}
          style={{
            alignSelf: 'center',
            marginTop: 0,
          }}
          maxLength={PIN_CODE_LENGTH}
          keepKey={true}
          hapticFeedback={false}
          horizontalSpacing={18}
          verticalSpacing={4}
          buttonWidth={70}
          buttonHeight={70}
          buttonBorderRadius={36}
          buttonBackgroundColor={theme.colors.background}
          buttonTextColor={theme.colors.pinTextColor}
          buttonTextSize={12}
          backspaceButtonWidth={72}
          backspaceButtonHeight={72}
          backspaceButtonBorderRadius={36}
          backspaceButtonBackgroundColor={theme.colors.background}
          buttonBackgroundColorDisabled={theme.colors.background}
          backspaceButtonTextColor={theme.colors.pinTextColor}
          buttonTextColorDisabled={theme.colors.pinDisplayInactivate}
          backspaceButtonTextColorDisabled={theme.colors.pinDisplayInactivate}
          backspaceButtonTextSize={9}
          backspaceButtonBackgroundColorDisabled={theme.colors.background}
          backspaceButtonBackgroundColorPressed={
            theme.colors.pinPressedBackgroundColor
          }
          buttonBackgroundColorPressed={theme.colors.pinPressedBackgroundColor}
          androidButtonRippleColor={theme.colors.pinPressedBackgroundColor}
          backspaceButtonTextColorPressed={theme.colors.pinPressedTextColor}
          buttonTextColorPressed={theme.colors.pinPressedTextColor}
          disabled={loading}
          onChanged={_inputPinCode}
        />
        <Label style={Styles.bottomErrorMsg}>{errorMsg}</Label>
      </View>
    );
  };
  let goToPage;
  return (
    <Container style={Styles.bottomContainer}>
      <Headerbar
        transparent
        title={
          isSms && page == 1
            ? I18n.t('verify_otp_title')
            : I18n.t('enter_pin_code')
        }
        onBack={() => {
          NavigationService.navigate(from, {});
        }}
      />
      <ScrollableTabView
        locked={true}
        contentProps={{}}
        style={{
          flex: 1,
          height: layout.height || 142,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          overflow: 'hidden',
        }}
        onChangeTab={({ i, ref, from }) => {}}
        renderTabBar={tabBarProps => {
          goToPage = tabBarProps.goToPage;
          return <View />;
        }}>
        {_getPinView()}
        {_getSmsView()}
      </ScrollableTabView>
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
export default withTheme(InputPinSmsScreen);
