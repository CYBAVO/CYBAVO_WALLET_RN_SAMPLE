/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import {
  CURRENCY_PRICE_LOADING,
  CURRENCY_PRICE_ERROR,
  CURRENCY_PRICE_UPDATE,
  EXCHANGE_CURRENCY_UPDATE,
  EXCHANGE_CURRENCIES,
} from '../actions/currencyPrice';

function currencyPrice(
  state = {
    loading: null,
    error: null,
    currencyPrice: null,
    exchangeCurrency: EXCHANGE_CURRENCIES[0],
  },
  action
) {
  switch (action.type) {
    case CURRENCY_PRICE_LOADING:
      return {
        ...state,
        loading: action.loading,
        error: null,
      };
    case CURRENCY_PRICE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case CURRENCY_PRICE_UPDATE:
      return {
        ...state,
        currencyPrice: action.currencyPrice,
        error: null,
      };
    case EXCHANGE_CURRENCY_UPDATE:
      return {
        ...state,
        exchangeCurrency: action.exchangeCurrency,
      }
    default:
      return state;
  }
}

export default currencyPrice;
