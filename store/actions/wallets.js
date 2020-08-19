/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { Wallets } from '@cybavo/react-native-wallet-service';
import { fetchBalance } from './balance';
// import { fetchCurrencyPricesIfNeed } from './currencyPrice';

export const WALLETS_LOADING = 'WALLETS_LOADING';
export const WALLETS_UPDATE_WALLET_LIST = 'WALLETS_UPDATE_WALLET_LIST';
export const WALLETS_UPDATE_WALLET = 'WALLETS_UPDATE_WALLET';
export const WALLETS_ERROR = 'WALLETS_ERROR';
export const WALLETS_UPDATE_CURRENCIES = 'WALLETS_UPDATE_CURRENCIES';

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
