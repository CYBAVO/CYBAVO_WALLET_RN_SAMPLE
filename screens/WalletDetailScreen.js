import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  Image,
  InteractionManager,
} from 'react-native';
import { Container, Button } from 'native-base';
const { width, height } = Dimensions.get('window');
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { startColors, endColors, Theme } from '../styles/MainTheme';
import {
  Coin,
  HEADER_BAR_PADDING,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
  ROUND_BUTTON_MEDIUM_HEIGHT,
} from '../Constants';
import Styles from '../styles/Styles';
const RECEIVE_ICON = require('../assets/image/receive.png');
const SEND_ICON = require('../assets/image/send.png');
import I18n from '../i18n/i18n';
import { useAppState } from '@react-native-community/hooks';
import BackgroundImage from '../components/BackgroundImage';
import TransactionList from '../components/TransactionList';
import { fetchWallet, WALLETS_UPDATE_WALLET } from '../store/actions/wallets';
import {
  fetchBalance,
  fetchTransaction,
  GET_MORE,
  GET_NEW,
  NOT_LOADING,
} from '../store/actions';
import { Wallets } from '@cybavo/react-native-wallet-service';
import moment from 'moment';
import CopyableText from '../components/CopyableText';
import { CardPatternImg } from '../components/CurrencyIcon';
import BalanceText from '../components/BalanceText';
import CurrencyPriceText from '../components/CurrencyPriceText';
import Headerbar from '../components/Headerbar';
import {
  Text,
  withTheme,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import InputMessageModal from '../components/InputMessageModal';
import { getWalletKeyByWallet } from '../Helpers';
import BottomActionMenu from '../components/BottomActionMenu';
import RoundButton2 from '../components/RoundButton2';
import LinearGradient from 'react-native-linear-gradient';
import { DotIndicator } from 'react-native-indicators';
export const NO_MORE = -1;
const HEADER_EXPANDED_HEIGHT = 238;
import ContentLoader, { Rect } from 'react-content-loader/native';
import BalanceTextLite from '../components/BalanceTextLite';
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import NavigationService from "../NavigationService";
const MyLoader = props => {
  let line2Top = HEADER_EXPANDED_HEIGHT * 0.35;
  let line2Left = width / 2 - 54;
  let line2Width1 = 88;
  return (
    <ContentLoader
      speed={0.6}
      width={width}
      height={HEADER_EXPANDED_HEIGHT}
      viewBox={`0 0 ${width} ${HEADER_EXPANDED_HEIGHT}`}
      backgroundColor="#1b2023"
      foregroundColor="#3c4354"
      {...props}>
      <Rect
        x={width / 2 - 31}
        y={line2Top - 20}
        rx="3"
        ry="3"
        width="76"
        height="10"
      />
      <Rect
        x={line2Left}
        y={line2Top}
        rx="3"
        ry="3"
        width={line2Width1}
        height="10"
      />
      <Rect
        x={line2Left + line2Width1 + 5}
        y={line2Top}
        rx="3"
        ry="3"
        width="33"
        height="10"
      />
      <Rect
        x={width / 2 - 31}
        y={line2Top + 20}
        rx="3"
        ry="3"
        width="80"
        height="10"
      />
      <Rect
        x="25"
        y={HEADER_EXPANDED_HEIGHT * 0.79}
        rx="3"
        ry="3"
        width={width - 50}
        height="12"
      />
    </ContentLoader>
  );
};
const MyListLoader = props => {
  let h = height - HEADER_EXPANDED_HEIGHT;
  let y1 = 38;
  let y2 = 51;
  let y3 = 63;
  let marginTop = 90;
  let marginLeft = 25;
  return (
    <ContentLoader
      speed={0.6}
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      backgroundColor="#1C223A"
      foregroundColor="#292F45"
      {...props}>
      {[0, 1, 2, 3, 4].map(i => (
        <React.Fragment key={i}>
          <Rect
            x={marginLeft}
            y={y1 + marginTop * i}
            rx="3"
            ry="3"
            width="52"
            height="10"
          />
          <Rect
            x={marginLeft + 52 + 10}
            y={y1 + marginTop * i}
            rx="3"
            ry="3"
            width="33"
            height="10"
          />
          <Rect
            x={width - marginLeft - 64}
            y={y2 + marginTop * i}
            rx="3"
            ry="3"
            width="64"
            height="10"
          />
          <Rect
            x={marginLeft}
            y={y3 + marginTop * i}
            rx="3"
            ry="3"
            width="220"
            height="10"
          />
        </React.Fragment>
      ))}
    </ContentLoader>
  );
};
const WalletDetailScreen: () => React$Node = ({ theme }) => {
  const [ready, setReady] = useState(false);
  const appState = useAppState();
  const FILTER_DIRECTION = [
    null,
    Wallets.Transaction.Direction.IN,
    Wallets.Transaction.Direction.OUT,
  ];
  const FILTER_PENDING = [null, true, false];
  const FILTER_SUCCESS = [null, true, false];
  const FILTER_TIME_ALL = 0;
  const FILTER_TIME_TODAY = 1;
  const FILTER_TIME_YESTERDAY = 2;

  const [showModal, setShowModal] = useState(false);
  const [showMenu1, setShowMenu1] = useState(false);
  const [showMenu2, setShowMenu2] = useState(false);
  const [showMenu3, setShowMenu3] = useState(false);
  const [showMenu4, setShowMenu4] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [result, setResult] = useState(null);
  const wallet = useNavigationParam('wallet');
  const [walletName, setWalletName] = useState(wallet.name);
  const { navigate, goBack } = useNavigation();
  const dispatch = useDispatch();
  const globalModal = useSelector(state => {
    return state.auth.globalModal || {};
  });
  const balanceItem = useSelector(state => {
    if (!state.balance.balances) {
      return null;
    }
    let key = getWalletKeyByWallet(wallet);
    if (state.balance.balances[key] == null) {
      return null;
    }
    // if already show UI, don't make balanceItem null
    if (ready == false && state.balance.balances[key].loading != false) {
      return null;
    }
    return state.balance.balances[key];
  });
  const rawDataObj = useSelector(state => {
    if (state.transactions.transactions == null) {
      return { start: 0, total: 0, data: [] };
    }
    let key = getWalletKeyByWallet(wallet);
    if (
      state.transactions.transactions[key] == null ||
      state.transactions.transactions[key].data == null
    ) {
      return { start: 0, total: 0, data: [] };
    }
    return {
      start: state.transactions.transactions[key].start,
      total: state.transactions.transactions[key].total,
      data: Object.values(state.transactions.transactions[key].data),
    };
  });
  const loading = useSelector(state => {
    let key = getWalletKeyByWallet(wallet);
    if (state.transactions.transactions[key] == undefined) {
      return null;
    }
    if (state.transactions.transactions[key].loading == undefined) {
      return null;
    }
    return state.transactions.transactions[key].loading;
  });

  useEffect(() => {
    if (globalModal.isShow && globalModal.isNews) {
      NavigationService.navigate('GlobalModal', { isNews: true });
    }
  }, [globalModal]);
  useEffect(() => {
    if (loading == NOT_LOADING && balanceItem != null && ready == false) {
      setReady(true);
    }
  }, [loading, balanceItem, ready]);
  useEffect(() => {
    if (appState == 'active' && ready) {
      _refresh();
    }
  }, [appState]);
  // const [filteredData, setFilteredData] = useState([]);
  // const [historyHasMore, setHistoryHasMore] = useState(true);
  const [filterTime, setFilterTime] = useState(0);
  const [filterDirection, setFilterDirection] = useState(0);
  const [filterPending, setFilterPending] = useState(0);
  const [filterSuccess, setFilterSuccess] = useState(0);
  if (!wallet) {
    console.warn('No wallet specified');
    goBack();
  }
  //refresh
  useEffect(() => {
    _refresh();
  }, [
    setFilterSuccess,
    setFilterPending,
    setFilterDirection,
    setFilterTime,
    _refresh,
  ]);
  //init data
  useEffect(() => {
    // dispatch(fetchWallet(wallet.walletId));
    dispatch(
      fetchBalance(wallet.currency, wallet.tokenAddress, wallet.address, false)
    );
    dispatch(
      fetchTransaction(
        wallet.currency,
        wallet.tokenAddress,
        wallet.address,
        wallet.currencySymbol,
        wallet.isNft,
        true
      )
    );
  }, [dispatch, wallet]);
  const _getFilters = () => {
    let filters = {
      direction: FILTER_DIRECTION[filterDirection],
      pending: FILTER_PENDING[filterPending],
      success: FILTER_SUCCESS[filterSuccess],
    };

    if (filterTime === FILTER_TIME_TODAY) {
      filters = {
        ...filters,
        start_time: moment()
          .startOf('day')
          .unix(),
        end_time: moment().unix(),
      };
    } else if (filterTime === FILTER_TIME_YESTERDAY) {
      filters = {
        ...filters,
        start_time: moment()
          .startOf('day')
          .subtract(1, 'days')
          .unix(),
        end_time: moment()
          .startOf('day')
          .unix(),
      };
    }
    return filters;
  };
  const _filter = (t, filters) => {
    return (
      _filterDirection(t, filters) &&
      _filterPending(t, filters) &&
      _filterSuccess(t, filters) &&
      _filterStartTime(t, filters) &&
      _filterEndTime(t, filters)
    );
  };
  const _filterDirection = (t, filters) => {
    if (filters.direction == null) {
      return true;
    }
    let isOut = filters.direction == Wallets.Transaction.Direction.OUT;
    return t.out == isOut;
  };
  const _filterPending = (t, filters) => {
    if (filters.pending == null) {
      return true;
    }
    return t.pending == filters.pending;
  };
  const _filterSuccess = (t, filters) => {
    if (filters.success == null) {
      return true;
    }
    return t.success == filters.success;
  };
  const _filterStartTime = (t, filters) => {
    if (filters.start_time == null) {
      return true;
    }
    return t.timestamp >= filters.start_time;
  };
  const _filterEndTime = (t, filters) => {
    if (filters.end_time == null) {
      return true;
    }
    return t.timestamp <= filters.end_time;
  };
  const _getFilteredData = rawData => {
    let filters = _getFilters();
    const data = rawData.filter(t => _filter(t, filters));
    // return data.slice(0, rawDataObj.start + 10);
    data.sort((a, b) => b.timestamp - a.timestamp);
    return data;
  };
  const _hasMore = () => rawDataObj.start + 10 < rawDataObj.total;
  const _fetchMoreHistory = () => {
    if (_hasMore() && loading == NOT_LOADING) {
      dispatch(
        fetchTransaction(
          wallet.currency,
          wallet.tokenAddress,
          wallet.address,
          wallet.currencySymbol,
          wallet.isNft,
          true,
          rawDataObj.start + 10,
          _getFilters()
        )
      );
    }
  };
  const _goTransactionDetail = transaction => {
    navigate('TransactionDetail', {
      wallet,
      transaction,
      onComplete: _refresh,
    });
  };
  const _refresh = () => {
    dispatch(
      fetchTransaction(
        wallet.currency,
        wallet.tokenAddress,
        wallet.address,
        wallet.currencySymbol,
        wallet.isNft,
        true,
        0,
        _getFilters()
      )
    );
    dispatch(
      fetchBalance(wallet.currency, wallet.tokenAddress, wallet.address, false)
    );
  };
  const _setFilterPending = pending => {
    setFilterPending(pending);
    setShowMenu3(false);
  };
  const _setFilterSuccess = success => {
    setFilterSuccess(success);
    setShowMenu4(false);
  };
  const _setFilterTime = time => {
    setFilterTime(time);
    setShowMenu2(false);
  };
  const _setFilterDirection = direction => {
    setFilterDirection(direction);
    setShowMenu1(false);
  };
  const _performRename = async newName => {
    setRenameLoading(true);
    try {
      await Wallets.renameWallet(wallet.walletId, newName);
      setWalletName(newName);
      let w = { ...wallet, name: newName };
      dispatch({
        type: WALLETS_UPDATE_WALLET,
        walletId: wallet.walletId,
        wallet: w,
      });
      setResult({
        type: TYPE_SUCCESS,
        successButtonText: I18n.t('done'),
        title: I18n.t('change_successfully'),
        message: I18n.t('rename_wallet_success_desc'),
        buttonClick: () => {
          setResult(null);
        },
      });
    } catch (error) {
      console.log('_renameWallet failed', error);
      setResult({
        type: TYPE_FAIL,
        error: I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        }),
        title: I18n.t('change_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setRenameLoading(false);
    setShowModal(false);
  };
  let currencySymbol = wallet.isNft ? '' : wallet.currencySymbol;
  let startColor = startColors[wallet.currencySymbol] || startColors.UNKNOWN;
  let endColor = endColors[wallet.currencySymbol] || endColors.UNKNOWN;

  return ready ? (
    <Container style={Styles.container}>
      <BackgroundImage
        containerStyle={Styles.detailBackgroundImage}
        imageStyle={Styles.detailCardPattern}
        imageSource={CardPatternImg}
        startColor={startColor}
        endColor={endColor}>
        <View>
          <Headerbar
            transparent
            title={walletName}
            onBack={() => goBack()}
            actions={
              <View style={{ flexDirection: 'row' }}>
                {Coin.EOS === wallet.currency && (
                  <IconButton
                    borderless
                    // accessibilityLabel={clearAccessibilityLabel}
                    color={'rgba(255, 255, 255, 0.56)'}
                    // rippleColor={rippleColor}
                    onPress={() => navigate('EosResource', { wallet: wallet })}
                    icon={({ size, color }) => (
                      <Image
                        source={require('../assets/image/ic_resource.png')}
                        style={{ width: 24, height: 24 }}
                      />
                    )}
                    accessibilityTraits="button"
                    accessibilityComponentType="button"
                    accessibilityRole="button"
                  />
                )}
                <IconButton
                  borderless
                  style={{
                    marginRight: HEADER_BAR_PADDING,
                    justifyContent: 'center',
                  }}
                  // accessibilityLabel={clearAccessibilityLabel}
                  color={'rgba(255, 255, 255, 0.56)'}
                  // rippleColor={rippleColor}
                  onPress={() => setShowModal(true)}
                  icon={({ size, color }) => (
                    <Image
                      source={require('../assets/image/ic_edit.png')}
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
          <View style={[Styles.numContainer, { marginTop: 0, marginRight: 0 }]}>
            <BalanceTextLite
              textStyle={[Styles.mainNumText, Theme.fonts.default.heavy]}
              balanceItem={balanceItem}
            />
            <Text
              style={[
                { color: theme.colors.text, fontSize: 14, marginLeft: 8 },
              ]}>
              {wallet.currencySymbol}
            </Text>
          </View>

          {!wallet.isNft && (
            <CurrencyPriceText
              wallets={[wallet]}
              textStyle={[
                Styles.convertedNumText,
                { flex: 1 },
                Theme.fonts.default.regular,
              ]}
            />
          )}
          <View style={styles.roundButtonContainer}>
            <RoundButton2
              height={ROUND_BUTTON_MEDIUM_HEIGHT}
              style={{ marginLeft: 16, width: width / 2 - 32 }}
              icon={({ size, color }) => (
                <Image
                  source={RECEIVE_ICON}
                  style={{
                    width: ROUND_BUTTON_ICON_SIZE,
                    height: ROUND_BUTTON_ICON_SIZE,
                  }}
                />
              )}
              labelStyle={[
                {
                  color: theme.colors.receive,
                  fontSize: 16,
                },
              ]}
              color="#fff"
              onPress={() =>
                navigate('Deposit', { wallet, onComplete: _refresh })
              }>
              {I18n.t('receive')}
            </RoundButton2>
            <RoundButton2
              height={ROUND_BUTTON_MEDIUM_HEIGHT}
              style={{ marginHorizontal: 16, width: width / 2 - 32 }}
              icon={({ size, color }) => (
                <Image
                  source={SEND_ICON}
                  style={{
                    width: ROUND_BUTTON_ICON_SIZE,
                    height: ROUND_BUTTON_ICON_SIZE,
                  }}
                />
              )}
              labelStyle={[
                {
                  color: theme.colors.send,
                  fontSize: 16,
                },
              ]}
              color="#fff"
              onPress={() =>
                navigate('Withdraw', { wallet, onComplete: _refresh })
              }>
              {I18n.t('send')}
            </RoundButton2>
          </View>
          <CopyableText
            textStyle={Theme.fonts.default.regular}
            text={wallet.address}
            copiedHint={I18n.t('copied')}
            containerStyle={{
              marginHorizontal: 20,
              marginTop: 20,
            }}
          />
        </View>
      </BackgroundImage>
      {/*<Text style={styles.type}>{wallet.name}</Text>*/}
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        style={{ flexGrow: 0, backgroundColor: theme.colors.background }}>
        <View style={styles.filterContainer}>
          <BottomActionMenu
            visible={showMenu1}
            currentSelect={filterDirection}
            data={[
              I18n.t('all_transactions'),
              I18n.t('received'),
              I18n.t('send'),
            ]}
            onClick={() => {
              setShowMenu1(true);
            }}
            onCancel={() => {
              setShowMenu1(false);
            }}
            onChange={_setFilterDirection}
            containerStyle={{
              margin: 8,
              backgroundColor: theme.colors.filterBgColor,
            }}
          />
          <BottomActionMenu
            visible={showMenu2}
            currentSelect={filterTime}
            data={[I18n.t('all_time'), I18n.t('today'), I18n.t('yesterday')]}
            onClick={() => {
              setShowMenu2(true);
            }}
            onCancel={() => {
              setShowMenu2(false);
            }}
            onChange={_setFilterTime}
            containerStyle={{
              margin: 8,
              backgroundColor: theme.colors.filterBgColor,
            }}
          />
          <BottomActionMenu
            visible={showMenu3}
            currentSelect={filterPending}
            data={[I18n.t('all_progress'), I18n.t('pending'), I18n.t('done')]}
            onClick={() => {
              setShowMenu3(true);
            }}
            onCancel={() => {
              setShowMenu3(false);
            }}
            onChange={_setFilterPending}
            containerStyle={{
              margin: 8,
              backgroundColor: theme.colors.filterBgColor,
            }}
          />
          <BottomActionMenu
            visible={showMenu4}
            currentSelect={filterSuccess}
            data={[I18n.t('all_result'), I18n.t('success'), I18n.t('failed')]}
            onClick={() => {
              setShowMenu4(true);
            }}
            onCancel={() => {
              setShowMenu4(false);
            }}
            onChange={_setFilterSuccess}
            containerStyle={{
              margin: 8,
              backgroundColor: theme.colors.filterBgColor,
            }}
          />
        </View>
      </ScrollView>
      <TransactionList
        transactions={_getFilteredData(rawDataObj.data)}
        onTransactionPress={_goTransactionDetail}
        refreshing={loading == GET_NEW}
        onRefresh={_refresh}
        onEndReached={_fetchMoreHistory}
        getCurrencySymbol={item => currencySymbol}
        footLoading={_hasMore() ? loading : NO_MORE}
      />
      {showModal && (
        <InputMessageModal
          title={I18n.t('rename_wallet')}
          visible={showModal}
          loading={renameLoading}
          value={walletName}
          onConfirm={_performRename}
          onCancel={() => {
            setRenameLoading(false);
            setShowModal(false);
          }}
        />
      )}
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          type={result.type}
          message={result.message}
          errorMsg={result.error}
          onButtonClick={result.buttonClick}
        />
      )}
    </Container>
  ) : (
    <View
      style={{
        backgroundColor: Theme.colors.background,
        flex: 1,
        alignItems: 'center',
      }}>
      <View
        style={{
          width: width,
          height: HEADER_EXPANDED_HEIGHT,
          backgroundColor: startColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <MyLoader style={{ opacity: 0.5 }} />
      </View>

      <MyListLoader style={{ opacity: 0.8 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  topNameText: {
    color: Theme.colors.text,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  roundButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // width: '100%',
    backgroundColor: 'transparent', //need to give backgroundColor, or the view will on top of Modal
    // marginHorizontal: 20,
    marginTop: 16,
    // flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#000',
    // width: FULL_WIDTH_WITH_PADDING,
    paddingHorizontal: HEADER_BAR_PADDING,
    paddingVertical: 10,
  },
});
export default withTheme(WalletDetailScreen);
