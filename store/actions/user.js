/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Auth, Wallets } from '@cybavo/react-native-wallet-service';

export const USER_STATE_LOADING = 'USER_STATE_LOADING';
export const USER_STATE_ERROR = 'USER_STATE_ERROR';
export const USER_UPDATE_USER_STATE = 'USER_UPDATE_USER_STATE';
export const USER_UPDATE_BIO_SETTING = 'USER_UPDATE_BIO_SETTING';
export const BIO_SETTING_USE_SMS = 1;
export const BIO_SETTING_USE_BIO = 2;

export function updateBioSetting(value) {
  return async dispatch => {
    dispatch({ type: USER_UPDATE_BIO_SETTING, bioSetting: value });
    if (value == BIO_SETTING_USE_BIO) {
      Wallets.updateDeviceInfo()
        .then(() => {})
        .catch(error => {
          console.debug('updateBioSetting to bio updateDeviceInfo fail', error);
        });
    }
  };
}
export function fetchUserState() {
  return async dispatch => {
    dispatch({ type: USER_STATE_LOADING, loading: true });
    try {
      const { userState } = await Auth.getUserState();
      dispatch({ type: USER_UPDATE_USER_STATE, userState });
    } catch (error) {
      dispatch({ type: USER_STATE_ERROR, error });
    }
    dispatch({ type: USER_STATE_LOADING, loading: false });
  };
}
