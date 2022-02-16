import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  Image,
  InteractionManager,
  Animated,
} from 'react-native';
import { Container, Button } from 'native-base';
const { width, height } = Dimensions.get('window');
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import {
  startColors,
  endColors,
  Theme,
  nftStartColors,
  nftEndColors,
} from '../styles/MainTheme';
import {
  Coin,
  HEADER_BAR_PADDING,
  INACTIVE_OPACITY,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
  ROUND_BUTTON_MEDIUM_HEIGHT,
} from '../Constants';
import Styles from '../styles/Styles';
const RECEIVE_ICON = require('../assets/image/ic_add_showcase.png');
const SEND_ICON = require('../assets/image/send.png');
import I18n from '../i18n/i18n';
import { useAppState } from '@react-native-community/hooks';
import BackgroundImage from '../components/BackgroundImage';
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
import { animateFadeIn, getWalletKeyByWallet, renderTabBar } from '../Helpers';
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
import TransactionNftWalletList from '../components/TransactionNftWalletList';
import WalletList from '../components/WalletList';
import Tab from '../components/Tab';
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
  let y1 = 35;
  let y2 = 75;
  let marginLeft = 16;
  let cardWidth = (width - 32 - 16) / 2;
  let cardHeight = 230;
  return (
    <ContentLoader
      speed={0.6}
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      backgroundColor="#1C223A"
      foregroundColor="#292F45"
      {...props}>
      <Rect x={marginLeft} y={y1} rx="3" ry="3" width="65" height="15" />
      <Rect
        x={marginLeft + 53 + 60}
        y={y1}
        rx="3"
        ry="3"
        width="65"
        height="15"
      />
      {[0, 1, 2, 3, 4].map(i => (
        <React.Fragment key={i}>
          <Rect
            x={marginLeft}
            y={y2 + (cardHeight + 16) * i}
            rx="6"
            ry="6"
            width={cardWidth}
            height={cardHeight}
          />
          <Rect
            x={marginLeft + 16 + cardWidth}
            y={y2 + (cardHeight + 16) * i}
            rx="6"
            ry="6"
            width={cardWidth}
            height={cardHeight}
          />
        </React.Fragment>
      ))}
    </ContentLoader>
  );
};
const WalletNftDetailScreen: () => React$Node = ({ theme }) => {
  let _scrollX = new Animated.Value(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [ready, setReady] = useState(false);
  const appState = useAppState();
  const [animOpacity0] = useState(new Animated.Value(1));
  const [animOpacity1] = useState(new Animated.Value(INACTIVE_OPACITY));
  const [animOpacityList] = useState(new Animated.Value(1));
  let animOpacity = [animOpacity0, animOpacity1];
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
  const [enableRefreshUi, setEnableRefreshUi] = useState(false);
  const [result, setResult] = useState(null);
  const wallet = useNavigationParam('wallet');
  const [walletName, setWalletName] = useState(wallet.name);
  const { navigate, goBack } = useNavigation();
  const dispatch = useDispatch();
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
    if (loading == NOT_LOADING && balanceItem != null && ready == false) {
      setTimeout(() => {
        setReady(true);
      }, 1000); //walkaround, prevent first time background image flick
    }
  }, [loading, balanceItem]);
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
  const _refreshManual = () => {
    setEnableRefreshUi(true);
    _refresh();
    setEnableRefreshUi(false);
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
  const _performRegisterTokenIds = async tokenId => {
    setRenameLoading(true);
    try {
      await Wallets.registerTokenIds(wallet.walletId, [tokenId]);

      setResult({
        type: TYPE_SUCCESS,
        successButtonText: I18n.t('done'),
        title: I18n.t('change_successfully'),
        message: 'registerTokenIds',
        buttonClick: () => {
          setResult(null);
        },
      });
    }catch (error) {
      console.log('registerTokenIds failed', error);
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

  }
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
  let startColor = nftStartColors[wallet.colorIndex] || startColors.UNKNOWN;
  let endColor = nftEndColors[wallet.colorIndex] || endColors.UNKNOWN;
  const _getFilterView = () => {
    if (currentTab == 1) {
      return (
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
      );
    }
    return <View />;
  };
  const getHeader = () => (
    <View style={{ flex: 1 }}>
      <BackgroundImage
        containerStyle={Styles.detailBackgroundImage}
        imageStyle={Styles.detailCardPattern}
        // imageSource={CardPatternImg}
        startColor={startColor}
        endColor={endColor}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        <View>
          <Headerbar
            transparent
            title={wallet.currencyDisplayName}
            onBack={() => goBack()}
            actions={
              <View style={{ flexDirection: 'row' }}>
                {/*<IconButton*/}
                {/*  borderless*/}
                {/*  style={{*/}
                {/*    marginRight: HEADER_BAR_PADDING,*/}
                {/*    justifyContent: 'center',*/}
                {/*  }}*/}
                {/*  // accessibilityLabel={clearAccessibilityLabel}*/}
                {/*  color={'rgba(255, 255, 255, 0.56)'}*/}
                {/*  // rippleColor={rippleColor}*/}
                {/*  onPress={() => setShowModal(true)}*/}
                {/*  icon={({ size, color }) => (*/}
                {/*    <Image*/}
                {/*      source={require('../assets/image/ic_edit.png')}*/}
                {/*      style={{ width: 24, height: 24 }}*/}
                {/*    />*/}
                {/*  )}*/}
                {/*  accessibilityTraits="button"*/}
                {/*  accessibilityComponentType="button"*/}
                {/*  accessibilityRole="button"*/}
                {/*/>*/}
              </View>
            }
          />
          <View style={[Styles.numContainer, { marginTop: 0, marginRight: 0 }]}>
            <BalanceTextLite
              textStyle={[Styles.mainNumText, Theme.fonts.default.heavy]}
              balanceItem={balanceItem}
              isErc1155={wallet.tokenVersion == 1155}
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
              style={{
                marginLeft: 16,
                width: width / 2 - 32,
                justifyContent: 'center',
              }}
              icon={({ size, color }) => (
                <Image
                  source={RECEIVE_ICON}
                  style={
                    {
                      // width: ROUND_BUTTON_ICON_SIZE,
                      // height: ROUND_BUTTON_ICON_SIZE,
                    }
                  }
                />
              )}
              labelStyle={[
                {
                  color: theme.colors.receive,
                  fontSize: 16,
                  marginHorizontal: 8,
                },
              ]}
              color="#fff"
              onPress={() =>
                navigate('Deposit', { wallet, onComplete: _refresh })
              }>
              {I18n.t('add_showcase')}
            </RoundButton2>
            <RoundButton2
              height={ROUND_BUTTON_MEDIUM_HEIGHT}
              style={{ marginHorizontal: 16, width: width / 2 - 32 }}
              icon={({ size, color }) => (
                <Image
                  source={SEND_ICON}
                  style={
                    {
                      // width: ROUND_BUTTON_ICON_SIZE,
                      // height: ROUND_BUTTON_ICON_SIZE,
                    }
                  }
                />
              )}
              labelStyle={[
                {
                  color: theme.colors.send,
                  fontSize: 16,
                  marginHorizontal: 8,
                },
              ]}
              color="#fff"
              onPress={() =>
                navigate('Withdraw', { wallet, onComplete: _refresh })
              }>
              {I18n.t('send_showcase')}
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

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          paddingVertical: 8,
          backgroundColor: theme.colors.background,
        }}>
        {[
          { label: I18n.t('nft_tab_name') },
          { label: I18n.t('recent_transactions') },
        ].map((tab, page) => {
          return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Tab
                styles={{
                  textColor: theme.colors.text,
                  // opacity: page == currentTab ? 1 : 0.2,
                  opacity: animOpacity[page],
                }}
                key={page}
                tab={tab}
                page={page}
                isTabActive={page == currentTab}
                onPressHandler={pageObj => {
                  setCurrentTab(page);
                  animateFadeIn(animOpacity[page], 1, 300);
                  animateFadeIn(
                    page == 1 ? animOpacity[0] : animOpacity[1],
                    INACTIVE_OPACITY,
                    300
                  );
                }}
              />
              <Animated.View
                style={{
                  backgroundColor:
                    page == currentTab ? theme.colors.primary : 'transparent',
                  opacity: animOpacity[page],
                  height: 2,
                  width: '30%',
                }}
              />
            </View>
          );
        })}
      </View>
      {_getFilterView()}
    </View>
  );
  return ready ? (
    <Container style={(Styles.container, { backgroundColor: startColor })}>
      <TransactionNftWalletList
        transactions={_getFilteredData(rawDataObj.data)}
        tokens={
          wallet.tokenVersion == 721
            ? balanceItem.tokens
            : balanceItem.tokenIdAmounts
        }
        wallet={wallet}
        onTransactionPress={_goTransactionDetail}
        listHeader={getHeader}
        currentTab={currentTab}
        refreshing={enableRefreshUi && loading == GET_NEW}
        onRefresh={_refreshManual}
        onEndReached={_fetchMoreHistory}
        getCurrencySymbol={item => currencySymbol}
        footLoading={_hasMore() ? loading : NO_MORE}
        onClickShowcase={() => {
          navigate('Deposit', { wallet, onComplete: _refresh });
        }}
        onClickAction={(item, tokenId) => {
          navigate('Withdraw', {
            wallet: item,
            onComplete: null,
            tokenId: tokenId,
          });
        }}
      />
      {showModal && (
        <InputMessageModal
          title={'Input Token ID'}
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
export default withTheme(WalletNftDetailScreen);
