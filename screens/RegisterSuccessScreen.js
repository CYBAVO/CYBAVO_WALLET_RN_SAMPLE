/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Container, Content } from 'native-base';
import {
  Auth,
  Wallets,
  NumericPinCodeInputView,
} from '@cybavo/react-native-wallet-service';
import {
  CHANGE_MODE,
  Coin,
  COOL_TIME,
  MIN_LEVEL,
  PIN_CODE_LENGTH,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
const { width, height } = Dimensions.get('window');
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import { withTheme, Text, IconButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import Headerbar from '../components/Headerbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import {
  AUTH_UPDATE_UI_FLAG,
  fetchCurrencyPricesIfNeed,
  fetchUserState,
  fetchWallets,
  signOut,
  startClock,
  stopClock,
} from '../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import RoundButton2 from '../components/RoundButton2';
import { useBackHandler, useLayout } from '@react-native-community/hooks';
import NavigationService from '../NavigationService';
import SmoothPinCodeInput from '../components/SmoothPinCodeInput';
import { useShakeAnimation } from '../utils/Hooks';
import AnimatedProgressButton from '../components/AnimatedProgressButton';
import { SvgXml } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { getSuccessSvg } from '../Helpers';

let RegisterSuccessScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { onLayout, ...layout } = useLayout();
  const setPin = useSelector(state => state.user.userState.setPin);

  return (
    <Container style={[{ flex: 1, backgroundColor: theme.colors.mask }]}>
      <Headerbar
        title={
          setPin
            ? I18n.t('register')
            : `${I18n.t('register')} - ${I18n.t('step', { num: 1 })}`
        }
        titleColor={theme.colors.text}
        style={{
          zIndex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 62,
          backgroundColor: theme.colors.navy,
        }}
        ParentIos={SafeAreaView}
        Parent={SafeAreaView}
        onBack={() => {
          setLoading(true);
          dispatch(signOut(false, true));
        }}
        backIcon={require('../assets/image/ic_cancel.png')}
      />
      <View
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'column',
          flex: 1,
          paddingHorizontal: 16,
          backgroundColor: theme.colors.navy,
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
          {I18n.t('register_success_main')}
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
          {setPin
            ? I18n.t('register_success_sub_final')
            : I18n.t('register_success_sub_setpin')}
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
            if (setPin) {
              NavigationService.navigate('Main');
            } else {
              NavigationService.navigate('SetupPin', { fromEnterPhone: true });
            }

            // dispatch(signOut(false, true));//DEV
          }}>
          {setPin ? I18n.t('start_using') : I18n.t('continue_to_reset_pin')}
        </RoundButton2>
      </View>
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
    </Container>
  );
};
export default withTheme(RegisterSuccessScreen);
