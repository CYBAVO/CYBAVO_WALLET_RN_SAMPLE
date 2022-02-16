/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Wallets } from '@cybavo/react-native-wallet-service';
import { getWalletKey, inDevList } from '../../Helpers';
import {
  fetchTokenUriFromBalance,
  fetchTokenUriFromBalanceIfNeed,
  fetchTokenUriIfNeed,
  fetchTokenUriIfNeed2,
} from './tokenUri';

export const BALANCE_ENQUEUE = 'BALANCE_ENQUEUE';
export const BALANCE_UPDATE_BALANCES = 'BALANCE_UPDATE_BALANCES';

const BALANCE_THROTTLE = 10 * 1000; // 10 sec
const BALANCE_ENQUEUE_DELAY = 500; // 0.5 sec

function shouldFetchBalance(currency, tokenAddress, address, state) {
  const key = getWalletKey(currency, tokenAddress, address);
  const balance = state.balance.balances[key];
  if (balance == undefined) {
    // not exist
    return true;
  }
  if (balance.loading) {
    // already loading
    return false;
  }

  if (!balance.updatedAt) {
    // no time for some how
    return true;
  }
  // expired
  return Date.now() - balance.updatedAt > BALANCE_THROTTLE;
}

export function fetchBalance(currency, tokenAddres, address, refresh) {
  return async (dispatch, getState) => {
    if (
      refresh ||
      shouldFetchBalance(currency, tokenAddres, address, getState())
    ) {
      return dispatch(enqueueBalance(currency, tokenAddres, address));
    }
  };
}

let timeOut = null;
function enqueueBalance(currency, tokenAddress, address) {
  return dispatch => {
    dispatch({
      type: BALANCE_ENQUEUE,
      currency,
      tokenAddress,
      address,
      loading: true,
    });
    if (!timeOut) {
      timeOut = setTimeout(() => {
        timeOut = null;
        dispatch(fetchBalancesBatch());
      }, BALANCE_ENQUEUE_DELAY);
    }
  };
}

function fetchBalancesBatch() {
  return async (dispatch, getState) => {
    const batch = Object.values(getState().balance.balances).filter(
      b => b.loading
    );
    try {
      const result = await Wallets.getBalances(batch);
      let balances;
      if (inDevList()) {
        balances = batch.map(({ currency, tokenAddress, address }, i) => {
          const res = result[i];
          if (currency == 60) {
            switch (tokenAddress) {
              case '0x9fceceda8a781e493a0eba6a59c6e6c731fd5ee5':
                res.tokens = [
                  '29',
                  '28',
                  '27',
                  '26',
                  '25',
                  '24',
                  '23',
                  '22',
                  '21',
                  '20',
                  '19',
                  '18',
                  '17',
                  '16',
                  '15',
                  '14',
                  '13',
                  '12',
                  '11',
                  '10',
                  '9',
                  '8',
                  '7',
                  '6',
                  '5',
                  '4',
                  '3',
                  '2',
                  '1',
                  '0',
                ];
                break;
              case '0x4c4a07f737bf57f6632b6cab089b78f62385acae': //svg
                res.tokens = ['1277', '1276', '1275', '1274', '1', '2'];
                break;
              case '0x30ae57840b0e9b8ea55334083d53d80b2cfe80e0':
                res.tokens = ['196', '51', '189', '219'];
                break;
              case '0x1cd623a86751d4c4f20c96000fec763941f098a2':
                res.tokens = [
                  '36000105',
                  '36000104',
                  '36000103',
                  '36000102',
                  '41000102',
                ];
                break;
              case '0x813205485e1f065e60b77834a4135980b1ba7d2f':
                res.tokens = ['24', '23', '22', '21'];
                break;
              case '0x0d65e3da4d6544b8bd26abdefb7d873b0aa5d370':
                res.tokens = ['8', '9', '10', '11'];
                break;
              case '0x943cc300dd938d8490d33d794507fedc25c49002':
                res.tokens = [
                  '19',
                  '561',
                  '574',
                  '630',
                  '4246',
                  '4443',
                  '6148',
                ];
                break;
            }
          }
          return {
            currency,
            tokenAddress,
            address,
            balance: res || {},
            failed: !res,
          };
        });
      } else {
        balances = batch.map(({ currency, tokenAddress, address }, i) => {
          const res = result[i];
          return {
            currency,
            tokenAddress,
            address,
            balance: res || {},
            failed: !res,
          };
        });
      }
      dispatch({ type: BALANCE_UPDATE_BALANCES, balances });
      dispatch(fetchTokenUriFromBalanceIfNeed(balances));
    } catch (error) {
      console.log('Wallets.getBalances failed', batch, error);
    }
  };
}
