/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import {
  COMMON_RESET,
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
  WALLETCONNECT_UPDATE_API_VERSION,
  WALLETCONNECT_UPDATE_REPORTABLE,
  WC_V2_UPDATE_PENDING_REQUEST,
  WC_V2_UPDATE_SESSIONS,
  WC_V2_UPDATE_SUPPORTED_CHAIN,
  WC_V2_UPDATE_UI,
} from '../actions';
import { WC_V2_NOT_QUEUE } from '../../Constants';
const defaultState = {
  loading: false,
  connecting: {},
  pending: {},
  reportable: false,
  pendingUri: null,
  apiVersion: { ethWalletId: false, signOptions: true },
  v2RefreshTimestamp: 0,
  supportedChain: {},
  pendingRequests: {},
  queueRequest: WC_V2_NOT_QUEUE,
  dismissUi: false,
};
function walletconnect(state = defaultState, action) {
  switch (action.type) {
    case COMMON_RESET:
      return defaultState;
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
    case WC_V2_UPDATE_UI:
      return {
        ...state,
        dismissUi: action.dismissUi,
      };
    case WC_V2_UPDATE_PENDING_REQUEST:
      return {
        ...state,
        pendingRequests:
          action.pendingRequests != null
            ? action.pendingRequests
            : state.pendingRequests,
        queueRequest:
          action.queueRequest != null
            ? action.queueRequest
            : state.queueRequest,
      };
    case WC_V2_UPDATE_SESSIONS:
      return {
        ...state,
        v2RefreshTimestamp: action.v2RefreshTimestamp,
      };
    case WC_V2_UPDATE_SUPPORTED_CHAIN:
      return {
        ...state,
        supportedChain: action.chainMap,
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
    case WALLETCONNECT_UPDATE_API_VERSION:
      return {
        ...state,
        apiVersion: action.apiVersion,
      };
    default:
      return state;
  }
}

export default walletconnect;
