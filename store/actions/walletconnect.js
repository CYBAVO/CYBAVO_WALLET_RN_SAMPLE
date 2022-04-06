/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { WalletConnectSdk, Wallets } from '@cybavo/react-native-wallet-service';
import { hasValue, toast, toastError } from '../../Helpers';
const { WalletConnectManager, WalletConnectHelper } = WalletConnectSdk;
import NavigationService from '../../NavigationService';
import { CHAIN_ID } from '../../BuildConfig';
import moment from 'moment';
import { FileLogger } from 'react-native-file-logger';
import I18n from '../../i18n/i18n';
import { TYPE_FAIL } from '../../components/ResultModal';

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

export const WALLETCONNECT_UPDATE_API_VERSION =
  'walletConnect/WALLETCONNECT_UPDATE_API_VERSION';

function defaultSelectWallet(
  dispatch,
  getState,
  connectorWrapper,
  payload,
  returnChainId,
  returnAddress,
  ethWallet,
  errorInfo = ''
) {
  if (!ethWallet) {
    console.debug(`error getWalletsByChainIds:${errorInfo}`);
    rejectSession(connectorWrapper.getConnector().peerId);
    NavigationService.navigate('Connecting', {
      leave: I18n.t('no_available_wallet_msg2', {
        info: errorInfo,
      }),
    });
    return;
  }

  // FileLogger.debug(`sessionRequest:${JSON.stringify(payload)}`);
  dispatch({
    type: WALLETCONNECT_SESSION_REQUEST,
    pending: WalletConnectManager.getPendingMap(),
  });
  let w = { ...ethWallet, chainId: getState().auth.config == 'test' ? 3 : 1 };
  NavigationService.navigate('Connecting', {
    peerId: connectorWrapper.getConnector().peerId,
    peerName: connectorWrapper.getConnector().peerMeta.name,
    payload,
    wallets: [w],
    chainId: -1,
    returnAddress,
    returnChainId,
  });
}

export function newSession(uri, returnAddress, returnChainId, ethWallet) {
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
        `>> newSession:${uri},returnAddress:${returnAddress ||
          ''},returnChainId${returnChainId || ''}, ,${getState().auth.config}`
      );
      let connectorWrapper = WalletConnectManager.newSession(
        uri,
        '', //set later
        0, //set later
        clientMeta,
        (error, payload) => {
          if (error) {
            FileLogger.debug(`sessionRequest error:${error}`);
            toastError(error);
            return;
          }
          if (false) {
            defaultSelectWallet(
              dispatch,
              getState,
              connectorWrapper,
              payload,
              returnChainId,
              returnAddress,
              ethWallet,
              'test'
            );
            return;
          }
          let chainId = -1; // payload.params[0].chainId
          Wallets.getWalletsByChainIds([chainId])
            .then(result => {
              let wallets = result.wallets.filter(
                w => !w.isPrivate && !hasValue(w.tokenAddress)
              );
              if (wallets.length == 0) {
                defaultSelectWallet(
                  dispatch,
                  getState,
                  connectorWrapper,
                  payload,
                  returnChainId,
                  returnAddress,
                  ethWallet,
                  chainId
                );
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
                wallets: wallets,
                chainId: chainId,
                returnAddress,
                returnChainId,
              });
            })
            .catch(error => {
              defaultSelectWallet(
                dispatch,
                getState,
                connectorWrapper,
                payload,
                returnChainId,
                returnAddress,
                ethWallet,
                error
              );
            });
        }
      );

      NavigationService.navigate('Connecting', {}); //TODO:wc
    } catch (error) {
      FileLogger.debug(`newSession fail:${error}`);
    }
  };
}
export function approveSession(
  peerId,
  peerName,
  response: { accounts: string[], chainId: number },
  wallet
) {
  return async (dispatch, getState) => {
    // if (getState().auth.config == 'test') {
    //   response.accounts = ['0xaad9ebc005efa45f53e59ff8dadba14e59225155'];
    // }
    FileLogger.debug(
      `>> approveSession_peerId:${peerId}, response:${JSON.stringify(response)}`
    );
    WalletConnectManager.approveSessionAndSetInfo(
      peerId,
      {
        accounts: response.accounts,
        chainId: response.chainId,
      },
      wallet.address,
      wallet.walletId,
      response.chainId,
      (error: any, payload: any) => {
        if (error) {
          FileLogger.debug(`callRequest error:${error}`);
          toastError(error);
          return;
        }
        FileLogger.debug(`callRequest:${JSON.stringify(payload)}`);
        let handleResult = getHandledPayload(
          peerId,
          payload,
          getState().auth.config
        );
        if (handleResult.error) {
          FileLogger.debug(`handleResult error:${handleResult.error}`);
          NavigationService.navigate('GlobalModal', {
            config: {
              title: I18n.t('walletconnect'),
              errorMsg: handleResult.error,
              type: TYPE_FAIL,
            },
          });
          rejectRequest(peerId, {
            id: payload.id,
            error: { message: handleResult.error },
          });
          return;
        }
        NavigationService.navigate('Request', {
          peerId,
          payload: handleResult.payload,
          wallet: wallet,
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
    return { payload: payload };
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
    case 'eth_sign':
    case 'personal_sign':
    case 'eth_sendRawTransaction':
    case 'eth_sign':
      break;
    default:
      if (payload.method.startsWith('eth_signTypedData')) {
        payload = getPayloadForSignTypedData(payload);
      } else {
        return {
          error: `${I18n.t('unsupported_operation')}: ${payload.method}`,
        };
      }
      break;
  }
  return { payload: payload };
}
function getPayloadForSignTypedData(payload) {
  if (false) {
    payload.params[1] =
      '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"holder","type":"address"},{"name":"spender","type":"address"},{"name":"nonce","type":"uint256"},{"name":"expiry","type":"uint256"},{"name":"allowed","type":"bool"}]},"domain":{"name":"Dai Stablecoin","version":"1","verifyingContract":"0x6B175474E89094C44Da98b954EedeAC495271d0F","chainId":1},"primaryType":"Permit","message":{"holder":"0x7d03149A2843E4200f07e858d6c0216806Ca4242","spender":"0xE592427A0AEce92De3Edee1F18E0157C05861564","allowed":true,"nonce":0,"expiry":1633072018}}';
  }
  let jsonstr = payload.params[1];
  let o = JSON.parse(jsonstr);
  let newDomain = getTrimmedTypedData(o.types.EIP712Domain, o.domain);
  let newRelay = getTrimmedTypedData(o.types.RelayRequest, o.message);
  o.types.EIP712Domain = newDomain.type;
  o.domain = newDomain.data;
  o.types.RelayRequest = newRelay.type;
  o.message = newRelay.data;
  payload.typedData = o;
  payload = checkPermit(payload, o);
  payload.params[1] = JSON.stringify(o);
  return payload;
}
export function checkPermit(payload, o) {
  try {
    if (o.primaryType == 'Permit') {
      payload.isPermit = true;
      payload.domainName = o.domain.name || 'Token';
      payload.verifyingContract = o.domain.verifyingContract;
    }
    return payload;
  } catch (e) {
    return payload;
  }
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
