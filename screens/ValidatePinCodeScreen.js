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
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { signIn } from '../store/actions';
import { toast, toastError } from '../Helpers';
import { KycHelper } from '../utils/KycHelper';
import InputMessageModal from '../components/InputMessageModal';
import NavigationService from "../NavigationService";
const ValidatePinCodeScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const _onPin = pinSecret => {
    setLoading(true);
    Auth.validatePinCode(pinSecret)
      .then(result => {
        setLoading(false);
        setResult({
          type: TYPE_SUCCESS,
          title: I18n.t('api_validate_pin_code'),
          message: `pass: ${result.pass}`,
          buttonClick: () => {
            setResult(null);
          },
        });
      })
      .catch(error => {
        setResult({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t('api_validate_pin_code'),
          buttonClick: () => {
            setResult(null);
          },
        });
        setLoading(false);
      });
  };
  return (
    <Container style={[Styles.container]}>
      <Headerbar
        transparent
        title={I18n.t('api_validate_pin_code')}
        onBack={() => goBack()}
      />

      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={[
          {
            marginTop: 32,
            backgroundColor: theme.colors.primary,
            marginHorizontal: 16,
          },
        ]}
        disabledStyle={{ backgroundColor: theme.colors.primaryDisabled }}
        disabled={loading}
        labelStyle={[
          { color: theme.colors.text, fontSize: ROUND_BUTTON_FONT_SIZE },
        ]}
        onPress={() => {
          setShowInputModal(true);
        }}>
        {I18n.t('pincode')}
      </RoundButton2>
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={[
          {
            marginTop: 24,
            backgroundColor: theme.colors.primary,
            marginHorizontal: 16,
          },
        ]}
        disabledStyle={{ backgroundColor: theme.colors.primaryDisabled }}
        disabled={loading}
        labelStyle={[
          { color: theme.colors.text, fontSize: ROUND_BUTTON_FONT_SIZE },
        ]}
        onPress={() => {
          NavigationService.navigate('InputPinSms', {
            modal: true,
            from: 'ValidatePinCode',
            isSms: false,
            callback: (pinSecret, type, actionToken, code) => {
              _onPin(pinSecret);
            },
          });
        }}>
        {I18n.t('pinsecret')}
      </RoundButton2>
      {showInputModal && (
        <InputMessageModal
          title={I18n.t('input_pin')}
          visible={showInputModal}
          loading={false}
          maxLength={6}
          keyboardType={'number-pad'}
          value={''}
          onConfirm={pinCode => {
            _onPin(pinCode);
            setShowInputModal(false);
          }}
          onCancel={() => {
            setShowInputModal(false);
          }}
        />
      )}
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
});

export default withTheme(ValidatePinCodeScreen);
