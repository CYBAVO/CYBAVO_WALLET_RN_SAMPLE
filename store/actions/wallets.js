/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Wallets } from '@cybavo/react-native-wallet-service';
import { fetchBalance } from './balance';
import { Coin } from '../../Constants';
// import { fetchCurrencyPricesIfNeed } from './currencyPrice';
export const WALLET_LIMIT_LOADING = 'WALLET_LIMIT_LOADING';
export const WALLET_LIMIT_ERROR = 'WALLET_LIMIT_ERROR';
export const WALLET_LIMIT_UPDATE = 'WALLET_LIMIT_UPDATE';
export const WALLETS_LOADING = 'WALLETS_LOADING';
export const WALLETS_UPDATE_WALLET_LIST = 'WALLETS_UPDATE_WALLET_LIST';
export const WALLETS_UPDATE_WALLET = 'WALLETS_UPDATE_WALLET';
export const WALLETS_ERROR = 'WALLETS_ERROR';
export const WALLETS_UPDATE_CURRENCIES = 'WALLETS_UPDATE_CURRENCIES';
export const WALLETS_UPDATE_SOL_NFT = 'WALLETS_UPDATE_SOL_NFT';

export function fetchSolNftTokens(wallet) {
  return async (dispatch, getState) => {
    if (wallet.currency != Coin.SOL || wallet.tokenAddress) {
      return;
    }
    Wallets.getSolNftTokens(wallet.walletId)
      .then(result => {
        dispatch({
          type: WALLETS_UPDATE_SOL_NFT,
          tokens: result.tokens,
          walletId: wallet.walletId,
        });
      })
      .catch(error => {
        console.log('Wallets.getSolNftTokens failed', error);
      });
  };
}
export function fetchSameCurrencyWalletLimit() {
  return async dispatch => {
    dispatch({ type: WALLET_LIMIT_LOADING, loading: true });
    try {
      const { walletLimit } = await Wallets.getSameCurrencyWalletLimit();
      dispatch({ type: WALLET_LIMIT_UPDATE, walletLimit });
      console.log('Wallets.getSameCurrencyWalletLimit s');
    } catch (error) {
      console.log('Wallets.getSameCurrencyWalletLimit failed', error);
      dispatch({ type: WALLET_LIMIT_ERROR, error });
    }
    dispatch({ type: WALLET_LIMIT_LOADING, loading: false });
  };
}

export function fetchWallets(fetchBalanceCurrency) {
  return async dispatch => {
    dispatch({ type: WALLETS_LOADING, loading: true });
    try {
      const { wallets } = await Wallets.getWallets();
      dispatch({ type: WALLETS_UPDATE_WALLET_LIST, wallets });
      // dispatch(fetchCurrencyPricesIfNeed());
      console.log('Wallets.getCurrencyPrices s');

      if (fetchBalanceCurrency && fetchBalanceCurrency.currency) {
        let w = wallets.find(
          wallet =>
            wallet.currency === fetchBalanceCurrency.currency &&
            wallet.tokenAddress == fetchBalanceCurrency.tokenAddress
        );
        dispatch(fetchBalance(w.currency, w.tokenAddress, w.address, true));
      }
    } catch (error) {
      console.log('Wallets.getWallets failed', error);
      dispatch({ type: WALLETS_ERROR, error });
    }
    dispatch({ type: WALLETS_LOADING, loading: false });
  };
}

export function fetchWallet(walletId) {
  return async dispatch => {
    dispatch({ type: WALLETS_LOADING, loading: true });
    try {
      const { wallet } = await Wallets.getWallet(walletId);
      dispatch({ type: WALLETS_UPDATE_WALLET, walletId, wallet });
    } catch (error) {
      console.log('Wallets.getWallet failed', walletId, error);
      dispatch({ type: WALLETS_ERROR, error });
    }
    dispatch({ type: WALLETS_LOADING, loading: false });
  };
}
