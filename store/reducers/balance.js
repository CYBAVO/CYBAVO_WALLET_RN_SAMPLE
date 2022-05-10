/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import {
  BALANCE_ENQUEUE,
  BALANCE_ERROR,
  BALANCE_UPDATE_BALANCES,
} from '../actions/balance';
import { COMMON_RESET } from '../actions/common';
import { getWalletKey } from '../../Helpers';

const defaultState = {
  balances: {},
};

function balance(state = defaultState, action) {
  switch (action.type) {
    case COMMON_RESET: {
      return defaultState;
    }
    case BALANCE_ERROR: {
      const { batch, error } = action;
      let allB = {};
      for (let item of batch) {
        const { currency, tokenAddress, address } = item;
        const key = getWalletKey(currency, tokenAddress, address);
        const b = state.balances[key] || {
          currency,
          tokenAddress,
          address,
        };
        allB[key] = {
          ...b,
          loading: false,
          failed: true,
        };
      }
      let nextState = {
        ...state,
        balances: {
          ...state.balances,
          ...allB,
        },
      };
      return nextState;
    }
    case BALANCE_ENQUEUE: {
      const { currency, tokenAddress, address, loading } = action;
      const key = getWalletKey(currency, tokenAddress, address);
      const b = state.balances[key] || {
        currency,
        tokenAddress,
        address,
      };
      return {
        ...state,
        balances: {
          ...state.balances,
          [key]: {
            ...b,
            loading,
            failed: false,
          },
        },
      };
    }
    case BALANCE_UPDATE_BALANCES: {
      const { balances } = action;
      const updatedAt = Date.now();
      return {
        ...state,
        balances: {
          ...state.balances,
          // merge in new balances
          ...balances.reduce((acc, res) => {
            const { currency, tokenAddress, address, balance, failed } = res;
            const key = getWalletKey(currency, tokenAddress, address);
            let nextState = {
              ...acc,
              [key]: {
                ...balance,
                currency,
                tokenAddress,
                address,
                updatedAt: failed ? 0 : updatedAt,
                failed,
                loading: false,
              },
            };

            return nextState;
          }, {}),
        },
      };
    }
    default:
      return state;
  }
}

export default balance;
