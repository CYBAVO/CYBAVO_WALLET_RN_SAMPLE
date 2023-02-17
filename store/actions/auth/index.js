/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { WalletSdk, Auth, Wallets } from '@cybavo/react-native-wallet-service';
import NavigationService from '../../../NavigationService';
import { COMMON_RESET } from '../common';
import Google from './providers/google';
import WeChat from './providers/wechat';
import Facebook from './providers/facebook';
import LINE from './providers/LINE';
import Apple from './providers/apple';
import Twitter from './providers/Twitter';
import iid from '@react-native-firebase/iid';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  checkWalletConnectUri,
  hasValue,
  sleep,
  toast,
  toastError,
} from '../../../Helpers';

import I18n, {
  getLanguage,
  LanguageIndexMap,
  setLanguage,
} from '../../../i18n/i18n';
import * as DeviceInfo from 'react-native-device-info';
import {
  killAllSession,
  newSession,
  WALLETCONNECT_PENDING_URI,
} from '../walletconnect';
import { DeviceEventEmitter, Linking, Platform, StatusBar } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-community/async-storage';
import { fetchUserState, USER_UPDATE_USER_STATE } from '../user';
import { CURRENCIES_ERROR, CURRENCIES_UPDATE_CURRENCIES } from '../currency';
import {
  checkKycSetting,
  getApplicantStatus,
  isPassedKyc,
  KYC_APPLICANT_STATUS_ERROR,
  KYC_APPLICANT_STATUS_UPDATE,
} from '../kyc';

const { ErrorCodes } = WalletSdk;

// AUTH
export const AUTH_LOADING = 'AUTH_LOADING';
export const AUTH_ERROR = 'AUTH_ERROR';
export const AUTH_UPDATE_DEV = 'AUTH_UPDATE_DEV';
export const AUTH_UPDATE_GLOBAL_MODAL = 'AUTH_UPDATE_GLOBAL_MODAL';
export const AUTH_UPDATE_ANIMATE = 'AUTH_UPDATE_ANIMATE';
export const AUTH_UPDATE_SIGN_IN_STATE = 'AUTH_UPDATE_SIGN_IN_STATE';
export const AUTH_UPDATE_IDENTITY = 'AUTH_UPDATE_IDENTITY';
export const AUTH_UPDATE_UI_FLAG = 'AUTH_UPDATE_UI_FLAG';
export const SHOWED_GUIDE = 'showed_guide';
export const SKIP_NEWS = 'skip_news';
export const DONT_SHOW_WC_DISCLAIMER = 'dont_show_wc_disclaimer';
export const CONFIG_QR_CODE = 'config_qr_code';

async function signInWithToken(idToken, identityProvider, extras) {
  console.log('signInWithToken... ', extras.user_id);
  const resp = await Auth.signIn(idToken, identityProvider, extras);
  console.log('signInWithToken... Done', resp);
  return resp;
}

async function signUpWithToken(idToken, identityProvider, extras) {
  console.log('signUpWithToken... ', identityProvider);
  const resp = await Auth.signUp(idToken, identityProvider, extras);
  console.log('signInWithToken... Done', resp);
  return resp;
}
export function setPushDeviceToken() {
  return async (dispatch, getState) => {
    const token = await iid().getToken();
    console.log('setPushDeviceToken from asyncStorage... ', token);
    const resp = await Auth.setPushDeviceToken(token);
    console.log('setPushDeviceToken from asyncStorage... Done', resp);
    return resp;
  };
}
export function registerPubkey() {
  return async (dispatch, getState) => {
    try {
      let { exist } = await Wallets.isBioKeyExist();
      let { biometricsType } = await Wallets.getBiometricsType();
      console.debug(`exist:${exist}, biometricsType:${biometricsType}`);
      if (/*exist &&*/ biometricsType == Wallets.BiometricsType.NONE) {
        console.debug('updateDeviceInfo');
        await Wallets.updateDeviceInfo(); //NONE
      } else if (/*!exist && */ biometricsType != Wallets.BiometricsType.NONE) {
        console.debug('updateDeviceInfo');
        await Wallets.updateDeviceInfo(); //not null
        console.debug('registerPubkey');
        await Wallets.registerPubkey();
      }
    } catch (error) {
      toastError(error);
      console.debug('registerPubkey pack fail', error);
    }
  };
}

