import { combineReducers } from 'redux';
import notifications from './notifications';

import auth from './auth';
import user from './user';
import wallets from './wallets';
import currency from './currency';
import balance from './balance';
import currencyPrice from './currencyPrice';
import transactions from './transactions';
import walletconnect from './walletconnect';
import apihistory from './apihistory';
const root = combineReducers({
  notifications,
  auth,
  user,
  wallets,
  currency,
  balance,
  currencyPrice,
  transactions,
  walletconnect,
  apihistory,
});

export default root;
