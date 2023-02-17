/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import {
  WALLET_LIMIT_UPDATE,
  WALLETS_ERROR,
  WALLETS_LOADING,
  WALLETS_UPDATE_SOL_NFT,
  WALLETS_UPDATE_WALLET,
  WALLETS_UPDATE_WALLET_LIST,
} from '../actions/wallets';
import { COMMON_RESET } from '../actions/common';
import {
  CURRENCIES_UPDATE_CURRENCIES,
  WALLETS_UPDATE_CURRENCIES,
} from '../actions';
import { Coin } from '../../Constants';
import {
  getNftColorIndex,
  getNftIconIndex,
  hasValue,
  isETHForkChain,
} from '../../Helpers';

const defaultState = {
  loading: null,
  error: null,
  wallets: null,
  walletLimit: 1,
};

function wallets(state = defaultState, action) {
  let stateWallet = state.wallets || [];
  switch (action.type) {
    case COMMON_RESET:
      return defaultState;
    case WALLETS_LOADING:
      return {
        ...state,
        loading: action.loading,
        error: null,
      };
    case WALLETS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case WALLETS_UPDATE_WALLET_LIST:
      return {
        ...state,
        wallets: action.wallets,
        error: null,
      };
    case WALLET_LIMIT_UPDATE:
      let walletLimit = action.walletLimit;
      if (!walletLimit) {
        walletLimit = 1;
      }
      return {
        ...state,
        walletLimit: walletLimit,
      };
    case WALLETS_UPDATE_SOL_NFT: {
      let solWalletMap = state.solWalletMap || {};
      let stateWallet = state.wallets || [];
      if (!action.tokens || action.tokens.length === 0) {
        delete solWalletMap[action.walletId];
        return {
          ...state,
          solWallets: solWalletMap,
        };
      }
      for (let w of stateWallet) {
        if (w.walletId != action.walletId) {
          continue;
        }
        let newW = {
          ...w,
          tokens: action.tokens,
          colorIndex: 9,
          iconIndex: 9,
        };
        solWalletMap[action.walletId] = newW;
        break;
      }
      return {
        ...state,
        solWalletMap: solWalletMap,
      };
    }
    case CURRENCIES_UPDATE_CURRENCIES:
    case WALLETS_UPDATE_CURRENCIES:
      let newWallets = [];
      let newNftWallets = [];
      let ethWallet;
      let bnbWallet;
      let bscWallet;
      let stateWallet = state.wallets || [];
      for (let w of stateWallet) {
        const currency = (action.currencies || []).find(
          c => c.currency === w.currency && c.tokenAddress === w.tokenAddress
        );
        if (!currency) {
          // console.warn('skip wallet:' + w.name);
          continue;
        }
        let isNft =
          currency.tokenVersion == 721 || currency.tokenVersion == 1155;
        let newW = {
          ...w,
          ...action.wallet,
          currencyDisplayName: currency.displayName ? currency.displayName : '',
          isNft: isNft,
          tokenVersion: currency.tokenVersion,
        };
        if (isNft) {
          let colorIndex = getNftColorIndex(newW.walletId);
          let iconIndex = getNftIconIndex(newNftWallets.length);
          newW = {
            ...newW,
            colorIndex: colorIndex,
            iconIndex: iconIndex,
          };
          newNftWallets.push(newW);
        }
        newWallets.push(newW);
        if (!hasValue(newW.tokenAddress)) {
          if (newW.currency == Coin.ETH) {
            ethWallet = newW;
          } else if (newW.currency == Coin.BNB) {
            bnbWallet = newW;
          } else if (newW.currency == Coin.BSC) {
            bscWallet = newW;
          }
        }
      }
      let newState = {
        ...state,
        wallets: newWallets,
        nftWallets: newNftWallets,
        ethWallet,
        bnbWallet,
        bscWallet,
      };
      return newState;
    case WALLETS_UPDATE_WALLET:
      if (!state.wallets) {
        return {
          ...state,
          wallets: [action.wallet],
          error: null,
        };
      }
      let ws = [];
      for (let w of state.wallets) {
        if (w.walletId === action.walletId) {
          ws.push(action.wallet);
        } else {
          ws.push(w);
        }
      }
      return {
        ...state,
        wallets: ws,
        error: null,
      };
    default:
      return state;
  }
}

export default wallets;
