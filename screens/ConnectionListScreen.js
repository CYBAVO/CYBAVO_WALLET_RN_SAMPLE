import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Platform,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import {
  withTheme,
  ActivityIndicator,
  Text,
  FAB,
  Portal,
  IconButton,
} from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { WalletConnectSdk, Wallets } from '@cybavo/react-native-wallet-service';
const { V2Manager, WalletConnectHelper } = WalletConnectSdk;
import { useDispatch, useSelector } from 'react-redux';
import {
  canGoKyc,
  checkApplicantStatusAndNext,
  fetchApiHistory,
  GET_NEW, initSignClient,
  inSuList,
  killAllSession,
  killSession,
  KYC_APPLICANT_STATUS_ERROR,
  KYC_APPLICANT_STATUS_UPDATE,
  NOT_LOADING,
  WC_V2_UPDATE_SESSIONS,
} from '../store/actions';
import NavigationService from '../NavigationService';
import { Container } from 'native-base';
import Styles from '../styles/Styles';
import Headerbar from '../components/Headerbar';
import { FileLogger } from 'react-native-file-logger';
import {
  checkCameraPermission,
  getConnectionList,
  getV2ConnectionList,
  renderTabBar,
  toast,
  toastError,
} from '../Helpers';
import { Dimensions } from 'react-native';
import { Theme } from '../styles/MainTheme';
import { DotIndicator } from 'react-native-indicators';
import {
  ALL_WALLET_ID,
  Api,
  FULL_WIDTH_WITH_PADDING,
  HEADER_BAR_PADDING,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
  SCAN_ICON,
} from '../Constants';
import ConnectionList from '../components/ConnectionList';
import moment from 'moment';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TransactionList from '../components/TransactionList';
import { NO_MORE } from './WalletDetailScreen';
import ApiHistoryList from '../components/ApiHistoryList';
import BottomActionMenu from '../components/BottomActionMenu';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
} from '../components/ResultModal';
import { KycHelper } from '../utils/KycHelper';
const { height } = Dimensions.get('window');
const DOT_SIZE = 6;

const FILTER_API_NAME = [
  null,
  null,
  Api.sendRawTx,
  Api.cancelTx,
  Api.signTx,
  Api.sign,
  Api.signTyped,
  Api.sol_signTx,
  Api.sol_sign,
];

const FILTER_CANCELABLE = [null, [true], [false, null]];

const ConnectionListScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  let _scrollX = new Animated.Value(0);
  const ethWallet = useSelector(state => state.wallets.ethWallet);
  const [filterApiNameIndex, setFilterApiNameIndex] = useState(0);
  const [filterCancelableIndex, setFilterCancelableIndex] = useState(0);
  const [showMenu1, setShowMenu1] = useState(false);
  const [showMenu2, setShowMenu2] = useState(false);
  const [result, setResult] = useState(null);
  const [normalLoading, setNormalLoading] = useState(false);
  const wallets = useSelector(state => state.wallets.wallets);
  const v2RefreshTimestamp = useSelector(
    state => state.walletconnect.v2RefreshTimestamp
  );
  const supportedChainMap = useSelector(
    state => state.walletconnect.supportedChain || {}
  );
  const [v2ConnectionList, setV2ConnectionList] = useState(
    getV2ConnectionList(V2Manager.signClient, supportedChainMap)
  );
  const v1ConnectionList = useSelector(state => {
    return getConnectionList(state.walletconnect.connecting);
  });
  const kycResult = useSelector(state => state.kyc.applicantStatus.result);
  const kycUserExist = useSelector(state => state.kyc.userExist);
  const loading = useSelector(state => {
    if (!state.wallets.ethWallet) {
      return null;
    }
    let key = ALL_WALLET_ID;
    if (state.apihistory.apihistory[key] == undefined) {
      return null;
    }
    return state.apihistory.apihistory[key].loading;
  });

  const [open, setOpen] = useState(false);
  const _checkApplicantDataAndNext = (next = () => {}) => {
    checkApplicantStatusAndNext(
      kycResult,
      (result, update) => {
        if (update) {
          dispatch({ type: KYC_APPLICANT_STATUS_UPDATE, result });
        }
        next();
      },
      (result, update, reason) => {
        if (update) {
          dispatch({ type: KYC_APPLICANT_STATUS_UPDATE, result });
        }
        let isSu = inSuList();
        if (canGoKyc(result)) {
          setResult({
            title: I18n.t('kyc_block_init_title'),
            message: I18n.t('kyc_block_init_desc'),
            type: TYPE_FAIL,
            failButtonText: I18n.t('kyc_block_go'),
            buttonClick: () => {
              setResult(null);
              KycHelper.getLanguageAndStartKyc(
                kycUserExist,
                setNormalLoading,
                dispatch,
                setResult
              );
            },
            secondaryConfig: {
              color: theme.colors.primary,
              text: isSu ? I18n.t('skip') : I18n.t('kyc_block_later'),
              onClick: () => {
                setResult(null);
                if (isSu) {
                  next();
                }
              },
            },
          });
        } else {
          setResult({
            title: I18n.t('kyc_block_pending_title'),
            message: I18n.t('kyc_block_pending_desc'),
            type: TYPE_CONFIRM,
            successButtonText: I18n.t('kyc_block_pending_ok'),
            buttonClick: () => {
              setResult(null);
              KycHelper.getLanguageAndStartKyc(
                kycUserExist,
                setNormalLoading,
                dispatch,
                setResult
              );
            },
            secondaryConfig: {
              color: theme.colors.primary,
              text: isSu ? I18n.t('skip') : I18n.t('kyc_block_pending_cancel'),
              onClick: () => {
                setResult(null);
                if (isSu) {
                  next();
                }
              },
            },
          });
        }
      },
      error => {
        dispatch({ type: KYC_APPLICANT_STATUS_ERROR, error });
        setResult({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t('check_failed'),
          buttonClick: () => {
            setResult(null);
          },
        });
      }
    );
  };
  const _onBack = () => {
    goBack();
  };
  const _filterApiName = d => {
    if (FILTER_API_NAME[filterApiNameIndex] == null) {
      return true;
    }
    return d.apiName == FILTER_API_NAME[filterApiNameIndex];
  };
  const _filterCancelable = d => {
    if (FILTER_CANCELABLE[filterCancelableIndex] == null) {
      return true;
    }
    return FILTER_CANCELABLE[filterCancelableIndex].includes(d.cancelable);
  };
  const _getFilteredData = rawData => {
    let data;
    switch (filterApiNameIndex) {
      case 0:
        data = rawData.filter(d => d.head && _filterCancelable(d));
        break;
      case 1:
        data = rawData.filter(d => _filterCancelable(d));
        break;
      default:
        data = rawData.filter(d => _filterApiName(d) && _filterCancelable(d));
        break;
    }
    data.sort((a, b) => b.timestamp - a.timestamp);
    return data;
  };
  const _refresh = () => {
    dispatch(fetchApiHistory(true, 0));
  };
  const _killAllSession = async () => {
    setResult({
      title: I18n.t('disconnect'),
      message: I18n.t('kill_all_session_confirm_message'),
      type: TYPE_CONFIRM,
      successButtonText: I18n.t('disconnect_all'),
      buttonClick: () => {
        dispatch(killAllSession('buttonClick'));
        V2Manager.disconnectAllSessionPairing()
          .then(() => {
            setV2ConnectionList([]);
          })
          .catch(e => {
            toastError(e);
            setV2ConnectionList([]);
          });
        setResult(null);
      },
      secondaryConfig: {
        color: theme.colors.primary,
        text: I18n.t('cancel'),
        onClick: () => {
          setResult(null);
        },
      },
    });
  };
  const _killSession = async item => {
    setResult({
      title: I18n.t('disconnect'),
      message: I18n.t('kill_the_session_confirm_message', item),
      type: TYPE_CONFIRM,
      successButtonText: I18n.t('disconnect'),
      buttonClick: () => {
        if (item.session) {
          V2Manager.disconnect(item.session.topic)
            .then(() => {
              setV2ConnectionList(
                getV2ConnectionList(V2Manager.signClient, supportedChainMap)
              );
            })
            .catch(e => {
              console.log(e);
              toastError(e);
              setV2ConnectionList(
                getV2ConnectionList(V2Manager.signClient, supportedChainMap)
              );
            });
        } else {
          dispatch(killSession(item.peerId));
        }
        setResult(null);
      },
      secondaryConfig: {
        color: theme.colors.primary,
        text: I18n.t('cancel'),
        onClick: () => {
          setResult(null);
        },
      },
    });
  };

  const rawDataObj = useSelector(state => {
    if (state.apihistory.apihistory == null) {
      return { start: 0, total: 0, data: [] };
    }
    let key = ALL_WALLET_ID;
    if (
      state.apihistory.apihistory[key] == null ||
      state.apihistory.apihistory[key].data == null
    ) {
      return { start: 0, total: 0, data: [] };
    }
    return {
      start: state.apihistory.apihistory[key].start,
      total: state.apihistory.apihistory[key].total,
      data: Object.values(state.apihistory.apihistory[key].data),
    };
  });
  const _hasMore = () => rawDataObj.start + 10 < rawDataObj.total;
  const _fetchMoreHistory = () => {
    if (_hasMore() && loading == NOT_LOADING) {
      dispatch(fetchApiHistory(true, rawDataObj.start + 10));
    }
  };

  const _setFilterApiNameIndex = i => {
    setFilterApiNameIndex(i);
    setShowMenu1(false);
  };
  const _setFilterCancelableIndex = i => {
    setFilterCancelableIndex(i);
    setShowMenu2(false);
  };
  useEffect(() => {
    V2Manager.onSessionDelete = data => {
      setTimeout(() => {
        dispatch({
          type: WC_V2_UPDATE_SESSIONS,
          v2RefreshTimestamp: Date.now(),
        });
      }, 1000);
      toast(`onSessionDelete: ${JSON.stringify(data)}`);
      FileLogger.debug(`onSessionDelete:${JSON.stringify(data)}`);
    };
    return () => {
      V2Manager.onSessionDelete = null;
    };
  }, []);
  useEffect(() => {
    let list = getV2ConnectionList(V2Manager.signClient, supportedChainMap);
    setV2ConnectionList(list);
    FileLogger.debug(`getV2ConnectionList:${JSON.stringify(list)}`);
  }, [v2RefreshTimestamp]);
  return (
    <Container style={Styles.bottomContainer}>
      <Headerbar
        // backIcon={require('../assets/image/ic_cancel.png')}
        transparent
        title={I18n.t('walletconnect')}
        onBack={_onBack}
        actions={
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              borderless
              style={{
                marginRight: HEADER_BAR_PADDING,
                justifyContent: 'center',
              }}
              // accessibilityLabel={clearAccessibilityLabel}
              color={'rgba(255, 255, 255, 0.56)'}
              // rippleColor={rippleColor}
              onPress={() => {
                setResult({
                  title: I18n.t('clear_wc_storage'),
                  message: I18n.t('clear_wc_storage_confirm_message'),
                  type: TYPE_CONFIRM,
                  successButtonText: I18n.t('clear'),
                  buttonClick: () => {
                    V2Manager.clearStorage()
                      .then(() => {
                        dispatch(initSignClient(true));
                      })
                      .catch(e => {
                        toastError(e);
                        setV2ConnectionList(
                          getV2ConnectionList(
                            V2Manager.signClient,
                            supportedChainMap
                          )
                        );
                      });
                    setResult(null);
                  },
                  secondaryConfig: {
                    color: theme.colors.primary,
                    text: I18n.t('cancel'),
                    onClick: () => {
                      setResult(null);
                    },
                  },
                });
              }}
              icon={({ size, color }) => (
                <Image
                  source={require('../assets/image/ic_delete.png')}
                  style={{ width: 24, height: 24 }}
                />
              )}
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
            />
          </View>
        }
      />
      <ScrollableTabView
        renderTabBar={() => {
          return renderTabBar(theme, _scrollX);
        }}
        onScroll={x => _scrollX.setValue(x)}>
        <View
          style={{ paddingTop: 8, flex: 1, marginHorizontal: 16 }}
          tabLabel={{ label: I18n.t('connections') }}>
          <ConnectionList
            data={v2ConnectionList.concat(v1ConnectionList)}
            onPress={_killSession}
          />
          {v2ConnectionList.concat(v1ConnectionList).length > 0 ? (
            <FAB.Group
              theme={theme}
              color={theme.colors.primary}
              fabStyle={{ backgroundColor: theme.colors.pickerBg }}
              open={open}
              onStateChange={v => setOpen(!open)}
              icon={open ? 'close' : require('../assets/image/ic_setting.png')}
              actions={[
                {
                  icon: 'link-off',
                  color: theme.colors.primary,
                  style: { backgroundColor: theme.colors.pickerBg },
                  onPress: _killAllSession,
                },
                {
                  icon: SCAN_ICON,
                  color: theme.colors.primary,
                  style: { backgroundColor: theme.colors.pickerBg },
                  onPress: () => {
                    _checkApplicantDataAndNext(async () => {
                      if (await checkCameraPermission()) {
                        NavigationService.navigate('scanModal', {
                          modal: true,
                        });
                      }
                    });
                  },
                },
              ]}
            />
          ) : (
            <FAB
              style={[Styles.fab, { marginRight: 0 }]}
              icon={SCAN_ICON}
              color={theme.colors.primary}
              onPress={() => {
                _checkApplicantDataAndNext(async () => {
                  if (await checkCameraPermission()) {
                    NavigationService.navigate('scanModal', {
                      modal: true,
                    });
                  }
                });
              }}
            />
          )}
        </View>

        {rawDataObj.data.length > 0 && (
          <View
            style={{ paddingTop: 8, flex: 1, marginHorizontal: 16 }}
            tabLabel={{ label: I18n.t('api_history') }}>
            <View
              style={{
                flexDirection: 'row',
                paddingVertical: 0,
              }}>
              <BottomActionMenu
                visible={showMenu1}
                currentSelect={filterApiNameIndex}
                scrollEnabled={true}
                data={[
                  I18n.t('all_group_by_nonce'),
                  I18n.t('all_ungroup'),
                  Api.sendRawTx,
                  Api.cancelTx,
                  Api.signTx,
                  Api.sign,
                  Api.signTyped,
                  Api.sol_signTx,
                  Api.sol_sign,
                ]}
                onClick={() => {
                  setShowMenu1(true);
                }}
                onCancel={() => {
                  setShowMenu1(false);
                }}
                onChange={_setFilterApiNameIndex}
                containerStyle={{
                  flex: 0,
                  marginVertical: 10,
                  backgroundColor: theme.colors.filterBgColor,
                }}
              />
              <BottomActionMenu
                visible={showMenu2}
                currentSelect={filterCancelableIndex}
                scrollEnabled={true}
                data={[
                  I18n.t('all_progress'),
                  I18n.t('cancelable'),
                  I18n.t('uncancelable'),
                ]}
                onClick={() => {
                  setShowMenu2(true);
                }}
                onCancel={() => {
                  setShowMenu2(false);
                }}
                onChange={_setFilterCancelableIndex}
                containerStyle={{
                  flex: 0,
                  marginVertical: 10,
                  marginLeft: 8,
                  backgroundColor: theme.colors.filterBgColor,
                }}
              />
            </View>
            <ApiHistoryList
              data={_getFilteredData(rawDataObj.data)}
              refreshing={loading == GET_NEW}
              onRefresh={_refresh}
              onEndReached={_fetchMoreHistory}
              footLoading={_hasMore() ? loading : NO_MORE}
              onPress={item => {
                const r = wallets.filter(w => w.walletId === item.walletId);
                if (r.length > 0) {
                  item.wallet = r[0];
                }
                navigate('ApiHistoryDetail', { apiHistory: item });
              }}
            />
          </View>
        )}
      </ScrollableTabView>

      {normalLoading && (
        <ActivityIndicator
          color={theme.colors.primary}
          size="large"
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: height / 2,
          }}
        />
      )}
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          message={result.message}
          errorMsg={result.error}
          type={result.type}
          onButtonClick={result.buttonClick}
          successButtonText={result.successButtonText}
          failButtonText={result.failButtonText}
          secondaryConfig={result.secondaryConfig}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#00000040',
  },
  request_message: {
    fontSize: 16,
    marginVertical: 16,
    color: Theme.colors.resultContent,
    textAlign: 'center',
  },
  permission_message: {
    fontSize: 16,
    color: Theme.colors.pinDisplayInactivate,
    width: '90%',
  },
  barBlock: {
    backgroundColor: Theme.colors.pickerBgTransparent,
    marginTop: 10,
    paddingVertical: HEADER_BAR_PADDING,
    paddingRight: 6,
    width: '100%',
    paddingLeft: 2,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 6,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Theme.colors.pinDisplayInactivate,
    marginHorizontal: 12,
    alignSelf: 'center',
    marginRight: 16,
  },
});
export default withTheme(ConnectionListScreen);
