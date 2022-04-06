/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Wallets } from '@cybavo/react-native-wallet-service';
import { GET_MORE, GET_NEW, NOT_LOADING } from './transactions';
import { toastError } from '../../Helpers';
import { FileLogger } from 'react-native-file-logger';
import { WALLETCONNECT_UPDATE_API_VERSION } from './walletconnect';
import { ALL_WALLET_ID } from '../../Constants';
export const API_HISTORY_UPDATE = 'API_HISTORY_UPDATE';
export const API_HISTORY_ERROR = 'API_HISTORY_ERROR';
export const API_HISTORY_ENQUEUE = 'API_HISTORY_ENQUEUE';
function shouldFetchApiHistory(walletId, state) {
  if (
    state.apihistory.apihistory == null ||
    state.apihistory.apihistory[walletId] == null ||
    state.apihistory.apihistory[walletId].data == null
  ) {
    return true;
  }
  const apihistory = state.apihistory.apihistory[walletId];
  if (apihistory.loading != NOT_LOADING) {
    // already loading
    return false;
  }
}
export function walletconnectSync() {
  FileLogger.debug('>> walletconnectSync');
  return async (dispatch, getState) => {
    try {
      let result = await Wallets.walletConnectSync();
      FileLogger.debug(`walletconnectSync success:${JSON.stringify(result)}`);
      console.log('Wallets.walletconnectSync', result);
    } catch (error) {
      console.log('Wallets.walletconnectSync failed', error);
      FileLogger.debug(
        `walletconnectSync fail:${error.message}, ${getState().auth.config}`
      );
      toastError(error);
    }
  };
}
export function fetchApiHistory(
  refresh = true,
  start = 0,
  ethWalletId = false
) {
  return async (dispatch, getState) => {
    if (refresh) {
      dispatch(walletconnectSync());
    }

    if (!getState().wallets.ethWallet) {
      return;
    }
    let walletId =
      getState().walletconnect.apiVersion.ethWalletId || ethWalletId
        ? getState().wallets.ethWallet.walletId
        : ALL_WALLET_ID;
    if (!refresh && !shouldFetchApiHistory(ALL_WALLET_ID, getState())) {
      return;
    }
    dispatch({
      type: API_HISTORY_ENQUEUE,
      walletId: ALL_WALLET_ID,
      loading: start == 0 ? GET_NEW : GET_MORE,
    });
    try {
      const count = 10;
      FileLogger.debug(
        `>> getWalletConnectApiHistory,walletId:${walletId}, start:${start}, count:${count}`
      );
      const result = await Wallets.getWalletConnectApiHistory(
        walletId,
        start,
        count,
        {}
      );

      FileLogger.debug(
        `getWalletConnectApiHistory success:${JSON.stringify(result)}`
      );
      dispatch({
        type: API_HISTORY_UPDATE,
        data: result.apiHistoryItems,
        total: result.total,
        start,
        walletId: ALL_WALLET_ID,
      });
    } catch (error) {
      if (error.code == '304') {
        //Invalid Wallet ID
        dispatch(fetchApiHistory(refresh, start, true));
        dispatch({
          type: WALLETCONNECT_UPDATE_API_VERSION,
          apiVersion: { ethWalletId: true, signOptions: false },
        });
      }
      console.log('Wallets.fetchApiHistory failed', error);
      FileLogger.debug(`fetchApiHistory fail:${error.message}`);
      dispatch({ type: API_HISTORY_ERROR, error });
    }
    dispatch({ type: API_HISTORY_ENQUEUE, loading: false });
  };
}
