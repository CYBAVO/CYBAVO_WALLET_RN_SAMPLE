/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Wallets } from '@cybavo/react-native-wallet-service';

export const FEE_LOADING = 'FEE_LOADING';
export const FEE_UPDATE = 'FEE_UPDATE';
export const FEE_ERROR = 'FEE_ERROR';

let intervalId = 0;

export function startFetchFee(currency) {
  return async (dispatch, getState) => {
    if (intervalId) {
      return;
    }
    dispatch(fetchFee(currency));
    intervalId = setInterval(() => {
      dispatch(fetchFee(currency));
    }, 30000);
  };
}
export function stopFetchFee() {
  return async (dispatch, getState) => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = 0;
    }
  };
}
export function fetchFee(currency) {
  return async (dispatch, getState) => {
    if (getState().fee.fee[currency].loading) {
      return;
    }
    dispatch({ type: FEE_LOADING, currency, loading: true });
    try {
      const rawFee = await Wallets.getTransactionFee(currency);
      dispatch({ type: FEE_UPDATE, currency, rawFee });
    } catch (error) {
      console.warn('Wallets.getTransactionFee failed', error);
      dispatch({ type: FEE_ERROR, currency, error });
    }
  };
}
