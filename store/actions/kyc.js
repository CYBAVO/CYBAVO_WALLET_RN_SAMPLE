/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Auth, Wallets } from '@cybavo/react-native-wallet-service';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from 'react-native-i18n';

export const KYC_STATE_LOADING = 'KYC_STATE_LOADING';
export const KYC_STATE_ERROR = 'KYC_STATE_LOADING';
export const KYC_UPDATE_HAS_SETTING = 'KYC_UPDATE_HAS_SETTING';
export const KYC_UPDATE_USER_EXIST = 'KYC_UPDATE_USER_EXIST';

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
