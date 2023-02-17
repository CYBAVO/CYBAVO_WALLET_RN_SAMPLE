/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Auth } from '@cybavo/react-native-wallet-service';
import {
  AUTH_LOADING,
  AUTH_ERROR,
  AUTH_UPDATE_SIGN_IN_STATE,
  AUTH_UPDATE_IDENTITY,
  AUTH_UPDATE_DEV,
  AUTH_UPDATE_UI_FLAG,
  AUTH_UPDATE_GLOBAL_MODAL,
} from '../actions/auth';
import { COMMON_RESET } from '../actions/common';
const { SignInState } = Auth;

const defaultState = {
  loading: false,
  error: null,
  signInState: SignInState.UNKNOWN,
  justSignup: false,
  identity: {
    provider: null,
    name: '',
    email: '',
    avatar: '',
  },
};

function auth(state = defaultState, action) {
  switch (action.type) {
    case COMMON_RESET: {
      defaultState.option = state.option;
      defaultState.config = state.config;
      defaultState.endpoint = state.endpoint;
      return defaultState;
    }
    case AUTH_UPDATE_UI_FLAG:
      let nextState = state;
      if (action.justSignup != null) {
        nextState.justSignup = action.justSignup;
      }
      if (action.showSigninModal != null) {
        nextState.showSigninModal = action.showSigninModal;
      }
      return nextState;
    case AUTH_UPDATE_DEV:
      return {
        ...state,
        option: action.option,
        config: action.config,
        endpoint: action.endpoint,
      };
    case AUTH_UPDATE_GLOBAL_MODAL:
      return {
        ...state,
        globalModal: action.globalModal, // isShow, isNews
      };
    case AUTH_LOADING:
      return {
        ...state,
        loading: action.loading,
        error: null,
      };
    case AUTH_ERROR:
      return {
        ...state,
        error: action.error,
      };
    case AUTH_UPDATE_SIGN_IN_STATE:
      const { signInState = SignInState.UNKNOWN } = action;
      let o = {
        ...state,
        signInState: signInState,
        error: null,
      };
      return o;
    case AUTH_UPDATE_IDENTITY:
      const { provider, name, email, avatar } = action;
      return {
        ...state,
        identity: {
          ...state.identity,
          provider,
          name,
          email,
          avatar,
        },
      };
    default:
      return state;
  }
}

export default auth;
