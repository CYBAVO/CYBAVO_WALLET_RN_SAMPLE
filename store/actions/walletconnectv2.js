/**
 * Copyright (c) 2023 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { WalletConnectSdk, Wallets } from '@cybavo/react-native-wallet-service';
const { V2Manager, WalletConnectHelper } = WalletConnectSdk;
import NavigationService from '../../NavigationService';
import { CHAIN_ID, WC_PROJECT_ID } from '../../BuildConfig';
import moment from 'moment';
import { FileLogger } from 'react-native-file-logger';
import I18n from '../../i18n/i18n';
import { EIP155_SIGNING_METHODS } from '../../data/EIP155Data';
import { SOLANA_SIGNING_METHODS } from '../../data/SolanaData';
import { toast, toastError } from '../../Helpers';
import { WC_V2_NOT_QUEUE, WC_V2_QUEUE } from '../../Constants';

export const WC_V2_UPDATE_SESSIONS =
  'walletConnectV2/WALLETCONNECT_UPDATE_SESSIONS';
export const WC_V2_UPDATE_SUPPORTED_CHAIN =
  'walletConnectV2/UPDATE_SUPPORTED_CHAIN';
export const WC_V2_UPDATE_PENDING_REQUEST =
  'walletConnectV2/UPDATE_PENDING_REQUEST';
export const WC_V2_UPDATE_UI = 'walletConnectV2/UPDATE_UI';
export function initAccountWalletMap(wallets) {
  return async (dispatch, getState) => {
    V2Manager.initAccountWalletMap(wallets);
  };
}
export function initSignClient(force, relayUrl) {
  return async (dispatch, getState) => {
    try {
      if (!force && V2Manager.signClient) {
        return;
      }
      let clientMeta = {
        description: I18n.t('app_name'),
        url: 'https://www.cybavo.com/',
        icons: ['https://www.cybavo.com/img/header-logo-color.svg'],
        name: I18n.t('app_name'),
      };
      let opts = { projectId: WC_PROJECT_ID, logger: 'debug' };
      if (relayUrl) {
        opts.relayUrl = relayUrl;
      }
      await V2Manager.initSignClient(opts, clientMeta);
      V2Manager.onSessionProposal = proposal => {
        dispatch(onSessionProposal(proposal));
      };
      V2Manager.onSessionRequest = (requestEvent, address, wallet) => {
        dispatch({
          type: WC_V2_UPDATE_UI,
          dismissUi: true,
        });
        dispatch(onSessionRequest(requestEvent, address, wallet));
      };
      V2Manager.onSessionPin = data => {
        toast(`Ping: ${JSON.stringify(data)}`);
      };
      V2Manager.onSessionUpdate = data => {
        toast(`onSessionUpdate: ${JSON.stringify(data)}`);
      };
      V2Manager.onSessionEvent = data => {
        toast(`onSessionEvent: ${JSON.stringify(data)}`);
      };
      dispatch({ type: WC_V2_UPDATE_SESSIONS, v2RefreshTimestamp: Date.now() });
    } catch (error) {
      toastError(error);
      FileLogger.debug(`initSignClient fail:${error}`);
    }
  };
}
export function dequeueRequest() {
  return async (dispatch, getState) => {
    let map = getState().walletconnect.pendingRequests || {};
    let keys = Object.keys(map);
    if (keys.length === 0) {
      dispatch({
        type: WC_V2_UPDATE_PENDING_REQUEST,
        queueRequest: WC_V2_NOT_QUEUE,
        pendingRequests: map,
      });
    } else {
      let next = map[keys[0]];
      delete map[keys[0]];
      dispatch({
        type: WC_V2_UPDATE_PENDING_REQUEST,
        queueRequest: WC_V2_QUEUE,
        pendingRequests: map,
      });
      NavigationService.navigate(next.routName, {
        requestEvent: next.requestEvent,
        requestSession: next.requestSession,
        wallet: next.wallet,
      });
    }
  };
}
export function handleRequest(
  routName,
  requestEvent,
  requestSession,
  wallet,
  topic
) {
  return async (dispatch, getState) => {
    NavigationService.navigate(routName, {
      requestEvent,
      requestSession,
      wallet,
    });
  };
}
export function onSessionRequest(requestEvent, address, wallet) {
  return async (dispatch, getState) => {
    FileLogger.debug(`onSessionProposal:${JSON.stringify(requestEvent)}`);
    const { topic, params } = requestEvent;
    const { request } = params;
    const requestSession = V2Manager.signClient.session.get(topic);
    if (!wallet) {
      wallet = V2Manager.findWalletByAccount(
        params.chainId,
        address,
        getState().wallets.wallets
      );
    }
    if (!wallet) {
      dispatch(rejectSessionRequest(requestEvent));
      return;
    }
    switch (request.method) {
      case EIP155_SIGNING_METHODS.ETH_SIGN:
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        dispatch(
          handleRequest(
            'Eip155Request',
            requestEvent,
            requestSession,
            wallet,
            topic
          )
        );
        break;
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
        dispatch(
          handleRequest(
            'SolanaRequest',
            requestEvent,
            requestSession,
            wallet,
            topic
          )
        );
        break;
      default:
        dispatch(rejectSessionRequest(requestEvent));
    }
  };
}

export function handleProposal(
  routName,
  proposal,
  namespace,
  allWallets,
  hasWallet
) {
  return async (dispatch, getState) => {
    NavigationService.navigate(routName, {
      proposal,
      namespace,
      allWallets,
      hasWallet,
    });
  };
}

export function onSessionProposal(proposal) {
  return async (dispatch, getState) => {
    FileLogger.debug(`onSessionProposal:${JSON.stringify(proposal)}`);
    let caip2ChainIds = [];
    const { id, params } = proposal;
    const { requiredNamespaces } = params;
    Object.keys(requiredNamespaces).forEach(key => {
      caip2ChainIds = caip2ChainIds.concat(requiredNamespaces[key].chains);
    });
    Wallets.getWalletsByCaip2ChainIds(caip2ChainIds)
      .then(result => {
        FileLogger.debug(
          `getWalletsByCaip2ChainIds:${JSON.stringify(
            caip2ChainIds
          )} | ${JSON.stringify(result)}`
        );
        dispatch(onSessionProposalSub(proposal, result.wallets));
      })
      .catch(error => {
        toastError(error);
        dispatch(onSessionProposalSub(proposal, getState().wallets.wallets));
      });
  };
}

export function onSessionProposalSub(proposal, wallets) {
  return async (dispatch, getState) => {
    wallets = wallets || [];
    let ns = WalletConnectHelper.getNamespaceWithChainWalletsMap(
      proposal,
      wallets
    );
    let supportedChain = getState().walletconnect.supportedChain || {};
    let allWallets = [];
    let hasWallet = false;
    Object.keys(ns).forEach(key => {
      Object.keys(ns[key].chainWalletsMap).forEach(chain => {
        if (supportedChain[chain]) {
          if (!hasWallet) {
            hasWallet = ns[key].chainWalletsMap[chain].length > 0;
          }
          allWallets.push({
            title: supportedChain[chain].chainName,
            support: true,
            chain,
            data: ns[key].chainWalletsMap[chain],
          });
        } else {
          allWallets.push({
            title: chain,
            support: false,
            chain,
            data: [],
          });
        }
      });
    });
    dispatch(
      handleProposal('V2Connecting', proposal, ns, allWallets, hasWallet)
    );
  };
}

export function rejectSessionProposal(proposal) {
  return async (dispatch, getState) => {
    try {
      await V2Manager.rejectSessionProposal(proposal, log => {
        console.log(log);
        FileLogger.debug(log);
      });
    } catch (error) {
      toastError(error);
      console.log(error);
    }
  };
}
export function approveSessionProposal(proposal, chainWalletMap) {
  return async (dispatch, getState) => {
    try {
      await V2Manager.approveSessionProposal(proposal, chainWalletMap, log => {
        console.log(log);
        FileLogger.debug(log);
      });
      dispatch({ type: WC_V2_UPDATE_SESSIONS, v2RefreshTimestamp: Date.now() });
    } catch (error) {
      toastError(error);
      console.log(error);
    }
  };
}
export function rejectSessionRequest(requestEvent) {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: WC_V2_UPDATE_UI,
        dismissUi: false,
      });
      await V2Manager.rejectSessionRequest(requestEvent, log => {
        console.log(log);
        FileLogger.debug(log);
      });
    } catch (error) {
      toastError(error);
      console.log(error);
    }
  };
}
export function approveSessionRequest(requestEvent, result) {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: WC_V2_UPDATE_UI,
        dismissUi: false,
      });
      await V2Manager.approveSessionRequest(requestEvent, result, log => {
        console.log(log);
        FileLogger.debug(log);
      });
    } catch (error) {
      toastError(error);
      console.log(error);
    }
  };
}
export function pair(uri) {
  return async (dispatch, getState) => {
    try {
      await V2Manager.pair(uri);
      // dispatch(testProposal());
    } catch (error) {
      toastError(error);
      console.log(error);
    }
  };
}

export function fetchSupportedChain() {
  return async (dispatch, getState) => {
    try {
      let result = await Wallets.walletConnectGetSupportedChain();
      dispatch({
        type: WC_V2_UPDATE_SUPPORTED_CHAIN,
        chainMap: result.chainMap,
      });
    } catch (error) {
      console.warn('Wallets.fetchSupportedChain failed', error);
    }
  };
}
export function testProposal() {
  return async (dispatch, getState) => {
    try {
      let proposal = {
        id: 1672214749761550,
        params: {
          id: 1672214749761550,
          pairingTopic:
            'dbeb4fb2ce673c7ba4319897a3ac9a9a9134b2b4373918eed3bd9362fcc1f02e',
          expiry: 1672215058,
          requiredNamespaces: {
            eip155: {
              methods: [
                'eth_sendTransaction',
                'eth_signTransaction',
                'eth_sign',
                'personal_sign',
                'eth_signTypedData',
              ],
              chains: [
                'eip155:5',
                'eip155:420',
                'eip155:80001',
                'eip155:421611',
                'eip155:44787',
              ],
              events: ['chainChanged', 'accountsChanged'],
            },
            solana: {
              methods: ['solana_signTransaction', 'solana_signMessage'],
              chains: ['solana:-1'],
              // chains: ['solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K'],
              events: [],
            },
            polkadot: {
              methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
              chains: ['polkadot:e143f23803ac50e8f6f8e62695d1ce9e'],
              events: [],
            },
            near: {
              methods: [
                'near_signIn',
                'near_signOut',
                'near_getAccounts',
                'near_signAndSendTransaction',
                'near_signAndSendTransactions',
              ],
              chains: ['near:testnet'],
              events: [],
            },
            elrond: {
              methods: [
                'erd_signTransaction',
                'erd_signTransactions',
                'erd_signMessage',
                'erd_signLoginToken',
              ],
              chains: ['elrond:D'],
              events: [],
            },
          },
          relays: [{ protocol: 'irn' }],
          proposer: {
            publicKey:
              '7d5864d1141f1c18e5b953bd5387c38e82bac5ae92b9dbc8fbf6bcf59d129d1c',
            metadata: {
              description: 'React App for WalletConnect',
              url: 'https://react-app.walletconnect.com',
              icons: ['https://avatars.githubusercontent.com/u/37784886'],
              name: 'React App',
            },
          },
        },
      };
      dispatch(onSessionProposal(proposal));
    } catch (error) {
      console.log(error);
    }
  };
}
export function disconnect(topic) {
  FileLogger.debug(`>> disconnect:${topic}`);
  return async dispatch => {
    try {
      await V2Manager.disconnect(topic);
    } catch (error) {
      console.log(error);
    }
  };
}
export function disconnectAllSessionPairing() {
  FileLogger.debug('>> disconnectAllSessionPairing');
  return async dispatch => {
    try {
      await V2Manager.disconnectAllSessionPairing();
    } catch (error) {
      console.log(error);
    }
  };
}