export function setSkipNews(value) {
  AsyncStorage.setItem(SKIP_NEWS, value)
    .then(() => {
      console.debug('set SKIP_NEWS:' + value);
    })
    .catch(error => {
      console.debug('set SKIP_NEWS err:' + error);
    });
}

export function getSkipNews() {
  return AsyncStorage.getItem(SKIP_NEWS);
}
function updateSignInState(signInState) {
  console.log('updateSignInState:', signInState);
  return async (dispatch, getState) => {
    await dispatch({ type: AUTH_UPDATE_SIGN_IN_STATE, signInState });
    if (signInState === Auth.SignInState.UNKNOWN) {
      NavigationService.navigate('Init');
    } else if (signInState === Auth.SignInState.SIGNED_IN) {
      let routeName = 'Main';
      let userState = getState().user.userState;
      if (userState.setPin == undefined) {
        try {
          const { userState } = await Auth.getUserState();
          if (userState.setPin === false) {
            routeName = 'SetupPin';
          }
        } catch (error) {}
      } else {
        routeName = userState.setPin === true ? 'Main' : 'SetupPin';
      }
      if (false) {
        routeName = 'SetupPin';
      }
      if (routeName == 'Main') {
        try {
          let result = ''; //await Auth.getApplicantStatus();
          if (!isPassedKyc(result)) {
            NavigationService.navigate('KycAlert');
            dispatch({ type: KYC_APPLICANT_STATUS_UPDATE, result });
            dispatch(setPushDeviceToken());
            dispatch(registerPubkey());
            // dispatch(checkKycSetting());
            return;
          }
        } catch (error) {
          dispatch({ type: KYC_APPLICANT_STATUS_ERROR, error });
          if (error.code == ErrorCodes.ErrKycNotCreated) {
            NavigationService.navigate('KycAlert');
            dispatch(setPushDeviceToken());
            dispatch(registerPubkey());
            dispatch(checkKycSetting());
            return;
          }
        }
      }
      try {
        let { currencies } = await Wallets.getCurrencies();
        currencies = currencies || [];
        currencies = currencies.sort((a, b) =>
          a.symbol.localeCompare(b.symbol)
        );
        dispatch({ type: CURRENCIES_UPDATE_CURRENCIES, currencies });
        // NavigationService.navigate('EnterPhone', { step: 0 }); //SMS_SETUP_PHONE_OTP
        NavigationService.navigate(routeName);
        dispatch(setPushDeviceToken());
        dispatch(registerPubkey());
        dispatch(checkKycSetting());
      } catch (error) {
        console.warn('Wallets.getCurrencies failed', error);
        dispatch({ type: CURRENCIES_ERROR, error });
        if (error.code != 186 && error.code != 180) {
          NavigationService.navigate(routeName);
        }
      }
    } else if (signInState === Auth.SignInState.SESSION_EXPIRED) {
      NavigationService.navigate('Loading', {
        sessionExpire: true,
      });
    } else if (signInState === Auth.SignInState.NEED_VERIFY_OTP) {
      await sleep(1000);
      let state = getState().user.userState || {};
      let countryCode = state.countryCode;
      let phone = state.phone;
      if (!countryCode || !phone) {
        try {
          await sleep(3000); // prevent ErrOperationTooFrequent
          const { userState } = await Auth.getUserState();
          countryCode = userState.countryCode;
          phone = userState.phone;
          dispatch({ type: USER_UPDATE_USER_STATE, userState });
        } catch (error) {
          countryCode = '';
          phone = '';
          console.debug('getUserState fail', error);
          dispatch(fetchUserState());
        }
      }
      NavigationService.navigate('VerifyOtp', {
        step: 1,
        type: Wallets.OtpType.SMS_LOGIN_OTP,
        countryCode: countryCode,
        phone: phone,
      });
    } else if (signInState === Auth.SignInState.NEED_REGISTER_PHONE) {
      let state = getState().user.userState;
      if (state == null || state.setPin == null) {
        dispatch(fetchUserState());
      }
      NavigationService.navigate('EnterPhone', {
        step: Wallets.OtpType.SMS_SETUP_PHONE_OTP,
      });
    } else if (signInState === Auth.SignInState.SIGNED_OUT) {
      if (getState().auth.showSigninModal) {
        dispatch({ type: AUTH_UPDATE_UI_FLAG, showSigninModal: false });
        NavigationService.navigate('SignIn', { modal: Date.now() });
      } else {
        NavigationService.navigate('SignIn', {});
      }
      dispatch({ type: COMMON_RESET });
    } else {
      // SESSION_INVALID
      NavigationService.navigate('Loading', {
        sessionExpire: true,
        sdkSignOut: false,
      });
    }
  };
}
const IDENTITY_PROVIDERS = {
  Google: Google,
  WeChat: WeChat,
  Facebook: Facebook,
  LINE: LINE,
  Apple: Apple,
  Twitter: Twitter,
};

