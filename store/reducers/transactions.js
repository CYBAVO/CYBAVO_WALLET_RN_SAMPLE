/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import {
  KEY_USER_TX,
  TRANSACTIONS_ENQUEUE,
  TRANSACTIONS_UPDATE_TRANSACTIONS,
} from '../actions/transactions';
import { COMMON_RESET } from '../actions/common';
import {
  getTransactionKey,
  getWalletKey,
  hasValue,
  isErc20,
} from '../../Helpers';
import { NOT_LOADING } from '../actions';
import moment from 'moment';

const defaultState = {
  transactions: {},
};
export const CANCELLING = 10;
export const CANCELLED = 11;
export const CANCEL_FAILED = 12;
export const ACCELERATING = 20;
export const ACCELERATED = 21;
export const ACCELERATE_FAILED = 22;

function getActivityLog(feeUnit, origin, base, head, txMap) {
  let logs = [];
  if (base == null) {
    return { logs, replaceStatus: base };
  }
  let txs = Object.values(txMap);
  txs.sort((a, b) => a.timestamp - b.timestamp);
  //timestamp is not reliable
  let parsed = moment.unix(origin.timestamp);
  logs.push({
    type: 'init',
    fee: origin.transactionFee,
    feeUnit: feeUnit,
    time: parsed.format('HH:mm:ss'),
    date: parsed.format('YYYY-MM-DD'),
  });
  let replaceStatus = base;
  for (let tx of txs) {
    if (tx.txid == origin.txid) {
      if (!head.replaceable) {
        if (tx.replaced) {
          replaceStatus += 1; //replaced success
        } else {
          replaceStatus += 2;
        }
      }
      continue;
    }
    let parsed = moment.unix(tx.timestamp);
    let log = {
      fee: tx.transactionFee,
      feeUnit: feeUnit,
      time: parsed.format('HH:mm:ss'),
      date: parsed.format('YYYY-MM-DD'),
    };

    if (base == ACCELERATING) {
      log.type = 'accelerate';
    } else {
      log.type = 'cancel';
    }
    logs.push(log);
  }
  switch (replaceStatus) {
    case CANCELLED:
      logs.push({ type: 'cancelSuccess' });
      break;
    case CANCEL_FAILED:
      logs.push({ type: 'cancelFailed' });
      break;
    case ACCELERATED:
      logs.push({
        type: 'accelerateSuccess',
      });
      break;
    case ACCELERATE_FAILED:
      logs.push({
        type: head.pending ? 'failed' : 'accelerateFailed',
      });
      break;
  }
  return { logs, replaceStatus };
}

function getReplaceBase(newer) {
  return newer.amount === '0' ? CANCELLING : ACCELERATING;
}
function getReplaceStatus(head, origin, base) {
  if (head.replaceable) {
    return base;
  }
  if (origin.replaced) {
    base += 1; //replaced success
  } else {
    base += 2;
  }
  return base;
}
function getOrigin(current, transaction) {
  if (current.txid === transaction.txid) {
    return { origin: transaction, base: null };
  }
  let origin;
  let replacer;
  if (current.amount != transaction.amount) {
    if (transaction.amount === '0') {
      origin = current;
      replacer = transaction;
    } else {
      origin = transaction;
      replacer = current;
    }
  } else if (current.transactionFee != transaction.transactionFee) {
    //timestamp is not reliable
    if (transaction.transactionFee > current.transactionFee) {
      origin = current;
      replacer = transaction;
    } else {
      origin = transaction;
      replacer = current;
    }
  } else if (transaction.timestamp < current.timestamp) {
    origin = transaction;
    replacer = current;
  } else if (transaction.timestamp > current.timestamp) {
    origin = current;
    replacer = transaction;
  } else if (transaction.amount === '0') {
    origin = current;
    replacer = transaction;
  } else {
    origin = transaction;
    replacer = current;
  }
  return { origin, base: getReplaceBase(replacer) };
}
function getRealHead(currentHead, transaction) {
  //determine the head of group
  if (transaction.replaced != currentHead.replaced) {
    if (transaction.replaced) {
      return currentHead;
    } else {
      return transaction;
    }
  }
  if (!transaction.replaceable) {
    //confirmed transaction
    return transaction;
  } else if (
    // the latest transaction
    // transaction.replaceable &&
    transaction.timestamp > currentHead.timestamp
  ) {
    return transaction;
  }
  return currentHead;
}
function getLastTxByWallet(walletKey, txByWallet, transaction) {
  if (
    txByWallet.latestTx == null ||
    txByWallet.latestTx.timestamp < transaction.timestamp
  ) {
    return {
      address: walletKey,
      timestamp: transaction.timestamp,
    };
  }
  return txByWallet.latestTx;
}

