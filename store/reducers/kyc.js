/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { COMMON_RESET } from '../actions/common';
import {
  KYC_APPLICANT_STATUS_ERROR,
  KYC_APPLICANT_STATUS_LOADING,
  KYC_APPLICANT_STATUS_UPDATE,
  KYC_STATE_ERROR,
  KYC_STATE_LOADING,
  KYC_UPDATE_HAS_SETTING,
  KYC_UPDATE_USER_EXIST,
} from '../actions';
import {
  ErrKycNotCreated,
  WalletSdk,
} from '@cybavo/react-native-wallet-service';
import { hasValue } from '../../Helpers';
const { ErrorCodes } = WalletSdk;

const defaultState = {
  loading: false,
  error: null,
  hasSetting: false,
  userExist: false,
  applicantStatus: {
    loading: false,
    result: null,
    error: null,
  },
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
    case KYC_APPLICANT_STATUS_LOADING:
      return {
        ...state,
        applicantStatus: {
          ...state.applicantStatus,
          loading: action.loading,
        },
      };
    case KYC_APPLICANT_STATUS_UPDATE:
      return {
        ...state,
        hasSetting: true,
        userExist: hasValue(action.result.reviewStatus),
        applicantStatus: {
          loading: false,
          result: action.result,
          error: null,
        },
      };
    case KYC_APPLICANT_STATUS_ERROR:
      try {
        let nextState = {
          ...state,
          applicantStatus: {
            ...state.applicantStatus,
            loading: false,
            error: action.error,
          },
        };
        if (ErrorCodes.ErrKycSettingsNotFound == action.error.code) {
          nextState.hasSetting = true;
          nextState.applicantStatus.error = action.error.code;
        } else if (ErrorCodes.ErrKycNotCreated == action.error.code) {
          nextState.userExist = false;
          nextState.applicantStatus.error = action.error.code;
        }
        return nextState;
      } catch (error) {
        return state;
      }
    default:
      return state;
  }
}

export default kyc;
