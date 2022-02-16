/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { WalletConnectSdk } from '@cybavo/react-native-wallet-service';
import { toast, toastError } from '../../Helpers';
const { WalletConnectManager, WalletConnectHelper } = WalletConnectSdk;
import NavigationService from '../../NavigationService';
import { CHAIN_ID } from '../../BuildConfig';
import moment from 'moment';
import { FileLogger } from 'react-native-file-logger';
import I18n from '../../i18n/i18n';

export const WALLETCONNECT_UPDATE_REPORTABLE =
  'walletConnect/WALLETCONNECT_UPDATE_REPORTABLE';
export const WALLETCONNECT_INIT_REQUEST =
  'walletConnect/WALLETCONNECT_INIT_REQUEST';
export const WALLETCONNECT_INIT_SUCCESS =
  'walletConnect/WALLETCONNECT_INIT_SUCCESS';
export const WALLETCONNECT_INIT_FAILURE =
  'walletConnect/WALLETCONNECT_INIT_FAILURE';

export const WALLETCONNECT_SESSION_REQUEST =
  'walletConnect/WALLETCONNECT_SESSION_REQUEST';

export const WALLETCONNECT_SESSION_APPROVAL =
  'walletConnect/WALLETCONNECT_SESSION_APPROVAL';

export const WALLETCONNECT_SESSION_REJECTION =
  'walletConnect/WALLETCONNECT_SESSION_REJECTION';

export const WALLETCONNECT_SESSION_DISCONNECTED =
  'walletConnect/WALLETCONNECT_SESSION_DISCONNECTED';

export const WALLETCONNECT_CALL_REQUEST =
  'walletConnect/WALLETCONNECT_CALL_REQUEST';

export const WALLETCONNECT_CALL_APPROVAL =
  'walletConnect/WALLETCONNECT_CALL_APPROVAL';

export const WALLETCONNECT_CALL_REJECTION =
  'walletConnect/WALLETCONNECT_CALL_REJECTION';

export const WALLETCONNECT_PENDING_URI =
  'walletConnect/WALLETCONNECT_PENDING_URI';
export function newSession(
  uri,
  address,
  walletId,
  returnAddress,
  returnChainId
) {
  return async (dispatch, getState) => {
    try {
      let clientMeta = {
        description: I18n.t('app_name'),
        url: 'https://www.cybavo.com/',
        icons: ['https://www.cybavo.com/img/header-logo-color.svg'],
        name: I18n.t('app_name'),
        ssl: true,
      };
      dispatch({ type: WALLETCONNECT_UPDATE_REPORTABLE, value: true });
      FileLogger.debug(
        `>> newSession:${uri},address:${address},walletId${walletId},returnAddress:${returnAddress ||
          ''},returnChainId${returnChainId || ''}, ,${getState().auth.config}`
      );
      let connectorWrapper = WalletConnectManager.newSession(
        uri,
        address,
        walletId,
        clientMeta,
        (error, payload) => {
          if (error) {
            FileLogger.debug(`sessionRequest error:${error}`);
            toastError(error);
            return;
          }
          FileLogger.debug(`sessionRequest:${JSON.stringify(payload)}`);
          dispatch({
            type: WALLETCONNECT_SESSION_REQUEST,
            pending: WalletConnectManager.getPendingMap(),
          });
          NavigationService.navigate('Connecting', {
            peerId: connectorWrapper.getConnector().peerId,
            peerName: connectorWrapper.getConnector().peerMeta.name,
            payload,
            address,
            chainId: CHAIN_ID,
            returnAddress,
            returnChainId,
          });
        }
      );

      NavigationService.navigate('Connecting', {});
    } catch (error) {
      FileLogger.debug(`newSession fail:${error}`);
    }
  };
}
export function approveSession(
  peerId,
  peerName,
  response: { accounts: string[], chainId: number }
) {
  return async (dispatch, getState) => {
    // if (getState().auth.config == 'test') {
    //   response.accounts = ['0xaad9ebc005efa45f53e59ff8dadba14e59225155'];
    // }
    FileLogger.debug(
      `>> approveSession_peerId:${peerId}, response:${JSON.stringify(response)}`
    );
    WalletConnectManager.approveSession(
      peerId,
      {
        accounts: response.accounts,
        chainId: response.chainId,
      },
      (error: any, payload: any) => {
        if (error) {
          FileLogger.debug(`callRequest error:${error}`);
          toastError(error);
          return;
        }
        FileLogger.debug(`callRequest:${JSON.stringify(payload)}`);
        NavigationService.navigate('Request', {
          peerId,
          payload: getHandledPayload(peerId, payload, getState().auth.config),
          walletId: WalletConnectManager.getWalletId(peerId),
        });
      },
      (error, payload) => {
        if (error) {
          toastError(error);
          return;
        }
        toast(I18n.t('receive_disconnect_template', { peerId: peerName }));
        FileLogger.debug(`>> Receive disconnect_peerId:${peerId},${peerName}`);
        dispatch({
          type: WALLETCONNECT_SESSION_DISCONNECTED,
          connecting: WalletConnectManager.getConnectingMap(),
          pending: WalletConnectManager.getPendingMap(),
        });
      }
    );
    dispatch({
      type: WALLETCONNECT_SESSION_APPROVAL,
      connecting: WalletConnectManager.getConnectingMap(),
      pending: WalletConnectManager.getPendingMap(),
    });
    NavigationService.navigate('ConnectionList', {});
  };
}
function getHandledPayload(peerId, payload, config) {
  let map = WalletConnectManager.getConnectingMap();
  if (!map[peerId]) {
    return payload;
  }
  const { peerMeta } = map[peerId].getSessionPayload().params[0];
  switch (payload.method) {
    case 'eth_sendTransaction':
    case 'eth_signTransaction':
      const tx = payload.params[0];
      if (!tx.value) {
        tx.value = '0x0';
      }
      if (peerMeta.name == 'WalletConnect Example') {
        tx.to =
          tx.from == tx.to
            ? '0x346E8A6e240b73dC700574fdd46D26d4C9FF5AAD'
            : tx.to;
        tx.value = tx.value == '0x0' ? '0xe8d4a51000' : tx.value;
        payload.params[0] = tx;
      } else if (config == 'test') {
        tx.from = WalletConnectManager.getAddress(peerId);
        tx.to = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
        tx.data =
          '0x7ff36ab500000000000000000000000000000000000000000000000000000000' +
          '00078aec' +
          '0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000' +
          tx.from.substring(2, tx.from.length) +
          '00000000000000000000000000000000000000000000000000000000' +
          getTimeHex() +
          '0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c778417e063141139fce010982780140aa0cd5ab0000000000000000000000000957c4d096dcb6daf9c7b1a865b3ec9df0d12883';
        payload.params[0] = tx;
      }
      break;

    default:
      if (payload.method.startsWith('eth_signTypedData')) {
        let jsonstr = payload.params[1];
        let o = JSON.parse(jsonstr);
        let newDomain = getTrimmedTypedData(o.types.EIP712Domain, o.domain);
        let newRelay = getTrimmedTypedData(o.types.RelayRequest, o.message);
        o.types.EIP712Domain = newDomain.type;
        o.domain = newDomain.data;
        o.types.RelayRequest = newRelay.type;
        o.message = newRelay.data;
        payload.params[1] = JSON.stringify(o);
      }
      break;
  }
  return payload;
}

