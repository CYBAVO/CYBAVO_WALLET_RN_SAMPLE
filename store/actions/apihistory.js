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
export function fetchApiHistory(refresh = true, start = 0, filters) {
  return async (dispatch, getState) => {
    if (refresh) {
      dispatch(walletconnectSync());
    }

    if (!getState().wallets.ethWallet) {
      return;
    }
    let walletId = getState().wallets.ethWallet.walletId;
    if (!refresh && !shouldFetchApiHistory(walletId, getState())) {
      return;
    }
    dispatch({
      type: API_HISTORY_ENQUEUE,
      walletId,
      loading: start == 0 ? GET_NEW : GET_MORE,
    });
    try {
      const count = 10;
      FileLogger.debug(
        `>> getWalletConnectApiHistory,walletId:${walletId}, start:${start}, count:${count}, filters:${filters}`
      );
      const result = await Wallets.getWalletConnectApiHistory(
        walletId,
        start,
        count,
        filters
      );

      FileLogger.debug(
        `getWalletConnectApiHistory success:${JSON.stringify(result)}`
      );
      dispatch({
        type: API_HISTORY_UPDATE,
        data: result.apiHistoryItems,
        total: result.total,
        start,
        walletId,
      });
    } catch (error) {
      console.log('Wallets.fetchApiHistory failed', error);
      FileLogger.debug(`fetchApiHistory fail:${error.message}`);
      dispatch({ type: API_HISTORY_ERROR, error });
    }
    dispatch({ type: API_HISTORY_ENQUEUE, loading: false });
  };
}
