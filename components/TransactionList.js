import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import I18n from '../i18n/i18n';
import Styles from '../styles/Styles';
import DisplayTime from './DisplayTime';
import { Theme } from '../styles/MainTheme';
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
import { replaceConfig } from '../Constants';
import { renderTxItem } from '../Helpers';

const ERROR_ICON = require('../assets/image/ic_error.png');
/*
 * 進出 金額 幣別     時間
 *      txid
 * */
const TransactionList: () => React$Node = ({
  theme,
  onTransactionPress,
  transactions,
  onRefresh,
  refreshing,
  onEndReached,
  getCurrencySymbol,
  footLoading,
  style = {},
}) => {
  const receiveImg = require('../assets/image/receive.png');
  const sendImg = require('../assets/image/send.png');
  const _renderItem = obj => {
    return renderTxItem(
      obj,
      onTransactionPress,
      sendImg,
      receiveImg,
      getCurrencySymbol,
      obj.amount
    );
  };
  const renderFooter = footLoading => {
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

  return (
    <View
      style={[
        styles.listContent,
        { backgroundColor: theme.colors.background },
        style,
      ]}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        data={transactions}
        keyExtractor={(tx, idx) => `${tx.txid}#${idx}`}
        renderItem={_renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
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
        ListEmptyComponent={
          <ListEmptyView text={I18n.t('no_transaction_text')} />
        }
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

export default withTheme(TransactionList);