export function signIn(identityProvider) {
  return async dispatch => {
    const idProvider = IDENTITY_PROVIDERS[identityProvider];
    console.log('signIn...', idProvider);
    dispatch({ type: AUTH_LOADING, loading: true });
    let userToken;
    const identity = {
      provider: identityProvider,
      name: '',
      email: '',
      avatar: '',
      secret: '',
    };
    try {
      console.log('auth.signIn...');
      const {
        idToken,
        name,
        email,
        avatar,
        secret,
      } = await idProvider.signIn();
      identity.name = name;
      identity.email = email;
      identity.avatar = avatar;
      identity.secret = secret;
      console.log('auth.signIn...', idToken);
      userToken = idToken;
      // dispatch({ type: AUTH_UPDATE_JUST_SIGNUP, justSignup: true});
      // NavigationService.navigate('SetupPin');
      console.log('signInWithToken...');
      await signInWithToken(
        userToken,
        identityProvider,
        secret ? { id_token_secret: secret } : {}
      );
      dispatch({
        type: AUTH_UPDATE_IDENTITY,
        ...identity,
      });
      // dispatch(getApplicantStatus());
      dispatch(fetchUserState());
      console.log('signInWithToken... Done');
    } catch (error) {
      console.log('signIn failed', error);
      if (ErrorCodes.ErrRegistrationRequired === error.code) {
        // signUp needed
        try {
          // dispatch({ type: AUTH_UPDATE_UI_FLAG, justSignup: true});
          // NavigationService.navigate('SetupPin');
          console.log('signUpWithToken...');
          await signUpWithToken(userToken, identityProvider, {
            id_token_secret: identity.secret,
            user_name: !hasValue(identity.name)
              ? await DeviceInfo.getDeviceName()
              : identity.name, //Required for Apple Auth. Optional for other services
          });
          console.log('signUpWithToken... Done');
          console.log('signInWithToken#2...');
          await signInWithToken(
            userToken,
            identityProvider,
            identity.secret ? { id_token_secret: identity.secret } : {}
          );
          dispatch({
            type: AUTH_UPDATE_IDENTITY,
            ...identity,
          });
          console.log('signInWithToken#2... Done');
        } catch (error) {
          console.log('signUp - signIn failed', error);
          await idProvider.signOut();
          dispatch({ type: AUTH_ERROR, error });
        }
      } else {
        console.log('signIn failed', error.message);
        console.log('auth.signOut...');
        await idProvider.signOut();
        console.log('auth.signOut... Done');
        dispatch({ type: AUTH_ERROR, error });
      }
    }
    dispatch({ type: AUTH_LOADING, loading: false });
    console.log('signIn... Done');
  };
}

export function signOut(goLoading = true, sdkSignOut = true) {
  return async (dispatch, getState) => {
    dispatch(killAllSession('signOut'));
    dispatch({ type: AUTH_UPDATE_UI_FLAG, justSignup: false });
    if (goLoading) {
      NavigationService.navigate('Loading');
    }
    const identityProvider = getState().auth.identity.provider;
    dispatch({ type: AUTH_LOADING, loading: true });
    if (sdkSignOut) {
      // ++sign out sdk++
      console.log('Auth.signOut...');
      try {
        await Auth.signOut();
      } catch (error) {
        console.debug('Auth.signOut... Fail');
      }
      console.log('Auth.signOut... Done');
      // ++sign out idProvider++
      const idProvider = IDENTITY_PROVIDERS[identityProvider];
      console.log('idProvider.signOut...', idProvider);
      if (idProvider) {
        await idProvider.signOut();
      }
      console.log('idProvider.signOut... Done');
      dispatch({ type: AUTH_LOADING, loading: false });
    } else {
      //++ sign out idProvider++
      const idProvider = IDENTITY_PROVIDERS[identityProvider];
      console.log('idProvider.signOut...', idProvider);
      if (idProvider) {
        await idProvider.signOut();
      }
      console.log('idProvider.signOut... Done');
      dispatch({ type: AUTH_LOADING, loading: false });
      // ++reset status++
      NavigationService.navigate('Auth');
      dispatch({ type: COMMON_RESET });
    }
  };
}
let listener;

