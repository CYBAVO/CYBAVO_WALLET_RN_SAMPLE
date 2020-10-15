/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Container, Content } from 'native-base';
import {
  Auth,
  Wallets,
  NumericPinCodeInputView,
} from '@cybavo/react-native-wallet-service';
import {
  PIN_CODE_LENGTH,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
const { width, height } = Dimensions.get('window');
import PinCodeDisplay from '../components/PinCodeDisplay';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import { withTheme, Text } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { useNavigation } from 'react-navigation-hooks';
import { fetchUserState, fetchWallets } from '../store/actions';
import { useDispatch } from 'react-redux';
import { animateSwitchPin } from '../Helpers';
import RoundButton2 from '../components/RoundButton2';
import { useBackHandler } from '@react-native-community/hooks';
import NavigationService from '../NavigationService';

const ANIM_SWITCH_OFFSET = 80;
let SetupPinScreen: () => React$Node = ({ theme }) => {
  const myRef = useRef(null);
  const dispatch = useDispatch();
  const pinDisplay = useRef(null);
  const [pinCodeLength, setPinCodeLength] = useState(0);
  const [animPinInput] = useState(new Animated.Value(0));
  const [step, setStep] = useState(0);
  const [pinSecret, setPinSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const delaySetStep = value => {
    setStep(value);
  };
  const _inputPinCode = length => {
    _inputMode(length);
  };
  const _inputMode = async length => {
    if (length == 0 && pinCodeLength == 0) {
      return;
    }
    if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
      const ps = await myRef.current.submit();
      setPinSecret(ps);
      setPinCodeLength(0);
      animateSwitchPin(animPinInput, true);
      delaySetStep(1);
      return;
    }
    setPinCodeLength(length);
  };

  // handle back
  useBackHandler(() => {
    return true;
  });
  const _submit = async () => {
    try {
      setLoading(true);
      // const pinSecret = await myRef.current.submit();
      // setup PIN code and retain PinSecret
      await Auth.setupPinCode({ pinSecret, retain: true });
      // create default wallet with retained PinSecret
      await Wallets.createWallet(
        60, // currency
        '', // tokenAddress
        0, // parentWalletId
        'My Ethereum', // name
        pinSecret, // pinSecret
        {} // extraAttributes
      );
      setResult({
        type: TYPE_SUCCESS,
        title: I18n.t('setup_successfully'),
        message: I18n.t('setup_pin_success_desc'),
      });
    } catch (error) {
      console.warn(error);
      setResult({
        type: TYPE_FAIL,
        title: I18n.t('setup_failed'),
        error: error.message,
        tryAgain: error.code != 169,
      });
    }
    dispatch(fetchWallets());
    dispatch(fetchUserState());
    setLoading(false);
  };
  return (
    <Container style={Styles.bottomContainer}>
      <Headerbar transparent title={I18n.t('setup_pin_code')} />

      <Animated.View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          opacity: animPinInput.interpolate({
            inputRange: [0, 0.5, 0.5, 1],
            outputRange: [1, 0, 0, 1],
          }),
          transform: [
            {
              translateX: animPinInput.interpolate({
                inputRange: [0, 0.5, 0.5, 1],
                outputRange: [0, -ANIM_SWITCH_OFFSET, ANIM_SWITCH_OFFSET, 0],
              }),
            },
          ],
        }}>
        {step == 0 && (
          <Animated.View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              opacity: animPinInput.interpolate({
                inputRange: [0, 0.5, 0.5, 1],
                outputRange: [1, 0, 0, 0],
              }),
            }}>
            <Text
              style={{
                color: Theme.colors.text,
                marginTop: 0,
                opacity: 0.8,
                fontSize: 20,
              }}>
              {I18n.t('setup_pin_code_desc')}
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
                // marginTop: 16,
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
              backspaceButtonTextColorDisabled={
                theme.colors.pinDisplayInactivate
              }
              backspaceButtonTextSize={9}
              // backspaceButtonText={'←'}
              backspaceButtonBackgroundColorDisabled={theme.colors.background}
              backspaceButtonBackgroundColorPressed={
                theme.colors.pinPressedBackgroundColor
              }
              buttonBackgroundColorPressed={
                theme.colors.pinPressedBackgroundColor
              }
              androidButtonRippleColor={theme.colors.pinPressedBackgroundColor}
              backspaceButtonTextColorPressed={theme.colors.pinPressedTextColor}
              buttonTextColorPressed={theme.colors.pinPressedTextColor}
              disabled={loading}
              onChanged={_inputPinCode}
            />
          </Animated.View>
        )}
        {step == 1 && (
          <Animated.View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              flex: 1,
              paddingHorizontal: 16,
              backgroundColor: Theme.colors.background,
              opacity: animPinInput.interpolate({
                inputRange: [0, 0.5, 0.5, 1],
                outputRange: [0, 0, 0, 1],
              }),
            }}>
            <Text
              style={[
                Theme.fonts.default.regular,
                {
                  textAlign: 'left',
                  fontSize: 18,
                  marginTop: 16,
                  marginBottom: 16,
                },
              ]}>
              {I18n.t('before_setup_pin_desc')}
            </Text>
            <TouchableOpacity
              style={[
                Styles.bottomButton,
                {
                  backgroundColor: 'transparent',
                  borderRadius: 40,
                  marginTop: 40,
                },
              ]}
              disabled={loading}
              onPress={() => {
                setPinSecret(null);
                animateSwitchPin(animPinInput, false);
                delaySetStep(0);
              }}>
              <Text
                style={[
                  {
                    fontSize: ROUND_BUTTON_FONT_SIZE,
                    color: Theme.colors.error,
                    textAlign: 'center',
                  },
                  Theme.fonts.default.medium,
                ]}>
                {I18n.t('previous_step_desc')}
              </Text>
            </TouchableOpacity>
            <RoundButton2
              disabled={loading}
              height={ROUND_BUTTON_HEIGHT}
              style={Styles.bottomButton}
              labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
              onPress={_submit}>
              {I18n.t('next_step_desc')}
            </RoundButton2>
          </Animated.View>
        )}
      </Animated.View>
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
          failButtonText={
            result.tryAgain ? I18n.t('try_again') : I18n.t('done')
          }
          visible={!!result}
          title={result.title}
          message={result.message}
          errorMsg={result.error}
          type={result.type}
          onButtonClick={() => {
            if (result.type === TYPE_SUCCESS || !result.tryAgain) {
              setResult(null);
              NavigationService.navigate('Main');
            } else {
              animateSwitchPin(animPinInput, false);
              delaySetStep(0);
              setPinSecret(null);
              setResult(null);
            }
          }}
        />
      )}
    </Container>
  );
};
export default withTheme(SetupPinScreen);