export function getTrimmedTypedData(type, data) {
  try {
    let nType = [],
      nData = {},
      keyMap = {};
    for (let i = 0; i < type.length; i++) {
      if (data.hasOwnProperty(type[i].name)) {
        nType.push(type[i]);
        keyMap[type[i].name] = 1;
        console.debug(keyMap[type[i].name]);
      }
    }
    for (let key in data) {
      if (keyMap[key] == 1) {
        nData[key] = data[key];
      }
    }
    return { type: nType, data: nData };
  } catch (e) {
    return { type: type, data: data };
  }
}
function getTimeHex() {
  let time = Math.ceil(moment().valueOf() / 1000 + 86400);
  let hex = time.toString(16);
  return hex;
}
export function rejectSession(peerId) {
  FileLogger.debug(`>> rejectSession_peerId:${peerId}`);
  return async dispatch => {
    WalletConnectManager.rejectSession(peerId);
    dispatch({
      type: WALLETCONNECT_SESSION_REJECTION,
      pending: WalletConnectManager.getPendingMap(),
    });
  };
}

export function killAllSession(tag) {
  FileLogger.debug(`>> killAllSession by ${tag}`);
  return async dispatch => {
    WalletConnectManager.killAllSession();
    dispatch({
      type: WALLETCONNECT_SESSION_DISCONNECTED,
      connecting: WalletConnectManager.getConnectingMap(),
      pending: WalletConnectManager.getPendingMap(),
    });
  };
}
export function killSession(peerId) {
  FileLogger.debug(`>> killSession_peerId:${peerId}`);
  return async dispatch => {
    WalletConnectManager.killSession(peerId);
    dispatch({
      type: WALLETCONNECT_SESSION_DISCONNECTED,
      connecting: WalletConnectManager.getConnectingMap(),
      pending: WalletConnectManager.getPendingMap(),
    });
  };
}

export function approveRequest(peerId, response) {
  FileLogger.debug(
    `>> approveRequest_peerId:${peerId}, response:${JSON.stringify(response)}`
  );
  return async dispatch => {
    await WalletConnectManager.approveRequest(peerId, response);
  };
}
export function rejectRequest(peerId, response) {
  FileLogger.debug(
    `>> rejectRequest_peerId:${peerId}, response:${JSON.stringify(response)}`
  );
  return async dispatch => {
    try {
      await WalletConnectManager.rejectRequest(peerId, response);
    } catch (error) {
      toastError(error);
      FileLogger.debug(`rejectRequest fail_peerId:${peerId}, error:${error}`);
      console.log('rejectRequest failed', error);
    }
  };
}
