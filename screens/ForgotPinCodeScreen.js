import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { Container, Content, Button, Label } from 'native-base';
const { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import {
  RECOVER_CODE_MODE,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
import { Auth } from '@cybavo/react-native-wallet-service';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import InputPinCodeModal from './InputPinCodeModal';
import { withTheme, Text } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import RoundButton2 from '../components/RoundButton2';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
} from '../components/ResultModal';
import { useAppState } from '@react-native-community/hooks';
const ForgotPinCodeScreen: () => React$Node = ({ theme }) => {
  const appState = useAppState();
  const userState = useSelector(state => state.user.userState);
  const { navigate, goBack } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [handleNum, setHandleNum] = useState(null);
  const [inputPinCode, setInputPinCode] = useState(false);
  const [result, setResult] = useState(null);
  const [tmpResult, setTmpResult] = useState(null);
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  useEffect(() => {
    if (!inputPinCode) {
      setPinErrorMsg('');
    }
  }, [inputPinCode]);

  useEffect(() => {
    if (appState == 'active' && tmpResult != null) {
      setResult(tmpResult);
      setTmpResult(null);
    }
  }, [appState]);
  const _forgotPinCode = async () => {
    setLoading(true);
    try {
      const { handleNum } = await Auth.forgotPinCode();
      setHandleNum(handleNum);
    } catch (error) {
      console.log('_forgotPinCode failed', error);
      setResult({
        title: I18n.t('get_handle_number_failed'),
        type: TYPE_FAIL,
        error: error.message,
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const _resetPinCode = async (recoveryCode, pinSecret) => {
    setLoading(true);
    try {
      await Auth.recoverPinCode(pinSecret, recoveryCode);
      setInputPinCode(false);
      navigate('SetupSecurityQuestion');
    } catch (error) {
      console.log('_resetPinCode failed', error);
      setPinErrorMsg(error.message);
    }
    setLoading(false);
  };
  const _composeMailAndSend = () => {
    let email = 'service@cybavo.com';
    let title = `Forgot pin code[${userState.email}]`;
    let body = `[${handleNum}]`;
    Linking.openURL(`mailto:${email}?subject=${title}&body=${body}`);
    setTmpResult({
      title: I18n.t('confirm_your_report'),
      message: I18n.t('after_contact_us_desc'),
      type: TYPE_CONFIRM,
      buttonClick: () => {
        setResult(null);
        navigate('Settings');
      },
      secondaryConfig: {
        color: theme.colors.primary,
        text: I18n.t('close'),
        onClick: () => {
          setResult(null);
        },
      },
    });
  };
  const _verifyRecoveryCode = async recoveryCode => {
    //Todo
    setLoading(true);
    setPinErrorMsg('');
    try {
      await Auth.verifyRecoveryCode(recoveryCode);
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.log('_verifyRecoveryCode failed', error);
      setPinErrorMsg(error.message);
      return false;
    }
  };
  return (
    <>
      <Container style={Styles.bottomContainer}>
        <Headerbar
          transparent
          title={I18n.t('forgot_pin_code_title')}
          onBack={() => {
            goBack();
          }}
        />
        <ScrollView>
          <View style={styles.contentContainer}>
            <Text
              style={[
                Styles.secLabelInputDesc,
                {
                  alignSelf: 'center',
                },
              ]}>
              {I18n.t('forgot_pin_code_desc')}
            </Text>

            <TouchableOpacity
              disabled={handleNum != null}
              style={[
                Styles.bottomButton,
                {
                  backgroundColor: theme.colors.error,
                  borderRadius: 40,
                  opacity: handleNum ? 0.5 : 1,
                },
              ]}
              onPress={_forgotPinCode}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    {
                      fontSize: ROUND_BUTTON_FONT_SIZE,
                      textAlign: 'center',
                    },
                    Theme.fonts.default.medium,
                  ]}>
                  {I18n.t('forgot_the_pin_code')}
                </Text>
                {handleNum && (
                  <Image
                    source={require('../assets/image/ic_btn_checked.png')}
                    resizeMode="stretch"
                    style={{
                      position: 'absolute',
                      width: 26,
                      height: 26,
                      right: 10,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
            {handleNum && (
              <View>
                <Text
                  style={{
                    color: theme.colors.error,
                    fontSize: 14,
                    marginTop: 16,
                    alignSelf: 'center',
                    marginHorizontal: 16,
                  }}>
                  {I18n.t('handle_num_desc')}
                </Text>
                <Text
                  style={[
                    {
                      color: theme.colors.error,
                      alignSelf: 'center',
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginTop: 32,
                    },
                    Theme.fonts.default.heavy,
                  ]}>
                  {I18n.t('handle_number')}:
                </Text>
                <Text
                  style={[
                    {
                      color: Theme.colors.text,
                      alignSelf: 'center',
                      textAlign: 'center',
                      fontSize: 32,
                      fontWeight: 'bold',
                      marginTop: 8,
                      backgroundColor: 'rgb(28,35,58)',
                      paddingHorizontal: 16,
                      overflow: 'hidden',
                      // paddingVertical: 3,
                      borderRadius: 8,
                    },
                    Theme.fonts.default.heavy,
                  ]}>
                  {handleNum}
                </Text>
                <RoundButton2
                  height={ROUND_BUTTON_HEIGHT}
                  style={Styles.bottomButton}
                  labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
                  onPress={_composeMailAndSend}>
                  {I18n.t('contact_us')}
                </RoundButton2>
              </View>
            )}
            <View />
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[
            Styles.bottomButton,
            {
              backgroundColor: 'transparent',
              borderRadius: 40,
            },
          ]}
          onPress={() => {
            setInputPinCode(true);
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
            {I18n.t('i_ve_got_the_verification_code')}
          </Text>
        </TouchableOpacity>
      </Container>

      <InputPinCodeModal
        isVisible={!!inputPinCode}
        onCancel={() => setInputPinCode(false)}
        loading={loading}
        onInputPinCode={_resetPinCode}
        verifyRecoverCode={_verifyRecoveryCode}
        title={I18n.t('forgot_pin_code_title')}
        message1={I18n.t('enter_verification_code')}
        mode={RECOVER_CODE_MODE}
        errorMsg={pinErrorMsg}
      />
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          message={result.message}
          messageStyle={{ width: '90%' }}
          errorMsg={result.error}
          successButtonText={I18n.t('back_to_settings')}
          type={result.type} // only !success & confirm here
          secondaryConfig={result.secondaryConfig}
          onButtonClick={result.buttonClick}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  listItem: {
    minHeight: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
  },
  listItemVertical: {
    minHeight: 60,
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
  },
  image: {
    width: 36,
    height: 36,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});

export default withTheme(ForgotPinCodeScreen);
