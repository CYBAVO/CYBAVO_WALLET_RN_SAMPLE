/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { COMMON_RESET } from '../actions/common';
import {
  KYC_STATE_ERROR,
  KYC_STATE_LOADING,
  KYC_UPDATE_HAS_SETTING,
  KYC_UPDATE_USER_EXIST,
} from '../actions';

const defaultState = {
  loading: false,
  error: null,
  hasSetting: false,
  userExist: false,
};

function kyc(state = defaultState, action) {
  switch (action.type) {
    case COMMON_RESET:
      return defaultState;
    case KYC_STATE_LOADING:
      return {
        ...state,
        loading: action.loading,
        error: null,
      };
    case KYC_STATE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case KYC_UPDATE_HAS_SETTING:
      return {
        ...state,
        hasSetting: action.result == 1,
        loading: false,
        error: null,
      };
    case KYC_UPDATE_USER_EXIST:
      return {
        ...state,
        userExist: action.exist,
      };
    default:
      return state;
  }
}

export default kyc;
