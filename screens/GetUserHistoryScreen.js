import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SectionList,
  FlatList,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { Container, Content, Toast } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { WalletSdk, Auth, Wallets } from '@cybavo/react-native-wallet-service';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n, {
  getLanguage,
  IndexLanguageMap,
  LanguageIndexMap,
  setLanguage,
} from '../i18n/i18n';
import { withTheme, Text, ActivityIndicator } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import {
  CHECK_ICON,
  LIST_ICON_SIMPLE_SIZE,
  LOCALES,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import {
  fetchBalance,
  fetchTransaction,
  fetchUserTransaction,
  GET_NEW,
  KEY_USER_TX,
  NOT_LOADING,
  signIn,
} from '../store/actions';
import {
  getCurrencyKey,
  getWalletKey,
  getWalletKeyByWallet,
  hasValue,
  isETHForkChain,
  toast,
  toastError,
} from '../Helpers';
import { KycHelper } from '../utils/KycHelper';
import InputMessageModal from '../components/InputMessageModal';
import NavigationService from '../NavigationService';
import BottomActionMenu from '../components/BottomActionMenu';
import TransactionList from '../components/TransactionList';
import { NO_MORE } from './WalletDetailScreen';
import moment from 'moment/moment';
import MultiSelectBottomActionMenu from '../components/MultiSelectBottomActionMenu';
import OptionalBottomActionMenu from '../components/OptionalSelectBottomActionMenu';
const GetUserHistoryScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
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
  const [showMenu5, setShowMenu5] = useState(false);
  const [filterTime, setFilterTime] = useState(0);
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterPending, setFilterPending] = useState(0);
  const [filterSuccess, setFilterSuccess] = useState(0);
  const [filterCurrency, setFilterCurrency] = useState(null);
  const currencyList = useSelector(state => {
    if (state.currency.currencies == null) {
      return [];
    }
    if (!state.currency.priCurrencies) {
      return [];
    }
    let list = state.currency.priCurrencies
      ? state.currency.currencies.concat(state.currency.priCurrencies)
      : state.currency.currencies;
    return list.sort((c1, c2) => c1.symbol.localeCompare(c2.symbol));
  });
  const currencyMap = useSelector(state => {
    if (state.currency.currencies == null) {
      return {};
    }
    let c = state.currency.currencies || [];
    let map = {};
    for (let i = 0; i < c.length; i++) {
      map[getCurrencyKey(c[i].currency, c[i].tokenAddress)] = c[i];
    }
    c = state.currency.priCurrencies || [];
    for (let i = 0; i < c.length; i++) {
      map[getCurrencyKey(c[i].currency, c[i].tokenAddress)] = c[i];
    }
    return map;
  });
  useEffect(() => {
    _refresh();
  }, [
    setFilterSuccess,
    setFilterPending,
    filterTypes,
    filterCurrency,
    _refresh,
  ]);
  const _refresh = () => {
    dispatch(fetchUserTransaction(true, 0, _getFilters()));
  };

  const _getFilters = () => {
    let filters = {
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
    filters.type = filterTypes;
    if (filterCurrency != null) {
      filters.currency = filterCurrency.currency;
      filters.token_address = filterCurrency.tokenAddress;
    }
    return filters;
  };
  const _getFilteredData = rawData => {
    let filters = _getFilters();
    const data = rawData.filter(t => _filter(t, filters));
    // return data.slice(0, rawDataObj.start + 10);
    data.sort((a, b) => b.timestamp - a.timestamp);
    return data;
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
  const _filter = (t, filters) => {
    return (
      _filterPending(t, filters) &&
      _filterSuccess(t, filters) &&
      _filterStartTime(t, filters) &&
      _filterEndTime(t, filters)
    );
  };
  const _fetchMoreHistory = () => {
    if (rawDataObj.hasMore /*&& rawDataObj.loading === NOT_LOADING*/) {
      dispatch(
        fetchUserTransaction(true, rawDataObj.start + 10, _getFilters())
      );
    }
  };
  const _goTransactionDetail = transaction => {
    let c =
      currencyMap[
        getCurrencyKey(transaction.currency, transaction.tokenAddress)
      ];
    if (c) {
      let pc = transaction.tokenAddress
        ? currencyMap[getCurrencyKey(transaction.currency, '')]
        : c;
      navigate('UserHistoryDetail', {
        transaction,
        currencyObj: c,
        feeUnit: pc ? pc.symbol : '',
      });
      return;
    }
    navigate('UserHistoryDetail', {
      transaction,
      currencyObj: {},
      feeUnit: '',
    });
  };
  const rawDataObj = useSelector(state => {
    if (state.transactions.transactions == null) {
      return {
        start: 0,
        total: 0,
        data: [],
        loading: NOT_LOADING,
        hasMore: false,
      };
    }
    const key = getWalletKey(KEY_USER_TX, '', '');
    if (
      state.transactions.transactions[key] == null ||
      state.transactions.transactions[key].data == null
    ) {
      return {
        start: 0,
        total: 0,
        data: [],
        loading: NOT_LOADING,
        hasMore: false,
      };
    }
    return {
      start: state.transactions.transactions[key].start,
      total: state.transactions.transactions[key].total,
      data: Object.values(state.transactions.transactions[key].data),
      loading: state.transactions.transactions[key].loading,
      hasMore:
        state.transactions.transactions[key].start + 10 <
        state.transactions.transactions[key].total,
    };
  });
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
  const _setFilterCurrency = currency => {
    setFilterCurrency(currency);
    setShowMenu5(false);
  };
  return (
    <Container style={[Styles.container]}>
      <Headerbar
        transparent
        title={I18n.t('api_get_user_history')}
        onBack={() => goBack()}
      />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        style={{ flexGrow: 0, backgroundColor: theme.colors.background }}>
        <View style={Styles.filterContainer}>
          <MultiSelectBottomActionMenu
            visible={showMenu1}
            getValue={item => item.value}
            onConfirm={map => {
              let types = [];
              for (let k in map) {
                if (map[k] === true) {
                  types.push(parseInt(k));
                }
              }
              setFilterTypes(types);
              setShowMenu1(false);
            }}
            mainText={
              filterTypes.length == 0
                ? I18n.t('all_type')
                : I18n.t('n_selected', { n: filterTypes.length })
            }
            initSelect={filterTypes}
            data={Object.keys(Wallets.Transaction.Type)
              .filter(
                k =>
                  Wallets.Transaction.Type[k] !==
                  Wallets.Transaction.Type.Unknown
              )
              .map(k => {
                return {
                  title: `${k} (${Wallets.Transaction.Type[k]})`,
                  desc: I18n.t(
                    `transaction_type_${Wallets.Transaction.Type[k]}_desc`
                  ),
                  value: Wallets.Transaction.Type[k],
                };
              })
              .sort((a, b) => a.value - b.value)}
            onClick={() => {
              setShowMenu1(true);
            }}
            onCancel={() => {
              setShowMenu1(false);
            }}
            onChange={_setFilterTime}
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
          <OptionalBottomActionMenu
            visible={showMenu5}
            currentSelect={filterCurrency}
            data={currencyList}
            getKey={c => getCurrencyKey(c.currency, c.tokenAddress)}
            getValue={c => `${c.symbol} - ${c.displayName}`}
            mainText={
              filterCurrency == null
                ? I18n.t('all_currency')
                : filterCurrency.symbol
            }
            onClick={() => {
              setShowMenu5(true);
            }}
            onCancel={() => {
              setShowMenu5(false);
            }}
            onChange={_setFilterCurrency}
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
        refreshing={rawDataObj.loading === GET_NEW}
        onRefresh={_refresh}
        onEndReached={_fetchMoreHistory}
        getCurrencySymbol={item => {
          let c = currencyMap[getCurrencyKey(item.currency, item.tokenAddress)];
          return c ? c.symbol : '';
        }}
        footLoading={rawDataObj.hasMore ? rawDataObj.loading : NO_MORE}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  listItem: {
    minHeight: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  listItemVertical: {
    minHeight: 60,
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
  },
  listItemHorizontal: {
    minHeight: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
    paddingRight: 0,
  },
  image: {
    width: 36,
    height: 36,
  },
  listContainer: {
    marginHorizontal: 16,
    flexGrow: 1,
  },
});

export default withTheme(GetUserHistoryScreen);
