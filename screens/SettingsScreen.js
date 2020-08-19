import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SectionList,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { Container, Content, Toast } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { BADGE_FONT_SIZE } from '../Constants';
import { WalletSdk, Auth } from '@cybavo/react-native-wallet-service';
import { signOut } from '../store/actions';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import InputPinCodeModal from './InputPinCodeModal';
import { withTheme, Text, ActivityIndicator } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import VersionNumber from 'react-native-version-number';
import IconSvgXml from '../components/IconSvgXml';
const {
  sdkInfo: { VERSION_NAME, VERSION_CODE, BUILD_TYPE },
} = WalletSdk;
const SettingsScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const [inputPinCode, setInputPinCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('current PinSecret not found');
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const userState = useSelector(state => state.user.userState);
  const identity = useSelector(state => state.auth.identity);
  const _goChangePinCode = () => {
    setInputPinCode(true);
  };
  const _changePinCode = async (oldPinSecret, pinSecret) => {
    setLoading(true);
    try {
      await Auth.changePinCode(pinSecret, oldPinSecret);
      setResult({
        type: TYPE_SUCCESS,
        successButtonText: I18n.t('done'),
        title: I18n.t('change_successfully'),
        message: I18n.t('change_pin_success_desc'),
        buttonClick: () => {
          setResult(null);
        },
      });
    } catch (error) {
      console.log('_changePinCode failed', error);
      setResult({
        type: TYPE_FAIL,
        error: error.message,
        title: I18n.t('change_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setInputPinCode(false);
    setLoading(false);
  };
  useEffect(() => {
    if (!inputPinCode) {
      setErrorMsg('');
    }
  }, [inputPinCode]);
  const _fetchSecurityQuestions = async () => {
    setLoading(true);
    try {
      const {
        question1,
        question2,
        question3,
      } = await Auth.getRestoreQuestions();

      navigate('VerifySecurityQuestion', {
        questions: [question1, question2, question3],
      });
    } catch (error) {
      console.log('_fetchSecurityQuestions failed', error);
      if (error.code == 703) {
        navigate('ForgotPinCode');
      } else {
        setResult({
          type: TYPE_FAIL,
          error: error.message,
          title: I18n.t('change_failed'),
          buttonClick: () => {
            setResult(null);
          },
        });
      }
    }
    setLoading(false);
  };
  return (
    <Container style={Styles.container}>
      <Headerbar transparent title={I18n.t('settings')} />
      <ScrollView contentContainerStyle={Styles.form} bounces={false}>
        <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
          {I18n.t('account')}
        </Text>
        <View style={[styles.listItem, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../assets/image/ic_avatar.png')}
              style={styles.image}
            />
            <View
              style={{
                flexDirection: 'column',
                marginLeft: 15,
                justifyContent: 'space-around',
              }}>
              {!!userState.realName && (
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={[Styles.input, Theme.fonts.default.regular]}>
                  {userState.realName}
                </Text>
              )}
              {!!userState.email && (
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={[
                    { fontSize: 12, opacity: 0.5 },
                    Theme.fonts.default.regular,
                  ]}>
                  {userState.email}
                </Text>
              )}
            </View>
          </View>

          <Text
            style={[
              Styles.tag,
              Theme.fonts.default.medium,
              {
                color: Theme.colors.background,
                fontSize: BADGE_FONT_SIZE,
                fontWeight: 'bold',
                backgroundColor: '#1bcba5',
                alignSelf: 'center',
              },
            ]}>
            {identity.provider}
          </Text>
        </View>

        <Text
          style={[
            Styles.secLabel,
            { marginTop: 15 },
            Theme.fonts.default.regular,
          ]}>
          {I18n.t('security')}
        </Text>
        <TouchableOpacity
          onPress={() => navigate('SetupSecurityQuestion')}
          style={styles.listItemVertical}>
          <Text style={[Styles.input, Theme.fonts.default.regular]}>
            {I18n.t('setup_security_questions_up')}
          </Text>
          <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>
            {I18n.t('setup_security_questions_desc')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={_goChangePinCode}
          style={styles.listItemVertical}>
          <Text style={Styles.input}>{I18n.t('change_pin_code_up')}</Text>
          <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>
            {I18n.t('change_pin_code_desc')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={_fetchSecurityQuestions}
          style={styles.listItemVertical}>
          <Text style={Styles.input}>{I18n.t('forgot_pin_code_title')}</Text>
          <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>
            {I18n.t('restore_pin_code_desc')}
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            Styles.secLabel,
            { marginTop: 15 },
            Theme.fonts.default.regular,
          ]}>
          {I18n.t('information')}
        </Text>
        {/*<TouchableOpacity onPress={() => {}} style={styles.listItemVertical}>*/}
        {/*  <Text style={[Styles.input, Theme.fonts.default.regular]}>*/}
        {/*    {I18n.t('wallet_service_endpoint')}*/}
        {/*  </Text>*/}
        {/*  <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>*/}
        {/*    {SERVICE_ENDPOINT}*/}
        {/*  </Text>*/}
        {/*</TouchableOpacity>*/}
        <View style={styles.listItemVertical}>
          <Text style={[Styles.input, Theme.fonts.default.regular]}>
            {I18n.t('version')}
          </Text>
          <Text
            style={[
              Styles.inputDesc,
              Theme.fonts.default.regular,
            ]}>{`${VersionNumber.appVersion} / ${VERSION_NAME} (${VERSION_CODE}) - ${BUILD_TYPE}`}</Text>
        </View>
        <TouchableOpacity
          style={{
            marginTop: 10,
            marginBottom: 40,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() =>
            setResult({
              type: TYPE_CONFIRM,
              title: I18n.t('sign_out_up'),
              message: I18n.t('sign_out_confirm_message'),
              successButtonText: I18n.t('sign_out_up'),
              secondaryConfig: {
                color: theme.colors.primary,
                text: I18n.t('cancel'),
                onClick: () => {
                  setResult(null);
                },
              },
              buttonClick: () => {
                setTimeout(() => {
                  dispatch(signOut(true));
                }, 0);
                setResult(null);
              },
            })
          }>
          <Text
            style={{
              color: theme.colors.error,
              fontSize: 16,
            }}>
            {I18n.t('sign_out')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <InputPinCodeModal
        isVisible={!!inputPinCode}
        message1={I18n.t('enter_the_current_pin_code')}
        title={I18n.t('change_pin_code_up')}
        onCancel={() => setInputPinCode(false)}
        loading={loading}
        onInputPinCode={_changePinCode}
        mode={'change'}
        errorMsg={errorMsg}
      />
      {loading && !inputPinCode && (
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
          successButtonText={result.successButtonText}
          type={result.type}
          message={result.message}
          errorMsg={result.error}
          onButtonClick={result.buttonClick}
          secondaryConfig={result.secondaryConfig}
        />
      )}
    </Container>
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
});

export default withTheme(SettingsScreen);
