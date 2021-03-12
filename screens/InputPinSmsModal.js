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
} from '../Helpers';
import { useLayout } from '@react-native-community/hooks';
import SmoothPinCodeInput from '../components/SmoothPinCodeInput';
import RoundButton2 from '../components/RoundButton2';
import { startClock, stopClock } from '../store/actions';

let InputPinSmsModal: () => React$Node = ({
  theme,
  isVisible,
  onCancel,
  loading,
  callback,
  errorMsg = '',
  title = I18n.t('enter_pin_code'),
}) => {
  const dispatch = useDispatch();
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
  const [page, setPage] = useState(0);
  const [isSms, setIsSms] = useState(false);
  const enableBiometrics = useSelector(
    state => state.user.userState.enableBiometrics
  );
  const skipSmsVerify = useSelector(
    state => state.user.userState.skipSmsVerify
  );
  const time = useSelector(state => state.clock.time);
  const countDown = COOL_TIME - (time - lastRequestTime);
  const inCoolTime = countDown > 0;

  useEffect(() => {
    if (isVisible) {
      StatusBar.setBackgroundColor(theme.colors.background);
      _checkAuthType();
    } else {
      dispatch(stopClock());
      setPinCodeLength(0);
      setPinSecret(null);
      setBackClick(0);
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    }
    return function cleanup() {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    };
  }, [isVisible]);

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
    if (!enableBiometrics || skipSmsVerify) {
      setIsSms(false);
      return;
    }
    try {
      let { exist } = await Wallets.isBioKeyExist();
      let { biometricsType } = await Wallets.getBiometricsType();
      if (biometricsType == 1) {
        //NONE
        setIsSms(true);
        if (exist) {
          await Wallets.updateDeviceInfo(); //NONE
        }
      } else {
        setIsSms(false);
        if (!exist) {
          await Wallets.updateDeviceInfo(); //NONE
          await Wallets.registerPubkey();
        }
      }
    } catch (error) {
      toastError(error);
      console.debug('_checkAuthType pack fail', error);
    }
  };
  const _inputPinCode = length => {
    _inputMode(length);
  };

  const _onBackHandle = () => {
    if (!isVisible || loading) {
      return false;
    }
    if (backClick < 1) {
      setBackClick(backClick + 1);
      animateFadeInOut(animOpacity, 500, () => setBackClick(0));
    } else {
      onCancel();
    }
    return true;
  };

  const _inputMode = length => {
    if (length == 0 && pinCodeLength == 0) {
      onCancel();
      return;
    }
    setPinCodeLength(length);
    if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
      if (!enableBiometrics || skipSmsVerify) {
        _submit(AUTH_TYPE_OLD);
        return;
      }
      if (isSms) {
        dispatch(startClock());
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
    } catch (e) {
      setLastRequestTime(-1);
    }
  };
  const _submit = async (type, actionToken, code) => {
    if (!callback) {
      return;
    }
    try {
      const pinSecret = await myRef.current.submit();
      callback(pinSecret, type, actionToken, code);
    } catch (error) {
      console.warn(error);
    }
  };
  const _getSmsView = () => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          flex: 1,
          paddingHorizontal: 16,
        }}>
        <SmoothPinCodeInput
          autoFocus={true}
          animated={false}
          disableFullscreenUI={false}
          codeLength={6}
          cellSize={44}
          cellSpacing={8}
          cellStyle={[
            Styles.inputCell,
            {
              borderColor: 'rgba(255, 255, 255, 0.56)',
            },
          ]}
          cellStyleFocused={{
            borderColor: theme.colors.text,
          }}
          textStyle={Styles.inputCellText}
          keyboardType="number-pad"
          value={verifyCode}
          onTextChange={setVerifyCode}
          editable={!loading}
        />
        <Text
          style={{
            textAlign: 'center',
            fontSize: 18,
            marginTop: 24,
          }}>
          {I18n.t('message_verify_code_not_received')}
        </Text>
        <View style={Styles.requestNewCodeContainer}>
          {inCoolTime ? (
            <Text
              style={{
                textAlign: 'center',
                fontSize: 18,
              }}>
              {I18n.t('template_verify_code_wait', { second: countDown })}
            </Text>
          ) : (
            <RoundButton2
              height={ROUND_BUTTON_HEIGHT}
              style={{
                marginTop: 16,
                alignSelf: 'center',
                height: ROUND_BUTTON_HEIGHT,
                backgroundColor: Theme.colors.primary,
                justifyContent: 'center',
              }}
              labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
              onPress={() => {
                _getSmsCode();
              }}>
              {I18n.t('request_new_code')}
            </RoundButton2>
          )}
        </View>
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
          style={{
            color: Theme.colors.text,
            marginTop: 0,
            opacity: 0.8,
            fontSize: 20,
          }}>
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
    <Modal
      visible={isVisible}
      transparent={true}
      onBackdropPress={onCancel}
      onBackButtonPress={onCancel}
      style={[Styles.container]}
      onRequestClose={_onBackHandle}
      animationType={'slide'}>
      <Container style={Styles.bottomContainer}>
        <Headerbar
          transparent
          title={title}
          onBack={() => onCancel()}
          Parent={View}
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
      </Container>
    </Modal>
  );
};
export default withTheme(InputPinSmsModal);
