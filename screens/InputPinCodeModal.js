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
  Modal,
  Animated,
  StatusBar,
} from 'react-native';
import { Container, Label, Toast } from 'native-base';
import { NumericPinCodeInputView } from '@cybavo/react-native-wallet-service';
import {
  CHANGE_MODE,
  INPUT_MODE,
  PIN_CODE_LENGTH,
  RECOVER_CODE_MODE,
  RECOVERY_CODE_LENGTH,
} from '../Constants';
import PinCodeDisplay from '../components/PinCodeDisplay';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import { withTheme, Text } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import { animateSwitchPin, animateFadeInOut } from '../Helpers';

const ANIM_SWITCH_OFFSET = 80;
let InputPinCodeModal: () => React$Node = ({
  theme,
  isVisible,
  onCancel,
  loading,
  onInputPinCode,
  verifyRecoverCode = recoverCode => true,
  mode = INPUT_MODE,
  errorMsg = '',
  title = I18n.t('enter_pin_code'),
  message1 = I18n.t('enter_pin_code'),
  message2 = I18n.t('enter_a_new_pin_code'),
}) => {
  const myRef = useRef(null);
  const pinDisplay = useRef(null);
  const [pinCodeLength, setPinCodeLength] = useState(0);
  const [oldPinSecret, setOldPinSecret] = useState(null);
  const [animPinInput] = useState(new Animated.Value(0));
  const [backClick, setBackClick] = useState(0);
  const [animOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      StatusBar.setBackgroundColor(theme.colors.background);
    } else {
      setPinCodeLength(0);
      setOldPinSecret(null);
      setBackClick(0);
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    }
    return function cleanup() {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    };
  }, [isVisible]);

  const _inputPinCode = length => {
    if (mode == CHANGE_MODE) {
      _changeMode(length);
    } else if (mode == RECOVER_CODE_MODE) {
      _recoverCodeMode(length);
    } else {
      _inputMode(length);
    }
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

  const _recoverCodeMode = async length => {
    if (oldPinSecret == null) {
      if (length == 0 && pinCodeLength == 0) {
        onCancel();
        return;
      }
      if (
        length == RECOVERY_CODE_LENGTH &&
        pinCodeLength == RECOVERY_CODE_LENGTH - 1
      ) {
        setPinCodeLength(length);
        try {
          const text = await myRef.current.submitPlain();
          const pass = await verifyRecoverCode(text);
          if (pass) {
            setOldPinSecret(text);
            animateSwitchPin(animPinInput, true);
          } else {
            pinDisplay.current.shake(() => {});
          }
        } catch (error) {
          console.warn(error);
        }
        return;
      }
      setPinCodeLength(length);
    } else {
      if (length == 0 && pinCodeLength == 0) {
        animateSwitchPin(animPinInput, false);
        setOldPinSecret(null);
        setPinCodeLength(0);
        return;
      }
      if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
        setPinCodeLength(length);
        try {
          const pinSecret = await myRef.current.submit();
          if (onInputPinCode) {
            onInputPinCode(oldPinSecret, pinSecret);
          }
        } catch (error) {
          console.warn(error);
        }
        return;
      }
      setPinCodeLength(length);
    }
  };
  const _inputMode = length => {
    if (length == 0 && pinCodeLength == 0) {
      onCancel();
      return;
    }
    if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
      setPinCodeLength(length);
      _submit();
      return;
    }
    setPinCodeLength(length);
  };
  const _changeMode = async length => {
    if (oldPinSecret == null) {
      if (length == 0 && pinCodeLength == 0) {
        onCancel();
        return;
      }
      if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
        setPinCodeLength(length);
        try {
          const pinSecret = await myRef.current.submitForMultiple();
          setOldPinSecret(pinSecret);
          animateSwitchPin(animPinInput, true);
        } catch (error) {
          console.warn(error);
        }
        return;
      }
      setPinCodeLength(length);
    } else {
      if (length == 0 && pinCodeLength == 0) {
        animateSwitchPin(animPinInput, false);
        setOldPinSecret(null);
        setPinCodeLength(0);
        return;
      }
      if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
        setPinCodeLength(length);
        try {
          const pinSecret = await myRef.current.submitForMultiple();
          if (onInputPinCode) {
            onInputPinCode(oldPinSecret, pinSecret);
          }
        } catch (error) {
          console.warn(error);
        }
        return;
      }
      setPinCodeLength(length);
    }
  };
  const _submit = async () => {
    if (!onInputPinCode) {
      return;
    }
    try {
      const pinSecret = await myRef.current.submit();
      onInputPinCode(pinSecret);
    } catch (error) {
      console.warn(error);
    }
  };
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
            {oldPinSecret == null ? message1 : message2}
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
            <Animated.View
              style={{
                opacity: animPinInput.interpolate({
                  inputRange: [0, 0.5, 0.5, 1],
                  outputRange: [1, 0, 0, 1],
                }),
                transform: [
                  {
                    translateX: animPinInput.interpolate({
                      inputRange: [0, 0.5, 0.5, 1],
                      outputRange: [
                        0,
                        -ANIM_SWITCH_OFFSET,
                        ANIM_SWITCH_OFFSET,
                        0,
                      ],
                    }),
                  },
                ],
              }}>
              <PinCodeDisplay
                ref={pinDisplay}
                // style={{ marginTop: 50}}
                maxLength={
                  mode == RECOVER_CODE_MODE && oldPinSecret == null
                    ? RECOVERY_CODE_LENGTH
                    : PIN_CODE_LENGTH
                }
                length={pinCodeLength}
              />
            </Animated.View>
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
            maxLength={
              mode == RECOVER_CODE_MODE && oldPinSecret == null
                ? RECOVERY_CODE_LENGTH
                : PIN_CODE_LENGTH
            }
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
          <Label style={Styles.bottomErrorMsg}>{errorMsg}</Label>
        </View>

        <Animated.View
          style={{
            opacity: animOpacity,
            backgroundColor: 'black',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}>
          <Text style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 16 }}>
            {I18n.t('click_again_to_exit_input')}
          </Text>
        </Animated.View>
      </Container>
    </Modal>
  );
};
export default withTheme(InputPinCodeModal);
