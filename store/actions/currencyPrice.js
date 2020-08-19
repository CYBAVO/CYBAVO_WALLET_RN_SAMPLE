/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Wallets } from '@cybavo/react-native-wallet-service';

export const CURRENCY_PRICE_LOADING = 'CURRENCY_PRICE_LOADING';
export const CURRENCY_PRICE_UPDATE = 'CURRENCY_PRICE_UPDATE';
export const EXCHANGE_CURRENCY_UPDATE = 'EXCHANGE_CURRENCY_UPDATE';
export const CURRENCY_PRICE_ERROR = 'CURRENCY_PRICE_ERROR';
export const EXCHANGE_CURRENCIES = ['USD', 'TWD'];
export const APPROXIMATE_RATES = {
  TWD: { USD: 29.4429396 },
  USD: { '0#31#': 1, '60#0xdac17f958d2ee523a2206206994597c13d831ec7#': 1 },
};
function shouldFetchCurrencyPrices(state, refresh) {
  return (
    (refresh || !state.currencyPrice.currencyPrice) &&
    !state.currencyPrice.loading
  ); // no currency and not loading
}

export function fetchCurrencyPricesIfNeed(refresh = false) {
  return async (dispatch, getState) => {
    if (shouldFetchCurrencyPrices(getState(), refresh)) {
      return dispatch(fetchCurrencyPrices());
    }
  };
}

function fetchCurrencyPrices() {
  return async (dispatch, getState) => {
    let wallets = getState().wallets.wallets;
    if (wallets == null || wallets.length == 0) {
      return;
    }
    dispatch({ type: CURRENCY_PRICE_LOADING, loading: true });
    try {
      const currencyPrice = await Wallets.getCurrencyPrices(
        wallets,
        EXCHANGE_CURRENCIES,
        APPROXIMATE_RATES
      );
      dispatch({ type: CURRENCY_PRICE_UPDATE, currencyPrice });
    } catch (error) {
      console.warn('Wallets.getCurrencyPrices failed', error);
      dispatch({ type: CURRENCY_PRICE_ERROR, error });
    }
    dispatch({ type: CURRENCY_PRICE_LOADING, loading: false });
  };
}
