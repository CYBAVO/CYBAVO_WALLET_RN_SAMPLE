/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Wallets } from '@cybavo/react-native-wallet-service';
import { WALLETS_UPDATE_CURRENCIES } from './wallets';

export const CURRENCIES_LOADING = 'CURRENCIES_LOADING';
export const CURRENCIES_UPDATE_CURRENCIES = 'CURRENCIES_UPDATE_CURRENCIES';
export const CURRENCIES_ERROR = 'CURRENCIES_ERROR';

function shouldFetchCurrency(state) {
  return !state.currency.currencies && !state.currency.loading; // no currency and not loading
}
function shouldUpdateWalletCurrencyDisplayName(state) {
  return (
    state.currency.currencies &&
    state.wallets.wallets &&
    state.wallets.wallets.length > 0 &&
    !state.wallets.wallets[0].currencyDisplayName
  ); // no currency and not loading
}

export function fetchCurrenciesIfNeed() {
  return async (dispatch, getState) => {
    let state = getState();
    if (!state.currency.currencies) {
      if (!state.currency.loading) {
        return dispatch(fetchCurrencies());
      }
    } else if (
      state.wallets.wallets &&
      state.wallets.wallets.length > 0 &&
      !state.wallets.wallets[0].currencyDisplayName
    ) {
      dispatch({
        type: WALLETS_UPDATE_CURRENCIES,
        currencies: state.currency.currencies,
      });
    }
  };
}

function fetchCurrencies() {
  return async dispatch => {
    dispatch({ type: CURRENCIES_LOADING, loading: true });
    try {
      let { currencies } = await Wallets.getCurrencies();
      currencies = currencies.sort((a, b) => a.symbol.localeCompare(b.symbol));
      dispatch({ type: CURRENCIES_UPDATE_CURRENCIES, currencies });
    } catch (error) {
      console.warn('Wallets.getCurrencies failed', error);
      dispatch({ type: CURRENCIES_ERROR, error });
    }
    dispatch({ type: CURRENCIES_LOADING, loading: false });
  };
}
