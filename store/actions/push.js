import { showLocalPush } from '../../PushNotification';
import { fetchTransaction } from './transactions';
import I18n from '../../i18n/i18n';
import { store } from '../index';
import { fetchBalance } from './balance';

export const PUSH_RECEIVE_PUSH = 'PUSH_RECEIVE_PUSH';
export const PUSH_CLEAR_PUSH = 'PUSH_CLEAR_PUSH';
import { Toast } from 'native-base';

export function onReceivePush(remoteMessage, foreground) {
  return async (dispatch, getState) => {
    const json = remoteMessage && remoteMessage.data;
    if (!json) {
      console.warn('No remoteMessage.data:', Object.keys(remoteMessage));
      return;
    }
    if (json.type === '1') {
      onReceiveTransactionPush(dispatch, getState(), json, foreground);
    }
  };
}
function onReceiveTransactionPush(dispatch, state, json, forgound) {
  let data = {
    walletID: Number(json.wallet_id),
    currency: Number(json.currency),
    tokenAddress: json.token_address || '',
    out: /^\s*(true|1|on)\s*$/i.test(json.out),
    amount: json.amount || '',
    fee: json.fee || '',
    fromAddress: json.from_address || '',
    toAddress: json.to_address || '',
    timestamp: Number(json.timestamp),
    txid: json.txid || '',
    description: json.description || '',
    currencySymbol: '',
  };
  // let address = data.out ? data.toAddress : data.fromAddress;
  let wallet = (state.wallets.wallets || []).find(w => w.walletId === data.walletID);
  if (wallet) {
    data.currencySymbol = wallet.currencySymbol;
    store.dispatch(
      fetchTransaction(
        wallet.currency,
        wallet.tokenAddress,
        wallet.address,
        wallet.currencySymbol,
        wallet.isFungible,
        true,
        0
      )
    );
    store.dispatch(
      fetchBalance(wallet.currency, wallet.tokenAddress, wallet.address, true)
    );
  }
  let title = '';
  let message = '';
  if (data.out) {
    title = I18n.t('transaction_sent');
    message =
      wallet && wallet.isFungible
        ? I18n.t('tokenid_sent_content', data)
        : I18n.t('amount_sent_content', data);
  } else {
    title = I18n.t('transaction_received');
    message =
      wallet && wallet.isFungible
        ? I18n.t('tokenid_received_content', data)
        : I18n.t('amount_received_content', data);
  }
  if (forgound) {
    Toast.show({
      text: message,
      type: 'success',
      duration: 5000,
    });
  } else {
    showLocalPush(title, message);
  }
}
export function clearPush({ deviceId, token }) {
  return { type: PUSH_CLEAR_PUSH, deviceId, token };
}
