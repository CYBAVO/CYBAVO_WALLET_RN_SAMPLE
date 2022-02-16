import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SectionList,
  RefreshControl,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { Container, Content, Toast } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import {
  Api,
  BADGE_FONT_SIZE,
  LOCALES,
  SERVICE_EMAIL,
  SERVICE_EMAIL_CYBAVO,
} from '../Constants';
import { WalletSdk, Auth, Wallets } from '@cybavo/react-native-wallet-service';
import { BIO_SETTING_USE_SMS, fetchUserState, signOut } from '../store/actions';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import { Button } from 'native-base';
import I18n, {
  getLanguage,
  IndexLanguageMap,
  LanguageIndexMap,
  setLanguage,
} from '../i18n/i18n';
import InputPinCodeModal from './InputPinCodeModal';
import { withTheme, Text, ActivityIndicator } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import VersionNumber from 'react-native-version-number';
import {
  checkCameraPermission,
  effectiveBalance,
  getWalletKeyByWallet,
  inDevList,
  sendLogFilesByEmail,
} from '../Helpers';
import BottomActionMenu from '../components/BottomActionMenu';
import NavigationService from '../NavigationService';
import AssetPicker from '../components/AssetPicker';
import BackgroundImage from '../components/BackgroundImage';
const {
  sdkInfo: { VERSION_NAME, VERSION_CODE, BUILD_TYPE },
} = WalletSdk;
const SettingsScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const [inputPinCode, setInputPinCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(I18n.t('pin_secret_not_found'));
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const userState = useSelector(state => state.user.userState);
  const identity = useSelector(state => state.auth.identity);
  const [languageIndex, setLanguageIndex] = useState(0);

  const reportable = useSelector(state => {
    return state.walletconnect.reportable;
  });
  const hasConnection = useSelector(state => {
    return Object.keys(state.walletconnect.connecting).length > 0;
  });

  const enableWalletconnect = useSelector(state => {
    console.debug(
      `enableWalletconnect:${state.user.userState.enableWalletconnect}`
    );
    return state.user.userState.enableWalletconnect;
  });

  const bioSetting = useSelector(state => state.user.userState.bioSetting);
  const enableBiometrics = useSelector(
    state => state.user.userState.enableBiometrics
  );
  const skipSmsVerify = useSelector(
    state => state.user.userState.skipSmsVerify
  );

  const accountSkipSmsVerify = useSelector(
    state => state.user.userState.accountSkipSmsVerify
  );
  const [bioSettingSub, setBioSettingSub] = useState('pin');
  const [bioSettingEditable, setBioSettingEditable] = useState(false);

  const hasApiHistory = useSelector(state => {
    let hasApiHistory = false;
    try {
      let apihistoryMap =
        state.apihistory.apihistory[state.wallets.ethWallet.walletId].data;
      let arr = Object.values(apihistoryMap);
      if (arr.length > 0) {
        hasApiHistory = true;
      }
    } catch (error) {
      console.debug(error);
    }
    return hasApiHistory;
  });

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
        error: I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        }),
        title: I18n.t('change_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setInputPinCode(false);
    setLoading(false);
  };

  const _getLanguageIndexFromStorage = () => {
    getLanguage()
      .then(lan => {
        if (!lan) {
          lan = 'en';
        }
        setLanguageIndex(LanguageIndexMap[lan] || 0);
      })
      .catch(error => {});
  };

  useEffect(() => {
    _getLanguageIndexFromStorage();
  }, []);

  useEffect(() => {
    _checkBioInfo();
  }, [bioSetting, skipSmsVerify, enableBiometrics, accountSkipSmsVerify]);
  const _checkBioInfo = async () => {
    if (!enableBiometrics || skipSmsVerify) {
      setBioSettingSub('pin');
      setBioSettingEditable(false);
      return;
    }
    // let { exist } = await Wallets.isBioKeyExist();
    let { biometricsType } = await Wallets.getBiometricsType();
    if (biometricsType != Wallets.BiometricsType.NONE) {
      let isInDevList = inDevList();
      if (isInDevList) {
        setBioSettingEditable(true);
      }
      if (bioSetting == BIO_SETTING_USE_SMS) {
        setBioSettingSub('pin_sms');
      } else {
        setBioSettingSub('pin_bio');
      }
    } else {
      if (accountSkipSmsVerify) {
        setBioSettingSub('error_not_support_bio_but_account_skip_sms');
        setBioSettingEditable(false);
        return;
      }
      setBioSettingEditable(false);
      setBioSettingSub('pin_sms');
    }
  };
  useEffect(() => {
    if (!inputPinCode) {
      setErrorMsg('');
    }
  }, [inputPinCode]);
  const _onBioSettingPress = () => {
    console.debug('eee_bioSettingEditable');
    navigate('SetBio', { key: bioSettingSub });
  };
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
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
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
      <ScrollView
        contentContainerStyle={Styles.form}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              dispatch(fetchUserState());
              setRefreshing(false);
            }}
          />
        }>
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
                borderRadius: 12,
                color: Theme.colors.background,
                fontSize: BADGE_FONT_SIZE,
                fontWeight: 'bold',
                backgroundColor: theme.colors.primary,
                alignSelf: 'center',
              },
            ]}>
            {identity.provider}
          </Text>
        </View>

        {enableWalletconnect && (
          <View style={[styles.listItem, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../assets/image/ic_setting_walletconnnect.png')}
                style={styles.image}
              />
              <View
                style={{
                  flexDirection: 'column',
                  marginLeft: 15,
                  justifyContent: 'center',
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={[
                    Styles.input,
                    { flex: 0 },
                    Theme.fonts.default.regular,
                  ]}>
                  {I18n.t('walletconnect')}
                </Text>
              </View>
            </View>
            <Button
              iconRight
              rounded
              small
              onPress={async () => {
                if (await checkCameraPermission()) {
                  NavigationService.navigate('scanModal', {
                    modal: true,
                  });
                }
              }}
              style={{
                backgroundColor: theme.colors.pickerBg,
                // flex: 1,
                padding: 11,
              }}>
              <Text
                style={[
                  Theme.fonts.default.medium,
                  {
                    color: Theme.colors.primary,
                    fontSize: 14,
                    alignSelf: 'center',
                  },
                ]}>
                {I18n.t('connect')}
              </Text>
            </Button>
          </View>
        )}
        <Text
          style={[
            Styles.secLabel,
            { marginTop: 15 },
            Theme.fonts.default.regular,
          ]}>
          {I18n.t('general')}
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigate('SetLocale', {
              index: languageIndex,
              onChange: i => {
                setLanguageIndex(i);
              },
            });
          }}
          style={[
            styles.listItemHorizontal,
            { justifyContent: 'space-between' },
          ]}>
          <Text style={[Styles.input, Theme.fonts.default.regular]}>
            {I18n.t('language')}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text
              style={[
                Styles.inputDesc,
                { flex: 0, fontSize: 14 },
                Theme.fonts.default.regular,
              ]}>
              {LOCALES[languageIndex]}
            </Text>
            <Image
              source={require('../assets/image/ic_arrow_right_gray.png')}
            />
          </View>
        </TouchableOpacity>
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
          style={styles.listItemHorizontal}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={[Styles.input, Theme.fonts.default.regular]}>
              {I18n.t('setup_security_questions_up')}
            </Text>
            <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>
              {I18n.t('setup_security_questions_desc')}
            </Text>
          </View>
          <Image source={require('../assets/image/ic_arrow_right_gray.png')} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={_goChangePinCode}
          style={styles.listItemHorizontal}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={Styles.input}>{I18n.t('change_pin_code_up')}</Text>
            <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>
              {I18n.t('change_pin_code_desc')}
            </Text>
          </View>
          <Image source={require('../assets/image/ic_arrow_right_gray.png')} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={_fetchSecurityQuestions}
          style={styles.listItemHorizontal}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={Styles.input}>{I18n.t('forgot_pin_code_title')}</Text>
            <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>
              {I18n.t('restore_pin_code_desc')}
            </Text>
          </View>
          <Image source={require('../assets/image/ic_arrow_right_gray.png')} />
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!bioSettingEditable}
          onPress={_onBioSettingPress}
          style={styles.listItemHorizontal}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={Styles.input}>
              {I18n.t('transaction_auth_method')}
            </Text>
            <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>
              {I18n.t(bioSettingSub)}
            </Text>
          </View>
          {bioSettingEditable && (
            <Image
              source={require('../assets/image/ic_arrow_right_gray.png')}
            />
          )}
        </TouchableOpacity>
        <Text
          style={[
            Styles.secLabel,
            { marginTop: 15 },
            Theme.fonts.default.regular,
          ]}>
          {I18n.t('information')}
        </Text>
        {enableWalletconnect && (reportable || hasApiHistory || hasConnection) && (
          <TouchableOpacity
            onPress={() => {
              sendLogFilesByEmail(
                SERVICE_EMAIL_CYBAVO,
                `${I18n.t('report_issue')} - ${I18n.t('app_name')}`
              ),
                I18n.t('issue_description_template');
            }}
            style={styles.listItemHorizontal}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={[Styles.input, Theme.fonts.default.regular]}>
                {I18n.t('report_issue')}
              </Text>
              <Text style={[Styles.inputDesc, Theme.fonts.default.regular]}>
                {I18n.t('report_issue_desc')}
              </Text>
            </View>
            <Image
              source={require('../assets/image/ic_arrow_right_gray.png')}
            />
          </TouchableOpacity>
        )}
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
            marginTop: 24,
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
  listItemHorizontal: {
    minHeight: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
    paddingRight: 0,
  },
  image: {
    width: 36,
    height: 36,
  },
});

export default withTheme(SettingsScreen);
