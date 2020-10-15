import React, { useState } from 'react';
import { View, Animated } from 'react-native';
import { withTheme, FAB } from 'react-native-paper';
import { useNavigation } from 'react-navigation-hooks';
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
import {
  checkCameraPermission,
  getConnectionList,
  renderTabBar,
} from '../Helpers';
import { Api, SCAN_ICON } from '../Constants';
import ConnectionList from '../components/ConnectionList';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { NO_MORE } from './WalletDetailScreen';
import ApiHistoryList from '../components/ApiHistoryList';
import BottomActionMenu from '../components/BottomActionMenu';
import ResultModal, { TYPE_CONFIRM } from '../components/ResultModal';

const FILTER_API_NAME = [
  null,
  Api.sendRawTx,
  Api.cancelTx,
  Api.signTx,
  Api.sign,
  Api.signTyped,
];

const ConnectionListScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  let _scrollX = new Animated.Value(0);
  const ethWallet = useSelector(state => state.wallets.ethWallet);
  const [filterApiName, setFilterApiName] = useState(0);
  const [showMenu1, setShowMenu1] = useState(false);
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
  const [listMode, setListMode] = useState(-1);
  const _onBack = () => {
    goBack();
  };
  const _filterApiName = d => {
    if (FILTER_API_NAME[filterApiName] == null) {
      return true;
    }
    return d.apiName == FILTER_API_NAME[filterApiName];
  };
  const _getFilteredData = rawData => {
    const data =
      listMode == 1
        ? rawData.filter(d => d.head && _filterApiName(d))
        : rawData.filter(d => _filterApiName(d));
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

  const _setFilterApiName = i => {
    setListMode(i < 1 ? 1 : -1);
    setFilterApiName(i);
    setShowMenu1(false);
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
                currentSelect={filterApiName}
                scrollEnabled={true}
                data={[
                  I18n.t('all'),
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
                onChange={_setFilterApiName}
                containerStyle={{ flex: 0, marginVertical: 10 }}
              />
            </View>
            <ApiHistoryList
              data={_getFilteredData(rawDataObj.data)}
              refreshing={loading == GET_NEW}
              onRefresh={_refresh}
              onEndReached={_fetchMoreHistory}
              footLoading={_hasMore() ? loading : NO_MORE}
              listMode={listMode}
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
