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
  WalletSdk,
  NumericPinCodeInputView,
  ErrWalletCurrencyInvalid,
} from '@cybavo/react-native-wallet-service';
const { ErrorCodes } = WalletSdk;
import {
  CHANGE_MODE,
  Coin,
  HEADER_BAR_PADDING,
  MIN_LEVEL,
  PIN_CODE_LENGTH,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
const { width, height } = Dimensions.get('window');
import PinCodeDisplay from '../components/PinCodeDisplay';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import { withTheme, Text, IconButton } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import {
  AUTH_UPDATE_UI_FLAG,
  checkKycSetting,
  fetchCurrencyPricesIfNeed,
  fetchUserState,
  fetchWallets,
  getApplicantStatus,
  isPassedKyc,
  registerPubkey,
  signOut,
} from '../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  animateSwitchPin,
  getSuccessSvg,
  sleep,
  toast,
  toastError,
} from '../Helpers';
import RoundButton2 from '../components/RoundButton2';
import { useBackHandler, useLayout } from '@react-native-community/hooks';
import NavigationService from '../NavigationService';
import StrengthStatus from '../components/StrengthStatus';
import { SvgXml } from 'react-native-svg';
import { devDialogOption, initOptionalWallet } from '../BuildConfig';

const ANIM_SWITCH_OFFSET = 80;
let SetupPinScreen: () => React$Node = ({ theme }) => {
  const myRef = useRef(null);
  const dispatch = useDispatch();
  const pinDisplay = useRef(null);
  const [pinCodeLength, setPinCodeLength] = useState(0);
  const [animPinInput] = useState(new Animated.Value(0));
  const [animPinDisplay] = useState(new Animated.Value(0));
  const [step, setStep] = useState(0);
  const [pinSecret, setPinSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const applicantStatus = useSelector(state => state.kyc.applicantStatus);
  const [result, setResult] = useState(null);
  const [result2, setResult2] = useState(null);
  const [level, setLevel] = useState(0);
  const { onLayout, ...layout } = useLayout();
  const authError = useSelector(state => state.auth.error);
  const fromEnterPhone = useNavigationParam('fromEnterPhone');
  const option = useSelector(state => {
    return state.auth.option || devDialogOption[0].key;
  });

  useEffect(() => {
    dispatch(getApplicantStatus());
  }, []);

  useEffect(() => {
    if (authError != null) {
      setResult({
        type: TYPE_FAIL,
        title: I18n.t('signin_failed'),
        error: authError.code
          ? I18n.t(`error_msg_${authError.code}`)
          : authError.message,
        tryAgain: false,
      });
    }
  }, [authError]);

  let showStrength = pinSecret == null;
  const _inputPinCode = length => {
    _inputMode(length);
  };
  const _inputMode = async length => {
    setPinCodeLength(length);
    if (pinSecret == null) {
      if (length == 0 && pinCodeLength == 0) {
        return;
      }
      let newLevel = await myRef.current.getStrengthLevel(3);
      setLevel(newLevel);

      if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
        if (newLevel < MIN_LEVEL) {
          toast(I18n.t('setup_pin_screen_alert_message_too_weak'));
          setPinCodeLength(0);
          await myRef.current.submitForMultiple(); //clear buffer, cannot call clear(), it will clear key
          pinDisplay.current.shake(() => {});
        } else {
          const ps = await myRef.current.submitForMultiple();
          setPinSecret(ps);
          setPinCodeLength(0);
          animateSwitchPin(animPinDisplay, true);
          // setStep(1);
          return;
        }
      }
    } else {
      if (length == 0 && pinCodeLength == 0) {
        animateSwitchPin(animPinDisplay, false);
        setPinSecret(null);
        return;
      }
      if (length == PIN_CODE_LENGTH && pinCodeLength == PIN_CODE_LENGTH - 1) {
        const ps2 = await myRef.current.submitForMultiple();
        let isSame = await myRef.current.isSamePin(pinSecret, ps2);
        if (!isSame) {
          // animateSwitchPin(animPinInput, false);
          // await myRef.current.clear();
          toast(I18n.t('setup_pin_screen_alert_message_not_match'));
          pinDisplay.current.shake(() => {
            setPinSecret(null);
            animateSwitchPin(animPinDisplay, false);
          });
        } else {
          _submit();
        }
      }
    }
  };

  // handle back
  useBackHandler(() => {
    return true;
  });
  const _showKycAlert = () =>
    applicantStatus.error !== ErrorCodes.ErrKycSettingsNotFound &&
    !isPassedKyc(applicantStatus.result);
  const _revokeUser = () => {
    setResult2(null);
    setLoading(true);
    Auth.revokeUser()
      .then(result => {
        setResult2({
          type: TYPE_SUCCESS,
          successButtonText: I18n.t('done'),
          title: I18n.t('revoke_account_successfully'),
          message: I18n.t('revoke_account_successfully_desc'),
          buttonClick: () => {
            setResult2(null);
            dispatch(signOut(false, false));
          },
        });
        setLoading(false);
      })
      .catch(error => {
        console.log('revokeUser failed', error);
        setLoading(false);
        setResult2({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t('revoke_account_failed'),
          buttonClick: () => {
            setResult2(null);
          },
        });
      });
  };
  const _submit = async () => {
    try {
      if (false) {
        animateSwitchPin(animPinInput, true);
        setStep(1);
        return;
      }
      setLoading(true);
      // const pinSecret = await myRef.current.submit();
      // setup PIN code and retain PinSecret
      await Auth.setupPinCode({ pinSecret, retain: true });
      // create default wallet with retained PinSecret
      let initWallet = [
        { currency: Coin.BTC, name: 'My Bitcoin', tokenAddress: '' },
        { currency: Coin.ETH, name: 'My Ethereum', tokenAddress: '' },
        {
          currency: Coin.GOERLI,
          name: 'My Ethereum (Goerli)',
          tokenAddress: '',
        },
      ];
      let parentMap = {};
      for (let i = 0; i < initWallet.length; i++) {
        try {
          let result = await Wallets.createWallet(
            initWallet[i].currency, // currency
            initWallet[i].tokenAddress, // tokenAddress
            initWallet[i].tokenAddress == ''
              ? 0
              : parentMap[initWallet[i].currency], // parentWalletId
            initWallet[i].name, // name
            { pinSecret, retain: i < initWallet.length - 1 }, // pinSecret
            {} // extraAttributes
          );
          if (initWallet[i].tokenAddress == '') {
            parentMap[initWallet[i].currency] = result.walletId;
          }

          await sleep(500);
        } catch (e) {
          if (e == null) {
            return;
          }
          console.log(`InitWallet Error:${e.code}, ${e.message}`);
          if (e.code !== ErrorCodes.ErrWalletCurrencyInvalid) {
            toastError(e);
          }
        }
      }

      animateSwitchPin(animPinInput, true);
      setStep(1);
      // setResult({
      //   type: TYPE_SUCCESS,
      //   title: I18n.t('setup_successfully'),
      //   message: I18n.t('setup_pin_success_desc'),
      // });
    } catch (error) {
      console.warn(error);
      setResult({
        type: TYPE_FAIL,
        title: I18n.t('setup_failed'),
        error: I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        }),
        tryAgain: error.code != 169,
      });
    }
    dispatch({ type: AUTH_UPDATE_UI_FLAG, justSignup: false });
    dispatch(fetchWallets());
    dispatch(fetchUserState());
    setLoading(false);
  };
  return (
    <Container style={[{ flex: 1, backgroundColor: theme.colors.mask }]}>
      <Headerbar
        transparent
        title={
          fromEnterPhone
            ? `${I18n.t('register')} - ${I18n.t('step', { num: 2 })}`
            : I18n.t('register')
        }
        titleColor={theme.colors.text}
        style={{
          zIndex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 62,
          backgroundColor: theme.colors.navy,
        }}
        onBack={() => {
          setLoading(true);
          dispatch(signOut(false, true));
        }}
        backIcon={require('../assets/image/ic_cancel.png')}
        actions={
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              borderless
              style={{
                marginRight: HEADER_BAR_PADDING,
                justifyContent: 'center',
              }}
              // accessibilityLabel={clearAccessibilityLabel}
              color={'rgba(255, 255, 255, 0.56)'}
              // rippleColor={rippleColor}
              onPress={() =>
                setResult2({
                  type: TYPE_CONFIRM,
                  title: I18n.t('revoke_account_title'),
                  message: I18n.t('revoke_account_confirm_message'),
                  successButtonText: I18n.t('revoke_account_title'),
                  secondaryConfig: {
                    color: theme.colors.primary,
                    text: I18n.t('cancel'),
                    onClick: () => {
                      setResult2(null);
                    },
                  },
                  buttonClick: () => {
                    _revokeUser();
                    setResult2(null);
                  },
                })
              }
              icon={({ size, color }) => (
                <Image
                  source={require('../assets/image/ic_revoke.png')}
                  style={{ width: 24, height: 24 }}
                />
              )}
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
            />
          </View>
        }
      />
      <View
        style={{
          backgroundColor: theme.colors.navy,
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}>
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
              {/*<Text*/}
              {/*  style={{*/}
              {/*    color: Theme.colors.textDarkBg,*/}
              {/*    marginTop: 0,*/}
              {/*    opacity: 0.8,*/}
              {/*    fontSize: 20,*/}
              {/*  }}>*/}
              {/*  {pinSecret? I18n.t('setup_pin_screen_confirm_new_pin'): I18n.t('setup_pin_code_desc')}*/}
              {/*</Text>*/}
              <Text
                style={[
                  {
                    fontSize: 24,
                    color: theme.colors.text,
                    marginTop: 40,
                    marginHorizontal: 40,
                  },
                  Theme.fonts.default.heavyMax,
                ]}>
                {pinSecret
                  ? I18n.t('confirm_pin_title')
                  : I18n.t('setup_pin_title')}
              </Text>
              <Text
                style={[
                  {
                    fontSize: 14,
                    color: theme.colors.text,
                    marginTop: 8,
                    marginBottom: 0,
                    marginHorizontal: 40,
                    textAlign: 'center',
                  },
                ]}>
                {pinSecret
                  ? I18n.t('confirm_pin_sub')
                  : I18n.t('setup_pin_sub')}
              </Text>
              <Animated.View
                style={{
                  opacity: animPinDisplay.interpolate({
                    inputRange: [0, 0.5, 0.5, 1],
                    outputRange: [1, 0, 0, 1],
                  }),
                  transform: [
                    {
                      translateX: animPinInput.interpolate({
                        inputRange: [0, 0.5, 0.5, 1],
                        outputRange: [0, -80, ANIM_SWITCH_OFFSET, 0],
                      }),
                    },
                  ],
                }}>
                <View
                  style={{
                    alignSelf: 'stretch',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 30,
                    marginBottom: showStrength ? 0 : 50,
                  }}>
                  <PinCodeDisplay
                    onLayout={onLayout}
                    ref={pinDisplay}
                    // style={{ marginTop: 50}}
                    maxLength={PIN_CODE_LENGTH}
                    length={pinCodeLength}
                  />
                </View>
              </Animated.View>
              {showStrength && (
                <StrengthStatus
                  widthParam={layout.width}
                  level={pinSecret == null && pinCodeLength == 0 ? -1 : level}
                  labelStyle={{ color: theme.colors.text }}
                />
              )}
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
                buttonBackgroundColor={theme.colors.navy}
                buttonTextColor={theme.colors.text}
                buttonTextSize={12}
                backspaceButtonWidth={72}
                backspaceButtonHeight={72}
                backspaceButtonBorderRadius={36}
                backspaceButtonBackgroundColor={theme.colors.navy}
                buttonBackgroundColorDisabled={theme.colors.navy}
                backspaceButtonTextColor={theme.colors.text}
                buttonTextColorDisabled={theme.colors.text}
                backspaceButtonTextColorDisabled={theme.colors.text}
                backspaceButtonTextSize={9}
                // backspaceButtonText={'←'}
                backspaceButtonBackgroundColorDisabled={theme.colors.navy}
                backspaceButtonBackgroundColorPressed={
                  theme.colors.pinPressedBackgroundColor
                }
                buttonBackgroundColorPressed={
                  theme.colors.pinPressedBackgroundColor
                }
                androidButtonRippleColor={
                  theme.colors.pinPressedBackgroundColor
                }
                backspaceButtonTextColorPressed={theme.colors.text}
                buttonTextColorPressed={theme.colors.text}
                disabled={loading}
                onChanged={_inputPinCode}
              />
            </Animated.View>
          )}
          {step == 1 && (
            <Animated.View
              style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'column',
                flex: 1,
                paddingHorizontal: 16,
                opacity: animPinInput.interpolate({
                  inputRange: [0, 0.5, 0.5, 1],
                  outputRange: [0, 0, 0, 1],
                }),
              }}>
              <SvgXml xml={getSuccessSvg()} style={{ marginTop: 25 }} />
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
                {I18n.t('setup_pin_success_title')}
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
                {I18n.t('setup_pin_success_sub')}
              </Text>

              <RoundButton2
                height={ROUND_BUTTON_HEIGHT}
                style={[
                  {
                    alignSelf: 'center',
                    height: ROUND_BUTTON_HEIGHT,
                    marginTop: 24,
                    width: '90%',
                    backgroundColor: Theme.colors.primary,
                    justifyContent: 'center',
                    borderColor: theme.colors.primary,
                  },
                ]}
                outlined={true}
                labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
                onPress={() => {
                  dispatch(checkKycSetting());
                  if (_showKycAlert()) {
                    NavigationService.navigate('KycAlert');
                  } else {
                    NavigationService.navigate('Main', {
                      isNews: true,
                    });
                  }
                }}>
                {I18n.t('start_using')}
              </RoundButton2>
            </Animated.View>
          )}

          {step == 0 && (
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
                if (pinSecret) {
                  myRef.current.clear();
                  setPinSecret(null);
                  animateSwitchPin(animPinInput, false);
                  // setStep(0);
                } else {
                  dispatch({
                    type: AUTH_UPDATE_UI_FLAG,
                    showSigninModal: true,
                  });
                  dispatch(signOut(false));
                }
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
                {pinSecret ? I18n.t('previous_step_desc') : I18n.t('back')}
              </Text>
            </TouchableOpacity>
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
        {result2 && (
          <ResultModal
            visible={!!result2}
            title={result2.title}
            successButtonText={result2.successButtonText}
            type={result2.type}
            message={result2.message}
            errorMsg={result2.error}
            onButtonClick={result2.buttonClick}
            secondaryConfig={result2.secondaryConfig}
          />
        )}
        {result && (
          <ResultModal
            failButtonText={
              result.tryAgain
                ? I18n.t('try_again')
                : authError != null
                ? I18n.t('back_to_signin')
                : I18n.t('done')
            }
            visible={!!result}
            title={result.title}
            message={result.message}
            errorMsg={result.error}
            type={result.type}
            onButtonClick={() => {
              if (result.type === TYPE_SUCCESS || !result.tryAgain) {
                setResult(null);
                let routeName = _showKycAlert() ? 'KycAlert' : 'Main';
                NavigationService.navigate(routeName);
              } else if (result.type === TYPE_FAIL && authError != null) {
                NavigationService.navigate('Auth');
              } else {
                animateSwitchPin(animPinInput, false);
                setStep(0);
                setPinSecret(null);
                setResult(null);
              }
            }}
          />
        )}
      </View>
    </Container>
  );
};
export default withTheme(SetupPinScreen);