function actualHandleWalletConnectUri(state, dispatch, uri, type) {
  console.log('onWalletConnectUri_' + uri);
  let result = checkWalletConnectUri(uri);
  if (!result.valid || result !== 1) {
    return;
  }

  Auth.getApplicantStatus()
    .then(result => {
      if (!isPassedKyc(result)) {
        NavigationService.navigate('KycAlert');
      } else {
        handleWaclletConnectUri(state, dispatch, uri, type);
      }
    })
    .catch(error => {
      if (error.code == ErrorCodes.ErrKycNotCreated) {
        NavigationService.navigate('KycAlert');
      } else {
        handleWaclletConnectUri(state, dispatch, uri, type);
      }
    });
}
function handleWaclletConnectUri(state, dispatch, uri, type) {
  if (state.auth.signInState === Auth.SignInState.SIGNED_IN) {
    if (type == 'onNewIntent') {
      let ethWallet = state.wallets.ethWallet;
      if (ethWallet) {
        NavigationService.navigate('Connecting', {});
        dispatch(newSession(uri, result.address, result.chainId, ethWallet));
      } else {
        toast(I18n.t('no_eth_wallet_prompt'));
      }
    } else {
      dispatch({ type: WALLETCONNECT_PENDING_URI, uri: result.uri });
    }
  } else {
    dispatch({ type: WALLETCONNECT_PENDING_URI, uri: result.uri });
    toast(I18n.t('signin_prompt'));
  }
}
function getTrimmedWcUri(str) {
  if (!str) {
    return '';
  }
  str = decodeURIComponent(str);
  let i = str.indexOf('wc:');
  return str.substr(i, str.length);
}

export function removeListener() {
  if (listener) {
    DeviceEventEmitter.removeListener(listener);
  }
}
function getLocal() {
  getLanguage()
    .then(lan => {
      if (!lan) {
        let arr = RNLocalize.getLocales();
        lan = 'en';
        if (arr && arr.length > 0) {
          if (LanguageIndexMap[arr[0].languageTag]) {
            lan = arr[0].languageTag;
          }
        }
      }
      setLanguage(lan);
    })
    .catch(error => {});
}

export function initLocale() {
  return async (dispatch, getState) => {
    let locale = getLocal();
    console.debug(locale);
  };
}
export function initListener() {
  return async (dispatch, getState) => {
    if (Platform.OS == 'ios') {
      const url = await Linking.getInitialURL();
      if (url) {
        actualHandleWalletConnectUri(
          getState(),
          dispatch,
          getTrimmedWcUri(url),
          'onCreate'
        );
      }

      const handleUrlIOS = evt => {
        actualHandleWalletConnectUri(
          getState(),
          dispatch,
          getTrimmedWcUri(evt.url),
          'onNewIntent'
        );
      };
      Linking.addEventListener('url', handleUrlIOS);
      return;
    }
    listener = DeviceEventEmitter.addListener(
      'onWalletConnectUri',
      ({ uri, type }) => {
        actualHandleWalletConnectUri(getState(), dispatch, uri, type);
      }
    );
  };
}
export function initAuth() {
  return async (dispatch, getState) => {
    dispatch({ type: AUTH_LOADING, loading: true });
    // console.log(
    //   '1updateSignInState:',
    //   signInState + ',' + getState().auth.justSignup
    // );
    try {
      const signInState = await Auth.getSignInState();
      dispatch(updateSignInState(signInState));
      dispatch({ type: AUTH_LOADING, loading: false });
      // register event listener
      Auth.addListener(Auth.Events.onSignInStateChanged, signInState => {
        console.log(
          'updateSignInState:',
          signInState + ',' + getState().auth.justSignup
        );
        dispatch(updateSignInState(signInState));
        // if (signInState === Auth.SignInState.SIGNED_IN) {
        // }
      });
    } catch (error) {
      console.debug('eee_' + error);
    }
  };
}
