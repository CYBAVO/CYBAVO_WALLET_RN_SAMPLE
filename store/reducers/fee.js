/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { FEE_LOADING, FEE_ERROR, FEE_UPDATE } from '../actions/fee';
import { hasValue } from '../../Helpers';

function fee(state = {}, action) {
  const { currency, rawFee, loading, error } = action;
  if (state.fee == null) {
    state.fee = {};
  }
  if (state.fee[currency] == null) {
    state.fee[currency] = {
      data: {},
      loading: null,
      error: null,
    };
  }
  switch (action.type) {
    case FEE_LOADING:
      state.fee[currency].loading = loading;
      return state;
    case FEE_ERROR:
      state.fee[currency].error = error;
      state.fee[currency].loading = false;
      return state;
    case FEE_UPDATE:
      if (
        rawFee != null &&
        rawFee.high != null &&
        rawFee.medium != null &&
        rawFee.low != null &&
        hasValue(rawFee.high.amount) &&
        hasValue(rawFee.medium.amount) &&
        hasValue(rawFee.low.amount)
      ) {
        state.fee[currency].data = rawFee;
      } else {
        state.fee[currency].data = null;
      }
      state.fee[currency].loading = false;
      return state;
    default:
      return state;
  }
}

export default fee;
