/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import {
  TOKEN_URI_LOADING,
  TOKEN_URI_ERROR,
  TOKEN_URI_UPDATE,
} from '../actions/tokenUri';

function tokenUri(
  state = {
    loading: null,
    error: null,
    tokenUriMap: {},
  },
  action
) {
  switch (action.type) {
    case TOKEN_URI_LOADING:
      return {
        ...state,
        loading: action.loading,
        error: null,
      };
    case TOKEN_URI_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case TOKEN_URI_UPDATE:
      let map = {
        ...state.tokenUriMap,
        ...action.tokenUriMap,
      }
      return {
        ...state,
        tokenUriMap: map,
        error: null,
      };
    default:
      return state;
  }
}

export default tokenUri;
