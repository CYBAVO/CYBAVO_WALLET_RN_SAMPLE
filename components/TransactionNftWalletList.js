import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import I18n from '../i18n/i18n';
import Styles from '../styles/Styles';
import DisplayTime from './DisplayTime';
import { nftEndColors, nftStartColors, Theme } from '../styles/MainTheme';
import { DotIndicator } from 'react-native-indicators';
import { Surface, Text, TouchableRipple, withTheme } from 'react-native-paper';
import ListEmptyView from './ListEmptyView';
import { GET_MORE, NOT_LOADING } from '../store/actions';
import { NO_MORE } from '../screens/WalletDetailScreen';
import {
  CANCEL_FAILED,
  CANCELLED,
  CANCELLING,
  ACCELERATING,
  ACCELERATED,
  ACCELERATE_FAILED,
} from '../store/reducers/transactions';
import {
  ADD_SVG,
  nftIcons,
  replaceConfig,
  ROUND_BUTTON_LARGE_HEIGHT,
} from '../Constants';
import {
  hasValue,
  isETHForkChain,
  renderNftItem,
  renderTxItem,
} from '../Helpers';
import { useSelector } from 'react-redux';
import RoundButton2 from './RoundButton2';
import { SvgXml } from 'react-native-svg';

const ERROR_ICON = require('../assets/image/ic_error.png');
/*
 * 進出 金額 幣別     時間
 *      txid
 * */
const TransactionNftWalletList: () => React$Node = ({
  theme,
  onTransactionPress,
  transactions,
  tokens,
  wallet,
  onRefresh,
  refreshing,
  onEndReached,
  getCurrencySymbol,
  footLoading,
  style = {},
  listHeader,
  currentTab = 0,
  onClickAction = ({ item }) => {},
}) => {
  const receiveImg = require('../assets/image/receive.png');
  const sendImg = require('../assets/image/send.png');
  const expolreImg = require('../assets/image/open_window.png');
  const config = useSelector(state => {
    return state.auth.config;
  });
  const tokenUriMap = useSelector(state => {
    return state.tokenUri.tokenUriMap;
  });
  const currencyMap = useSelector(state => {
    if (state.currency.currencies == null) {
      return {};
    }
    let c = state.currency.currencies || [];
    let map = {};
    for (let i = 0; i < c.length; i++) {
      if (isETHForkChain(c[i].currency) && !hasValue(c[i].tokenAddress)) {
        map[c[i].currency] = c[i].displayName;
      }
    }
    return map;
  });
  const _renderNft = ({ item }) => {
    return renderNftItem(
      item,
      onClickAction,
      config,
      expolreImg,
      16,
      tokenUriMap,
      currencyMap
    );
  };
  const _renderTransaction = obj => {
    let tokenId = obj.item.amount;
    let amount;
    if (wallet.tokenVersion == 1155) {
      tokenId = obj.item.tokenId;
      amount = obj.item.amount;
    }
    return renderTxItem(
      obj,
      onTransactionPress,
      sendImg,
      receiveImg,
      getCurrencySymbol,
      tokenId,
      amount
    );
  };
  const _renderItem = obj => {
    if (currentTab == 0) {
      return _renderNft(obj);
    } else {
      return _renderTransaction(obj);
    }
  };
  const renderFooter = footLoading => {
    if (currentTab == 0) {
      return null;
    }
    switch (footLoading) {
      case NO_MORE:
        return transactions.length == 0 ? (
          <View style={styles.footer} />
        ) : (
          <View style={styles.footer}>
            <Text style={{ opacity: 0.35, fontSize: 12 }}>
              {I18n.t('end_of_history')}
            </Text>
          </View>
        );
      case GET_MORE:
        return (
          <View style={styles.footer}>
            <ActivityIndicator color="white" />
          </View>
        );
      case NOT_LOADING:
      default:
        return <View style={styles.footer} />;
    }
  };
  const _getEmptyView = () => {
    if (currentTab == 0) {
      return (
        <ListEmptyView
          text={I18n.t('no_collections')}
          img={require('../assets/image/ic_empty_collection.png')}
          style={{ height: '40%' }}
        />
      );
    } else {
      return (
        <ListEmptyView
          text={I18n.t('no_transaction_text')}
          img={require('../assets/image/ic_empty_collection.png')}
          style={{ height: '25%' }}
        />
      );
    }
  };
  const _getDataSub721 = (columns, startColor, endColor, icon, data) => {
    for (let t = 0; t < tokens.length; t++) {
      columns[t % 2].push({
        ...wallet,
        tokenId: tokens[t],
        startColor: startColor,
        endColor: endColor,
        icon: icon,
      });
      if ((t + 1) % 6 == 0) {
        data.push({ columns: columns });
        columns = [[], []];
      }
    }
    if (tokens.length == 0 || tokens.length % 6 != 0) {
      data.push({ columns: columns });
    }
    return data;
  };
  const _getDataSub1155 = (columns, startColor, endColor, icon, data) => {
    for (let t = 0; t < tokens.length; t++) {
      columns[t % 2].push({
        ...wallet,
        tokenId: tokens[t].tokenId,
        amount: tokens[t].amount,
        startColor: startColor,
        endColor: endColor,
        icon: icon,
      });
      if ((t + 1) % 6 == 0) {
        data.push({ columns: columns });
        columns = [[], []];
      }
    }
    if (tokens.length == 0 || tokens.length % 6 != 0) {
      data.push({ columns: columns });
    }
    return data;
  };
  const _getData = () => {
    if (currentTab == 0) {
      if (tokens.length == 0) {
        return [];
      }
      let columns = [[], []];
      let colorIndex = wallet.colorIndex;
      let iconIndex = wallet.iconIndex;
      let startColor = nftStartColors[colorIndex];
      let endColor = nftEndColors[colorIndex];
      let icon = nftIcons[iconIndex];
      let data = [];
      data =
        wallet.tokenVersion == 721
          ? _getDataSub721(columns, startColor, endColor, icon, data)
          : _getDataSub1155(columns, startColor, endColor, icon, data);
      return data;
    } else {
      return transactions;
    }
  };
  return (
    <View
      style={[
        styles.listContent,
        { backgroundColor: theme.colors.background },
        style,
      ]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        data={_getData()}
        keyExtractor={(tx, idx) => `${tx.txid}#${idx}`}
        renderItem={_renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={listHeader}
        ListFooterComponent={() => renderFooter(footLoading)}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.placeholder}
            />
          ) : null
        }
        ListEmptyComponent={_getEmptyView()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  item: {
    padding: 10,
    height: 80,
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  text: {
    fontSize: 15,
    color: 'black',
  },
  footer: {
    height: 88,
    paddingTop: 16,
    // padding: 10,
    justifyContent: 'center',
    // alignItems: 'center',
    flexDirection: 'row',
  },
  loadMoreBtn: {
    padding: 10,
    backgroundColor: '#800000',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: Theme.colors.text,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default withTheme(TransactionNftWalletList);