function transactions(state = defaultState, action) {
  switch (action.type) {
    case COMMON_RESET: {
      return defaultState;
    }
    case TRANSACTIONS_ENQUEUE: {
      const { currency, tokenAddress, address, loading } = action;
      const key = getWalletKey(currency, tokenAddress, address);
      if (!state.transactions[key]) {
        return {
          ...state,
          transactions: {
            ...state.transactions,
            [key]: { loading, failed: false, data: {} },
          },
        };
      }
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [key]: {
            ...state.transactions[key],
            loading,
            failed: false,
          },
        },
      };
    }
    case TRANSACTIONS_UPDATE_TRANSACTIONS: {
      const {
        transactions,
        total,
        start,
        currency,
        tokenAddress,
        address,
        currencySymbol,
        txids = [],
      } = action;
      const updatedAt = Date.now();
      let key = getWalletKey(currency, tokenAddress, address);
      if (
        start == 0 ||
        state.transactions[key] == null ||
        state.transactions[key].data == null
      ) {
        state.transactions[key] = {
          loading: NOT_LOADING,
          failed: false,
          data: {},
          nonceMap: {},
        };
      } else {
        state.transactions[key].loading = NOT_LOADING;
        state.transactions[key].updatedAt = updatedAt;
        state.transactions[key].failed = false;
      }
      let nonceMap = state.transactions[key].nonceMap || {}; //{1: { headKey: "0x1", rest: [t1, t2, t3], realHead: t3, origin: t2}}
      let todoNonce = new Set(); //key of nonceMap
      for (let i = 0; i < transactions.length; i++) {
        if (txids.includes(transactions[i].txid)) {
          continue;
        }
        transactions[i] = {
          ...transactions[i],
          currencySymbol,
        };
        let txKey = getTransactionKey(key, transactions[i]);
        if (
          currency === KEY_USER_TX ||
          transactions[i].nonce <= 0 ||
          transactions[i].platformFee
        ) {
          //no nonce group
          state.transactions[key].data[txKey] = transactions[i];
          state.transactions[key].latestTx = getLastTxByWallet(
            key,
            state.transactions[key],
            transactions[i]
          );
        } else if (!nonceMap[transactions[i].nonce]) {
          nonceMap[transactions[i].nonce] = {
            headKey: txKey,
            rest: {},
            realHead: transactions[i],
            origin: transactions[i], //can be out of date
          };
          state.transactions[key].data[txKey] = transactions[i];
          state.transactions[key].latestTx = getLastTxByWallet(
            key,
            state.transactions[key],
            transactions[i]
          );
        } else {
          if (state.transactions[key].data[txKey]) {
            state.transactions[key].data[txKey] = transactions[i];
          }
          if (
            nonceMap[transactions[i].nonce].headKey != txKey ||
            nonceMap[transactions[i].nonce].realHead.replaceStatus ==
              CANCELLING ||
            nonceMap[transactions[i].nonce].realHead.replaceStatus ==
              ACCELERATING
          ) {
            //1. different tx, 2. canceling or accelerating
            todoNonce.add(transactions[i].nonce);
            nonceMap[transactions[i].nonce].rest[txKey] = transactions[i];
            let { origin, base } = getOrigin(
              nonceMap[transactions[i].nonce].origin,
              transactions[i]
            );
            nonceMap[transactions[i].nonce].origin = origin;
            if (!nonceMap[transactions[i].nonce].base && base) {
              nonceMap[transactions[i].nonce].base = base;
            }
            nonceMap[transactions[i].nonce].realHead = getRealHead(
              state.transactions[key].data[
                nonceMap[transactions[i].nonce].headKey
              ],
              transactions[i]
            );
          }
        }
      }
      //handle todoNonce
      let feeUnit = isErc20({ currency, tokenAddress })
        ? 'ETH'
        : currencySymbol;
      for (let nonce of todoNonce) {
        nonceMap[nonce].rest[nonceMap[nonce].headKey] =
          state.transactions[key].data[nonceMap[nonce].headKey]; //rest didn't add head at beginning
        delete state.transactions[key].data[nonceMap[nonce].headKey];
        nonceMap[nonce].realHead.amount = nonceMap[nonce].origin.amount;
        let newHeadKey = getTransactionKey(key, nonceMap[nonce].realHead);
        nonceMap[nonce].headKey = newHeadKey;
        let { logs, replaceStatus } = getActivityLog(
          feeUnit,
          nonceMap[nonce].origin,
          nonceMap[nonce].base,
          nonceMap[nonce].realHead,
          nonceMap[nonce].rest
        );
        nonceMap[nonce].realHead.replaceStatus = replaceStatus;
        nonceMap[nonce].realHead.logs = logs;
        state.transactions[key].data[newHeadKey] = nonceMap[nonce].realHead;

        state.transactions[key].latestTx = getLastTxByWallet(
          key,
          state.transactions[key],
          nonceMap[nonce].realHead
        );
      }
      state.transactions[key].nonceMap = nonceMap;
      // The latest tx in general
      if (
        state.transactions[key].latestTx &&
        (state.transactions.latestTx == null ||
          state.transactions.latestTx.timestamp <
            state.transactions[key].latestTx.timestamp)
      ) {
        state.transactions.latestTx = state.transactions[key].latestTx;
      }
      state.transactions[key].total = total;
      if (
        !state.transactions[key].start ||
        start > state.transactions[key].start
      ) {
        state.transactions[key].start = start;
      }
      return state;
    }
    default:
      return state;
  }
}

export default transactions;
