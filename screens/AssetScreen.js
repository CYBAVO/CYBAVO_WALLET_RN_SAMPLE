import React, { useState, useEffect } from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';
import Tab from '../components/Tab';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
const { width, height } = Dimensions.get('window');

import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUserState,
  fetchWallets,
  fetchCurrencyPricesIfNeed,
  EXCHANGE_CURRENCIES,
  EXCHANGE_CURRENCY_UPDATE,
  fetchBalance,
  fetchApiHistory,
  walletconnectSync,
} from '../store/actions';
import I18n from '../i18n/i18n';
import WalletList from '../components/WalletList';
import Dropdown from '../components/Dropdown';
import TransactionList from '../components/TransactionList';
import Headerbar from '../components/Headerbar';
import { FAB, IconButton, Text, withTheme } from 'react-native-paper';
import { NO_MORE } from './WalletDetailScreen';
import ContentLoader, { Rect } from 'react-content-loader/native';
import {
  convertAmountFromRawNumber,
  convertHexToString,
  getConnectionList,
  getExchangeAmountFromWallets,
  getRestCurrencies,
  getWalletConnectSvg,
  getWalletConnectSvg2,
  renderTabBar,
  toastError,
} from '../Helpers';
import CurrencyPriceTextLite from '../components/CurrencyPriceTextLite';
import NavigationService from '../NavigationService';
import { SvgXml } from 'react-native-svg';
import { Wallets } from '@cybavo/react-native-wallet-service';
const MyLoader = props => {
  let cardWidth = width - 32;
  let cardHeight = 120;
  let cardRadius = 7;
  let cardListTop = height * 0.29 + 20;
  let cardListMarginTop = 120 + 15;
  return (
    <ContentLoader
      speed={0.6}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      backgroundColor="#1C223A"
      foregroundColor="#292F45"
      {...props}>
      {/*top*/}
      <Rect x="16" y={height * 0.15} rx="3" ry="3" width="120" height="25" />
      <Rect
        x={width - 76}
        y={height * 0.15 + 7}
        rx="3"
        ry="3"
        width="58"
        height="15"
      />
      {/*tab*/}
      <Rect x="35" y={height * 0.25} rx="3" ry="3" width="53" height="15" />
      {/*card*/}
      {[0, 1, 2, 3].map(i => (
        <Rect
          x="16"
          y={cardListTop + cardListMarginTop * i}
          rx={cardRadius}
          ry={cardRadius}
          width={cardWidth}
          height={cardHeight}
        />
      ))}
    </ContentLoader>
  );
};
const AssetScreen: () => React$Node = ({ theme, navigation: { navigate } }) => {
  const NA = '-';
  const dispatch = useDispatch();
  const setPin = useSelector(state => state.user.userState.setPin);
  const wallets = useSelector(state => {
    return state.wallets.wallets || [];
  });
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const currencyPriceLoading = useSelector(
    state => state.currencyPrice.loading
  );
  const walletsLoading = useSelector(state => state.wallets.loading);
  const ethWallet = useSelector(state => state.wallets.ethWallet);
  const [hide, setHide] = useState(false);
  const hasConnection = useSelector(state => {
    return Object.keys(state.walletconnect.connecting).length > 0;
  });
  const hasApiHistory = useSelector(state => {
    let hasApiHistory = false;
    try {
      let apihistoryMap =
        state.apihistory.apihistory[state.wallets.ethWallet.walletId].data;
      let arr = Object.values(apihistoryMap);
      if (arr.length > 0) {
        hasApiHistory = true;
      }
    } catch (error) {
      console.debug(error);
    }
    return hasApiHistory;
  });
  const balances = useSelector(state => state.balance.balances || {});
  const canAddAsset = useSelector(state => {
    if (ready == false) {
      return false;
    }
    let restCurrencies = getRestCurrencies(
      state.currency.currencies,
      state.wallets.wallets
    );
    return restCurrencies.length > 0;
  });
  const exchangeCurrency = useSelector(
    state => state.currencyPrice.exchangeCurrency
  );
  const currencyPrice = useSelector(
    state => state.currencyPrice.currencyPrice || {}
  );
  const exchangeAmount = useSelector(state => {
    let keys = Object.keys(balances);
    if (keys.length == 0) {
      return null;
    } else {
      if (ready == false) {
        // if already show UI, don't make exchangeAmount null
        for (let k of keys) {
          if (balances[k].loading != false) {
            return;
          }
        }
      }
      let value = getExchangeAmountFromWallets(
        wallets,
        exchangeCurrency,
        balances,
        currencyPrice,
        3
      );
      if (value == null) {
        return NA; // null means not ready
      }
      return value;
    }
  });
  useEffect(() => {
    dispatch(fetchWallets());
    dispatch(fetchUserState());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCurrencyPricesIfNeed());
  }, [dispatch, wallets]);
  useEffect(() => {
    if (ready && ethWallet) {
      dispatch(fetchApiHistory(false));
    }
  }, [dispatch, ethWallet, ready]);

  useEffect(() => {
    wallets.map((wallet, i) => {
      dispatch(
        fetchBalance(wallet.currency, wallet.tokenAddress, wallet.address, true)
      );
    });
  }, [dispatch, wallets]);

  useEffect(() => {
    if (
      currencyPriceLoading == false &&
      walletsLoading == false &&
      exchangeAmount != null
    ) {
      setReady(true);
      setRefreshing(false);
    }
  }, [currencyPriceLoading, walletsLoading, exchangeAmount]);

  //retry to fetch currencyPrice
  useEffect(() => {
    if (exchangeAmount == NA) {
      setHide(false);
      setTimeout(() => {
        dispatch(fetchCurrencyPricesIfNeed(true));
      }, 3000);
    }
  }, [exchangeAmount]);

  const transactions = useSelector(state => {
    if (state.transactions.transactions == null) {
      return null;
    }
    let data = [];
    let byWalletTxs = Object.values(state.transactions.transactions);
    for (let i = 0; i < byWalletTxs.length; i++) {
      if (byWalletTxs[i].data == null) {
        continue;
      }
      data = data.concat(Object.values(byWalletTxs[i].data));
    }
    data.sort((a, b) => b.timestamp - a.timestamp);
    return data;
  });
  const latestKey = useSelector(state => {
    if (
      state.transactions.transactions == null ||
      state.transactions.transactions.latestTx == null
    ) {
      return null;
    }
    return state.transactions.transactions.latestTx.address;
  });

  const unhideImg = require('../assets/image/ic_unhide.png');
  const hideImg = require('../assets/image/ic_hide.png');
  let _scrollX = new Animated.Value(0);
  useEffect(() => {
    if (setPin === false) {
      NavigationService.navigate('SetupPin');
    }
  }, [navigate, setPin]);
  const _refresh = () => {
    setRefreshing(true);
    dispatch(fetchWallets());
    dispatch(fetchCurrencyPricesIfNeed(true));
    dispatch(fetchApiHistory());
  };
  const _goTransactionDetail = transaction => {
    let address = transaction.out
      ? transaction.fromAddress
      : transaction.toAddress;
    let w = wallets.find(
      wallet =>
        wallet.address === address &&
        wallet.tokenAddress == transaction.tokenAddress
    );
    if (w) {
      navigate('TransactionDetail', {
        wallet: w,
        transaction,
      });
    }
  };

  return ready ? (
    <View style={Styles.container}>
      <Headerbar
        transparent
        title={I18n.t('app_name')}
        actions={
          canAddAsset ? (
            <IconButton
              borderless
              color={theme.colors.primary}
              onPress={() => navigate('AddAsset')}
              icon={({ size, color }) => (
                <Image
                  source={require('../assets/image/ic_add_primary.png')}
                  style={{ width: 24, height: 24 }}
                />
              )}
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
            />
          ) : null
        }
      />
      {exchangeAmount !== NA && (
        <Text style={[Styles.topSecLabel, Theme.fonts.default.heavy]}>
          {I18n.t('total_assets')}
        </Text>
      )}
      {exchangeAmount !== NA && (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', width: width * 0.72 }}
            onPress={() => {
              setHide(!hide);
            }}>
            <CurrencyPriceTextLite
              symbol={false}
              textStyle={[Styles.topTotalAsset, Theme.fonts.default.heavyBold]}
              hide={hide}
              imgSrc={hide ? hideImg : unhideImg}
              imgStyle={{ height: 30, width: 30 }}
              exchangeAmount={exchangeAmount}
              exchangeCurrency={exchangeCurrency}
            />
          </TouchableOpacity>
          <Dropdown
            data={EXCHANGE_CURRENCIES}
            currentSelect={exchangeCurrency}
            clickItem={item => {
              dispatch({
                type: EXCHANGE_CURRENCY_UPDATE,
                exchangeCurrency: item,
              });
            }}
          />
        </View>
      )}
      <ScrollableTabView
        renderTabBar={() => {
          return renderTabBar(theme, _scrollX);
        }}
        onScroll={x => _scrollX.setValue(x)}>
        <View style={{ paddingTop: 8 }} tabLabel={{ label: I18n.t('assets') }}>
          <WalletList
            wallets={wallets}
            hide={hide}
            latestKey={latestKey}
            onClickAction={item => {
              navigate('WalletDetail', { wallet: item });
            }}
            onRefresh={_refresh}
            refreshing={refreshing}
          />
        </View>
        {transactions && transactions.length > 0 && (
          <TransactionList
            tabLabel={{ label: I18n.t('recent_transactions') }}
            transactions={transactions}
            onTransactionPress={_goTransactionDetail}
            refreshing={false}
            style={{ paddingTop: 10 }}
            footLoading={NO_MORE}
            getCurrencySymbol={item => item.currencySymbol}
          />
        )}
      </ScrollableTabView>
      {(hasConnection || hasApiHistory) && (
        <FAB
          // animated={true}
          style={Styles.fab}
          icon={({ size, color }) => (
            <SvgXml xml={getWalletConnectSvg2()} width={size} height={size} />
          )}
          onPress={() => {
            NavigationService.navigate('ConnectionList', {});
          }}
        />
      )}
    </View>
  ) : (
    <View style={Styles.container}>
      <MyLoader style={{ opacity: 1 }} />
    </View>
  );
};
export default withTheme(AssetScreen);
