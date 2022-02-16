/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Wallets } from '@cybavo/react-native-wallet-service';
import { sleep } from '../../Helpers';
import { Platform } from 'react-native';

export const TOKEN_URI_LOADING = 'TOKEN_URI_LOADING';
export const TOKEN_URI_UPDATE = 'TOKEN_URI_UPDATE';
export const TOKEN_URI_ERROR = 'TOKEN_URI_ERROR';
function shouldFetchTokenUri(state, refresh) {
  let should = refresh || !state.tokenUri.loading; // no currency and not loading
  return should;
}

export function fetchTokenUriFromBalanceIfNeed(balances) {
  return async (dispatch, getState) => {
    if (shouldFetchTokenUri(getState(), true)) {
      return dispatch(fetchTokenUriFromBalance(balances));
    }
  };
}
export function fetchTokenUriIfNeed(wallets, refresh = false) {
  return async (dispatch, getState) => {
    if (shouldFetchTokenUri(getState(), refresh)) {
      return dispatch(fetchTokenUri(wallets));
    }
  };
}
export function getRestTokenIds(wallet, tokens, tokenUriMap) {
  if (!tokenUriMap || Object.keys(tokenUriMap).length == 0) {
    return tokens;
  }
  const r = tokens.filter(t => {
    let key = `${wallet.currency}#${wallet.tokenAddress}#${t}`;
    return !tokenUriMap[key];
  });
  return r;
}

function fetchTokenUri(wallets) {
  return async (dispatch, getState) => {
    if (wallets == null || wallets.length == 0) {
      return;
    }
    let tokenUriMap = getState().tokenUri.tokenUriMap;
    dispatch({ type: TOKEN_URI_LOADING, loading: true });
    for (let i = 0; i < wallets.length; i++) {
      if (wallets[i].tokens == null || wallets[i].tokens.length == 0) {
        console.log('Wallets.getMultipleTokenUri no need query');
        continue;
      }
      let tokens = getRestTokenIds(wallets[i], wallets[i].tokens, tokenUriMap);
      if (tokens.length == 0) {
        console.log('Wallets.getMultipleTokenUri no need query2');
        continue;
      }
      console.log('Wallets.getMultipleTokenUri RestTokenIds:', tokens);
      let batchCount = 10;
      for (let k = 0; k < tokens.length / batchCount; k++) {
        let subArr = tokens.slice(
          k * batchCount,
          Math.min(k * batchCount + batchCount, tokens.length)
        );
        console.log('Wallets.getMultipleTokenUri sub:', subArr);
        try {
          let arr = new Array(tokens.length).fill(wallets[i].tokenAddress);
          const { tokenUriMap } = await Wallets.getMultipleTokenUri(
            wallets[i].currency,
            arr,
            tokens
          );
          console.log(
            'Wallets.getMultipleTokenUri map:',
            JSON.stringify(tokenUriMap)
          );
          dispatch({ type: TOKEN_URI_UPDATE, tokenUriMap });
          await sleep(500);
        } catch (error) {
          console.warn('Wallets.getMultipleTokenUri failed', error);
          // dispatch({ type: TOKEN_URI_ERROR, error });
        }
      }
    }
    dispatch({ type: TOKEN_URI_LOADING, loading: false });
  };
}
function fetchTokenUriFromBalance(balances) {
  return async (dispatch, getState) => {
    if (balances == null || balances.length == 0) {
      return;
    }
    let tokenUriMap = getState().tokenUri.tokenUriMap;
    dispatch({ type: TOKEN_URI_LOADING, loading: true });
    for (let i = 0; i < balances.length; i++) {
      if (
        balances[i].balance.tokens == null ||
        balances[i].balance.tokens.length == 0
      ) {
        console.log(
          'Wallets.getMultipleTokenUriB no need query:' +
            JSON.stringify(balances[i])
        );
        continue;
      }
      let tokens = getRestTokenIds(
        balances[i],
        balances[i].balance.tokens,
        tokenUriMap
      );
      if (tokens.length == 0) {
        console.log('Wallets.getMultipleTokenUriB no need query2');
        continue;
      }
      console.log('Wallets.getMultipleTokenUriB RestTokenIds:', tokens);
      let batchCount = 10;
      for (let k = 0; k < tokens.length / batchCount; k++) {
        let subArr = tokens.slice(
          k * batchCount,
          Math.min(k * batchCount + batchCount, tokens.length)
        );
        console.log('Wallets.getMultipleTokenUriB sub:', subArr);
        try {
          let arr = new Array(tokens.length).fill(balances[i].tokenAddress);
          const { tokenUriMap } = await Wallets.getMultipleTokenUri(
            balances[i].currency,
            arr,
            tokens
          );
          console.log(
            'Wallets.getMultipleTokenUriB map:',
            JSON.stringify(tokenUriMap)
          );
          dispatch({ type: TOKEN_URI_UPDATE, tokenUriMap });
          await sleep(500);
        } catch (error) {
          console.warn('Wallets.getMultipleTokenUriB failed', error);
          // dispatch({ type: TOKEN_URI_ERROR, error });
        }
      }
    }
    dispatch({ type: TOKEN_URI_LOADING, loading: false });
  };
}
