/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { COMMON_RESET } from '../actions/common';
import {
  API_HISTORY_ENQUEUE,
  API_HISTORY_UPDATE,
  CURRENCIES_UPDATE_CURRENCIES,
  NOT_LOADING,
  WALLETS_UPDATE_CURRENCIES,
} from '../actions';
import { Api, isFungibleToken } from '../../Constants';
import { getWalletKey, hasValue } from '../../Helpers';
import moment from 'moment';
import {
  default as ApiHistoryItem,
  Wallets,
} from '@cybavo/react-native-wallet-service';
import { CANCEL_FAILED, CANCELLED, CANCELLING } from './transactions';

const defaultState = {
  apihistory: {},
};

function apihistory(state = defaultState, action) {
  switch (action.type) {
    case COMMON_RESET:
      return defaultState;
    case API_HISTORY_ENQUEUE: {
      const { walletId, loading } = action;
      if (!state.apihistory[walletId]) {
        return {
          ...state,
          apihistory: {
            ...state.apihistory,
            [walletId]: { loading, failed: false, data: {} },
          },
        };
      }
      return {
        ...state,
        apihistory: {
          ...state.apihistory,
          [walletId]: {
            ...state.apihistory[walletId],
            loading,
            failed: false,
          },
        },
      };
    }
    case API_HISTORY_UPDATE: {
      const { walletId, total, start, data } = action;
      if (
        state.apihistory[walletId] == null ||
        state.apihistory[walletId].data == null
      ) {
        state.apihistory[walletId] = {
          loading: NOT_LOADING,
          failed: false,
          data: {},
        };
      } else {
        state.apihistory[walletId].loading = NOT_LOADING;
        state.apihistory[walletId].failed = false;
      }
      let headNonce = state.apihistory[walletId].headNonce || {};
      let headTime = state.apihistory[walletId].headTime || {};
      let sub = state.apihistory[walletId].sub || {};
      let txids = state.apihistory[walletId].txids || [];

      for (let i = 0; i < data.length; i++) {
        let key = data[i].accessId;
        data[i] = getHandledApihistory(data[i]);
        let time = data[i].timestamp.valueOf();
        let nonce = data[i].nonce;
        switch (data[i].apiName) {
          case Api.signTx:
            //find head
            if (headTime[time]) {
              state.apihistory[walletId].data[headTime[time].accessId].sign =
                data[i];
              delete headTime[time];
            } else {
              sub[time] = data[i];
              data[i].head = true;
            }
            break;
          case Api.sendRawTx:
            data[i].head = true;
            //find sub: cancel
            if (sub[nonce]) {
              data[i].cancel = sub[nonce];
              data[i].replaceStatus = getReplaceStatus(data[i], sub[nonce]);
              data[i].cancelable = false;
              state.apihistory[walletId].data[sub[nonce].accessId].head = false;
              delete sub[nonce];
            } else {
              headNonce[nonce] = data[i];
            }
            //find sub: sign
            if (sub[time]) {
              data[i].sign = sub[time];
              state.apihistory[walletId].data[sub[time].accessId].head = false;
              delete sub[time];
            } else {
              headTime[time] = data[i];
            }
            if (data[i].txid) {
              txids.push(data[i].txid);
            }
            break;
          case Api.cancelTx:
            //find head
            if (headNonce[nonce]) {
              state.apihistory[walletId].data[
                headNonce[nonce].accessId
              ].cancel = data[i];
              state.apihistory[walletId].data[
                headNonce[nonce].accessId
              ].cancelable = false;
              state.apihistory[walletId].data[
                headNonce[nonce].accessId
              ].replaceStatus = getReplaceStatus(
                state.apihistory[walletId].data[headNonce[nonce].accessId],
                data[i]
              );
              delete headNonce[nonce];
            } else {
              sub[nonce] = data[i];
              data[i].head = true;
            }
            if (data[i].txid) {
              txids.push(data[i].txid);
            }
            break;
          default:
            data[i].head = true;
            break;
        }

        state.apihistory[walletId].data[key] = data[i];
      }
      state.apihistory[walletId].total = total;
      state.apihistory[walletId].txids = txids;
      if (
        !state.apihistory[walletId].start ||
        start > state.apihistory[walletId].start
      ) {
        state.apihistory[walletId].start = start;
      }
      return state;
    }
    default:
      return state;
  }
}
function getReplaceStatus(data, cancelData) {
  if (
    cancelData.status == Wallets.ApiHistoryItem.Status.DONE ||
    data.message == 'Transaction Dropped' ||
    data.status == Wallets.ApiHistoryItem.Status.DONE
  ) {
    return CANCELLED;
  } else if (cancelData.status == Wallets.ApiHistoryItem.Status.FAILED) {
    return CANCEL_FAILED;
  } else {
    return CANCELLING;
  }
}
function getHandledApihistory(data) {
  data.timestamp = moment(data.createTime);
  data.formatTime = data.timestamp.format('YYYY-MM-DD HH:mm:ss');
  data.cancelable =
    data.apiName == Api.sendRawTx &&
    hasValue(data.accessId) &&
    data.status == Wallets.ApiHistoryItem.Status.WAITING;
  return data;
}
export default apihistory;
