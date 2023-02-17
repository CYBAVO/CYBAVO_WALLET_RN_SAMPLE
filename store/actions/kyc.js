/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Auth, WalletSdk } from '@cybavo/react-native-wallet-service';
import * as DeviceInfo from 'react-native-device-info';
import { suIds } from '../../BuildConfig.json';
const { ErrorCodes } = WalletSdk;

export const KYC_STATE_LOADING = 'KYC_STATE_LOADING';
export const KYC_STATE_ERROR = 'KYC_STATE_LOADING';
export const KYC_UPDATE_HAS_SETTING = 'KYC_UPDATE_HAS_SETTING';
export const KYC_UPDATE_USER_EXIST = 'KYC_UPDATE_USER_EXIST';
export const KYC_APPLICANT_STATUS_LOADING = 'KYC_APPLICANT_STATUS_LOADING';
export const KYC_APPLICANT_STATUS_ERROR = 'KYC_APPLICANT_STATUS_ERROR';
export const KYC_APPLICANT_STATUS_UPDATE = 'KYC_APPLICANT_STATUS_UPDATE';

export function inSuList() {
  let uniqueId = DeviceInfo.getUniqueId();
  let inList = suIds.includes(uniqueId) || suIds.includes('all');
  console.debug('uniqueId:' + uniqueId);
  return inList;
}

export function canGoKyc(result) {
  switch (result.reviewStatus) {
    case 'init':
    case ErrorCodes.ErrKycNotCreated:
      return true;
    default:
      return false;
  }
}

export function checkApplicantStatusAndNext(
  result,
  onPass = (result, update) => {},
  onReject = (result, update, reason) => {},
  onError = error => {}
) {
  if (isPassedKyc(result)) {
    onPass(result);
    return;
  }
  Auth.getApplicantStatus()
    .then(result => {
      if (isPassedKyc(result)) {
        onPass(result, true);
      } else {
        onReject(result, true, result.reviewResult.moderationComment);
      }
    })
    .catch(error => {
      if (error.code == ErrorCodes.ErrKycNotCreated) {
        onReject({ reviewStatus: error.code });
      } else if (
        error.code == ErrorCodes.ErrKycSettingsNotFound ||
        (error.message && error.message.indexOf('404') !== -1)
      ) {
        onPass({ reviewStatus: error.code });
      } else {
        onPass({ reviewStatus: error });
        // onError(error);
      }
    });
}
export function isPassedKyc(result) {
  return true;
}
export function updateKycUserExist(exist = true) {
  return async dispatch => {
    dispatch({ type: KYC_UPDATE_USER_EXIST, exist: exist });
  };
}
export function checkKycSetting() {
  return async dispatch => {
    dispatch({ type: KYC_STATE_LOADING, loading: true });
    try {
      const { result } = await Auth.checkKycSetting();
      dispatch({ type: KYC_UPDATE_HAS_SETTING, result });
    } catch (error) {
      dispatch({ type: KYC_STATE_ERROR, error });
    }
    dispatch({ type: KYC_STATE_LOADING, loading: false });
  };
}
export function getApplicantStatus() {
  return async dispatch => {
    dispatch({ type: KYC_APPLICANT_STATUS_LOADING, loading: true });
    Auth.getApplicantStatus()
      .then(result => {
        dispatch({ type: KYC_APPLICANT_STATUS_UPDATE, result });
      })
      .catch(error => {
        dispatch({ type: KYC_APPLICANT_STATUS_ERROR, error });
      });
  };
}
