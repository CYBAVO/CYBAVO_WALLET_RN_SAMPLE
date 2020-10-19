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
} from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchApiHistory,
  GET_NEW,
  killAllSession,
  killSession,
  NOT_LOADING,
} from '../store/actions';
import NavigationService from '../NavigationService';
import { Container } from 'native-base';
import Styles from '../styles/Styles';
import Headerbar from '../components/Headerbar';
import { SvgXml } from 'react-native-svg';
import {
  checkCameraPermission,
  getChainData,
  getConnectionList,
  getWalletConnectSvg,
  getWalletConnectSvg2,
  getWalletKeyByWallet,
  renderTabBar,
  toastError,
} from '../Helpers';
import { Dimensions } from 'react-native';
import { Theme } from '../styles/MainTheme';
import { DotIndicator } from 'react-native-indicators';
import {
  Api,
  FULL_WIDTH_WITH_PADDING,
  HEADER_BAR_PADDING,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
  SCAN_ICON,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import ConnectionList from '../components/ConnectionList';
import moment from 'moment';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TransactionList from '../components/TransactionList';
import { NO_MORE } from './WalletDetailScreen';
import ApiHistoryList from '../components/ApiHistoryList';
import { Wallets } from '@cybavo/react-native-wallet-service';
import BottomActionMenu from '../components/BottomActionMenu';
import ResultModal, { TYPE_CONFIRM } from '../components/ResultModal';
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
  const connectingList = useSelector(state => {
    return getConnectionList(state.walletconnect.connecting);
  });
  const loading = useSelector(state => {
    if (!state.wallets.ethWallet) {
      return null;
    }
    let key = state.wallets.ethWallet.walletId;
    if (state.apihistory.apihistory[key] == undefined) {
      return null;
    }
    return state.apihistory.apihistory[key].loading;
  });
  const [open, setOpen] = useState(false);
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
        dispatch(killSession(item.peerId));
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
    let key = ethWallet.walletId;
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
  // useEffect(() => {
  //   _refresh();
  // }, [setFilterApiName, setListMode]);
  return (
    <Container style={Styles.bottomContainer}>
      <Headerbar
        // backIcon={require('../assets/image/ic_cancel.png')}
        transparent
        title={I18n.t('walletconnect')}
        onBack={_onBack}
      />
      <ScrollableTabView
        renderTabBar={() => {
          return renderTabBar(theme, _scrollX);
        }}
        onScroll={x => _scrollX.setValue(x)}>
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
                ]}
                onClick={() => {
                  setShowMenu1(true);
                }}
                onCancel={() => {
                  setShowMenu1(false);
                }}
                onChange={_setFilterApiNameIndex}
                containerStyle={{ flex: 0, marginVertical: 10 }}
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
                containerStyle={{ flex: 0, marginVertical: 10, marginLeft: 8 }}
              />
            </View>
            <ApiHistoryList
              data={_getFilteredData(rawDataObj.data)}
              refreshing={loading == GET_NEW}
              onRefresh={_refresh}
              onEndReached={_fetchMoreHistory}
              footLoading={_hasMore() ? loading : NO_MORE}
              onPress={item => {
                navigate('ApiHistoryDetail', { apiHistory: item });
              }}
            />
          </View>
        )}
        <View
          style={{ paddingTop: 8, flex: 1, marginHorizontal: 16 }}
          tabLabel={{ label: I18n.t('connection') }}>
          <ConnectionList data={connectingList} onPress={_killSession} />
          {connectingList.length > 0 ? (
            <FAB.Group
              theme={theme}
              fabStyle={{ backgroundColor: 'white' }}
              open={open}
              onStateChange={v => setOpen(!open)}
              icon={open ? 'close' : 'settings'}
              actions={[
                {
                  icon: 'link-off',
                  onPress: _killAllSession,
                },
                {
                  icon: SCAN_ICON,
                  onPress: async () => {
                    if (await checkCameraPermission()) {
                      NavigationService.navigate('scanModal', {
                        modal: true,
                      });
                    }
                  },
                },
              ]}
            />
          ) : (
            <FAB
              style={Styles.fab}
              icon={SCAN_ICON}
              onPress={async () => {
                if (await checkCameraPermission()) {
                  NavigationService.navigate('scanModal', { modal: true });
                }
              }}
            />
          )}
        </View>
      </ScrollableTabView>

      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          message={result.message}
          errorMsg={result.error}
          type={result.type}
          onButtonClick={result.buttonClick}
          successButtonText={result.successButtonText}
          secondaryConfig={result.secondaryConfig}
        />
      )}
    </Container>
  );
};

export default withTheme(ConnectionListScreen);
