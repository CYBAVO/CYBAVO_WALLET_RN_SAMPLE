/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import {
  WALLETCONNECT_CALL_APPROVAL,
  WALLETCONNECT_CALL_REJECTION,
  WALLETCONNECT_CALL_REQUEST,
  WALLETCONNECT_INIT_FAILURE,
  WALLETCONNECT_INIT_REQUEST,
  WALLETCONNECT_INIT_SUCCESS,
  WALLETCONNECT_PENDING_URI,
  WALLETCONNECT_SESSION_APPROVAL,
  WALLETCONNECT_SESSION_DISCONNECTED,
  WALLETCONNECT_SESSION_REJECTION,
  WALLETCONNECT_SESSION_REQUEST,
  WALLETCONNECT_UPDATE_REPORTABLE,
} from '../actions';

function walletconnect(
  state = {
    loading: false,
    connecting: {},
    pending: {},
    reportable: false,
    pendingUri: null,
  },
  action
) {
  switch (action.type) {
    case WALLETCONNECT_PENDING_URI:
      return {
        ...state,
        deeplink: action.uri
          ? { uri: action.uri, timestamp: Date.now() }
          : null,
      };
    case WALLETCONNECT_UPDATE_REPORTABLE:
      return {
        ...state,
        reportable: action.value,
      };
    case WALLETCONNECT_INIT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case WALLETCONNECT_INIT_SUCCESS:
      return {
        ...state,
        loading: false,
        connectors: action.payload,
      };
    case WALLETCONNECT_INIT_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case WALLETCONNECT_SESSION_REQUEST:
      return {
        ...state,
        pending: action.pending,
        reportable: true,
      };
    case WALLETCONNECT_SESSION_REJECTION:
      return {
        ...state,
        pending: action.pending,
        reportable: true,
      };
    case WALLETCONNECT_SESSION_APPROVAL:
      return {
        ...state,
        connecting: action.connecting,
        pending: action.pending,
        reportable: true,
      };
    case WALLETCONNECT_SESSION_DISCONNECTED:
      return {
        ...state,
        connecting: action.connecting,
        pending: action.pending,
      };
    case WALLETCONNECT_CALL_REQUEST:
    case WALLETCONNECT_CALL_APPROVAL:
    case WALLETCONNECT_CALL_REJECTION:
      return {
        ...state,
        requests: action.payload,
        reportable: true,
      };
    default:
      return state;
  }
}

export default walletconnect;
