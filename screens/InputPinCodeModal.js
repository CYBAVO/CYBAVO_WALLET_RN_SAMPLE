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
  MIN_LEVEL,
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
import { animateSwitchPin, animateFadeInOut, toast } from '../Helpers';
import StrengthStatus from '../components/StrengthStatus';
import { useLayout } from '@react-native-community/hooks';

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
  message3 = I18n.t('setting_confirm_new_pin'),
}) => {
  const { onLayout, ...layout } = useLayout();
  const myRef = useRef(null);
  const pinDisplay = useRef(null);
  const [pinCodeLength, setPinCodeLength] = useState(0);
  const [oldPinSecret, setOldPinSecret] = useState(null);
  const [pinSecret, setPinSecret] = useState(null);
  const [level, setLevel] = useState(-1);
  const [toastMsg, setToastMsg] = useState(null);
  const [animPinInput] = useState(new Animated.Value(0));
  const [backClick, setBackClick] = useState(0);
  const [animOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      StatusBar.setBackgroundColor(theme.colors.background);
    } else {
      setPinCodeLength(0);
      setOldPinSecret(null);
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
    setPinCodeLength(length);
    if (oldPinSecret == null) {
      if (length == 0 && pinCodeLength == 0) {
        onCancel();
        return;
      }
      if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
        try {
          const pinSecret = await myRef.current.submitForMultiple();
          setOldPinSecret(pinSecret);
          animateSwitchPin(animPinInput, true);
        } catch (error) {
          console.warn(error);
        }
        return;
      }
    } else {
      if (pinSecret == null) {
        if (length == 0 && pinCodeLength == 0) {
          animateSwitchPin(animPinInput, false);
          setOldPinSecret(null);
          return;
        }
        let newLevel = await myRef.current.getStrengthLevel(3);
        if (length != 0 && pinCodeLength != PIN_CODE_LENGTH - 1) {
          setLevel(newLevel);
        }
        if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
          if (newLevel < MIN_LEVEL) {
            setToastMsg(I18n.t('setup_pin_screen_alert_message_too_weak'));
            pinDisplay.current.shake(() => {});
            // setPinCodeLength(0);
            await myRef.current.submitForMultiple(); //clear buffer, cannot call clear(), it will clear key
          } else {
            animateSwitchPin(animPinInput, true, 2, 1);
            const ps = await myRef.current.submitForMultiple();
            setPinSecret(ps);
          }
        }
      } else {
        if (length == 0 && pinCodeLength == 0) {
          animateSwitchPin(animPinInput, false, 2, 1);
          setPinSecret(null);
          return;
        }
        if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
          const ps2 = await myRef.current.submitForMultiple();
          let isSame = await myRef.current.isSamePin(pinSecret, ps2);
          if (!isSame) {
            setToastMsg(I18n.t('setup_pin_screen_alert_message_not_match'));
            pinDisplay.current.shake(() => {
              setPinSecret(null);
              animateSwitchPin(animPinInput, false, 2, 1);
            });
          } else {
            if (onInputPinCode) {
              onInputPinCode(oldPinSecret, pinSecret);
            }
          }
        }
      }
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
  let showStrength = mode == CHANGE_MODE && oldPinSecret && pinSecret == null;
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
            {oldPinSecret == null
              ? message1
              : pinSecret == null
              ? message2
              : message3}
          </Text>

          <View
            style={{
              alignSelf: 'stretch',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 30,
              marginBottom: showStrength ? 0 : 50,
            }}>
            <Animated.View
              style={{
                opacity: animPinInput.interpolate({
                  inputRange: [0, 0.5, 0.5, 1, 1.5, 1.5, 2],
                  outputRange: [1, 0, 0, 1, 0, 0, 1],
                }),
                transform: [
                  {
                    translateX: animPinInput.interpolate({
                      inputRange: [0, 0.5, 0.5, 1, 1.5, 1.5, 2],
                      outputRange: [
                        0,
                        -ANIM_SWITCH_OFFSET,
                        ANIM_SWITCH_OFFSET,
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
                onLayout={onLayout}
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
          {showStrength && (
            <StrengthStatus
              widthParam={layout.width}
              level={pinSecret == null && pinCodeLength == 0 ? -1 : level}
            />
          )}
          <NumericPinCodeInputView
            ref={myRef}
            style={{
              alignSelf: 'center',
              marginTop: 0,
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
            {toastMsg || I18n.t('click_again_to_exit_input')}
          </Text>
        </Animated.View>
      </Container>
    </Modal>
  );
};
export default withTheme(InputPinCodeModal);
