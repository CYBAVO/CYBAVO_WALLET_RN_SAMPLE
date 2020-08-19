/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import {
  WALLETS_LOADING,
  WALLETS_ERROR,
  WALLETS_UPDATE_WALLET_LIST,
  WALLETS_UPDATE_WALLET,
} from '../actions/wallets';
import { COMMON_RESET } from '../actions/common';
import {
  CURRENCIES_UPDATE_CURRENCIES,
  WALLETS_UPDATE_CURRENCIES,
} from '../actions';
import { isFungibleToken } from '../../Constants';

const defaultState = {
  loading: null,
  error: null,
  wallets: null,
};

function wallets(state = defaultState, action) {
  switch (action.type) {
    case COMMON_RESET:
      return defaultState;
    case WALLETS_LOADING:
      return {
        ...state,
        loading: action.loading,
        error: null,
      };
    case WALLETS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case WALLETS_UPDATE_WALLET_LIST:
      return {
        ...state,
        wallets: action.wallets,
        error: null,
      };
    case CURRENCIES_UPDATE_CURRENCIES:
    case WALLETS_UPDATE_CURRENCIES:
      let newWallets = [];
      for (let w of state.wallets) {
        const currency = (action.currencies || []).find(
            c => c.currency === w.currency && c.tokenAddress === w.tokenAddress
        );
        if (!currency) {
          console.warn('skip wallet:' + w.name);
          continue;
        }
        let newW = {
          ...w,
          ...action.wallet,
          currencyDisplayName: currency.displayName ? currency.displayName : '',
          isFungible: isFungibleToken(currency),
        };
        newWallets.push(newW);
      }
      let newState = {
        ...state,
        wallets: newWallets,
      };
      return newState;
    case WALLETS_UPDATE_WALLET:
      if (!state.wallets) {
        return {
          ...state,
          wallets: [action.wallet],
          error: null,
        };
      }
      let ws = [];
      for (let w of state.wallets) {
        if (w.walletId === action.walletId) {
          ws.push(action.wallet);
        } else {
          ws.push(w);
        }
      }
      return {
        ...state,
        wallets: ws,
        error: null,
      };
    default:
      return state;
  }
}

export default wallets;
