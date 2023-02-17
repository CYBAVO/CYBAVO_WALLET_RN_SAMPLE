import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SectionList,
  FlatList,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { Container, Content, Toast } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { WalletSdk, Auth } from '@cybavo/react-native-wallet-service';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n, {
  getLanguage,
  IndexLanguageMap,
  LanguageIndexMap,
  setLanguage,
} from '../i18n/i18n';
import { withTheme, Text, ActivityIndicator } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import {
  CHECK_ICON,
  LIST_ICON_SIMPLE_SIZE,
  LOCALES,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { signIn } from '../store/actions';
import { toast, toastError } from '../Helpers';
import { KycHelper } from '../utils/KycHelper';
const KycTestScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  return (
    <Container style={[Styles.container]}>
      <Headerbar
        transparent
        title={I18n.t('dev_test')}
        onBack={() => goBack()}
      />
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={styles.mainBt}
        disabled={loading}
        labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
        onPress={() => {
          navigate('GetUserHistory');
        }}>
        {I18n.t('api_get_user_history')}
      </RoundButton2>
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={styles.mainBt}
        disabled={loading}
        labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
        onPress={() => {
          navigate('ValidatePinCode');
        }}>
        {I18n.t('api_validate_pin_code')}
      </RoundButton2>
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={styles.mainBt}
        disabled={loading}
        labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
        onPress={() => {
          Auth.checkKycSetting()
            .then(r => {
              setLoading(false);
              toast(`result: ${r.result}`);
              console.log(`result:${r.result}`);
            })
            .catch(error => {
              toastError(error);
              setLoading(false);
            });
          setLoading(true);
        }}>
        {'Check KYC setting'}
      </RoundButton2>
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={styles.mainBt}
        disabled={loading}
        labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
        onPress={() => {
          Auth.createKyc('TWN')
            .then(r => {
              setLoading(false);
              toast('createKyc');
            })
            .catch(error => {
              toastError(error);
              setLoading(false);
            });
          setLoading(true);
        }}>
        {'Create KYC (TWN)'}
      </RoundButton2>
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={styles.mainBt}
        disabled={loading}
        labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
        onPress={() => {
          Auth.getKycAccessToken()
            .then(r => {
              setLoading(false);
              let log = `getKycAccessToken:${r.apiUrl}, ${r.token} ${r.flowName}`;
              toast(log);
              console.log(log);
              KycHelper.launchSNSMobileSDK(
                r.apiUrl,
                r.token,
                r.flowName,
                l => {
                  toast(l);
                },
                'zh-tw'
              );
            })
            .catch(error => {
              toastError(error);
              setLoading(false);
            });
          setLoading(true);
        }}>
        {'Get Access Token (tw)'}
      </RoundButton2>
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={styles.mainBt}
        disabled={loading}
        labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
        onPress={() => {
          Auth.getKycShareToken()
            .then(r => {
              setLoading(false);
              let log = `getKycShareToken:${r.token}, ${r.forClientId}`;
              toast(log);
              console.log(log);
            })
            .catch(error => {
              toastError(error);
              setLoading(false);
            });
          setLoading(true);
        }}>
        {'Get Share Token'}
      </RoundButton2>
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={styles.mainBt}
        disabled={loading}
        labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
        onPress={() => {
          Auth.getApplicantStatus()
            .then(r => {
              setLoading(false);
              let log = `getApplicantStatus:${JSON.stringify(r)}`;
              toast(log);
              console.log(log);
            })
            .catch(error => {
              toastError(error);
              setLoading(false);
            });
          setLoading(true);
        }}>
        {'Get Applicant Status'}
      </RoundButton2>
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
    paddingVertical: 10,
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
  listContainer: {
    marginHorizontal: 16,
    flexGrow: 1,
  },
  mainBt: { backgroundColor: 'white', marginTop: 40, marginHorizontal: 16 },
});

export default withTheme(KycTestScreen);
