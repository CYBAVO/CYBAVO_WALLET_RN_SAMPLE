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
  const replaceConfig = {
    [CANCEL_FAILED]: { color: '#ff8c00', i18n: 'cancel_failed' },
    [CANCELLED]: { color: theme.colors.error, i18n: 'cancelled' },
    [CANCELLING]: { color: theme.colors.error, i18n: 'cancelling' },
    [ACCELERATING]: { color: theme.colors.success, i18n: 'accelerating' },
    [ACCELERATED]: { color: theme.colors.success, i18n: 'accelerated' },
    [ACCELERATE_FAILED]: { color: '#ff8c00', i18n: 'accelerate_failed' },
  };
  const receiveImg = require('../assets/image/receive.png');
  const sendImg = require('../assets/image/send.png');
  const _renderItem = ({ item }) => {
    const opacity = item.pending ? 0.35 : 1;
    const decorationLine =
      item.replaceStatus === CANCELLED ? 'line-through' : 'none';
    return (
      <Surface
        style={[
          Styles.listItem,
          {
            backgroundColor: theme.colors.background,
          },
        ]}>
        <TouchableRipple
          onPress={() => onTransactionPress(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: Theme.colors.backgroundPressed,
            borderBottomWidth: 1,
            borderTopWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
          }}>
          <>
            <Image
              source={item.out ? sendImg : receiveImg}
              resizeMode="stretch"
              style={{
                width: 24,
                height: 24,
                opacity: opacity,
                marginLeft: 16,
              }}
            />
            <View style={[Styles.itemBody]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 8,
                }}>
                <Text
                  style={[
                    Styles.cardTitle,
                    Theme.fonts.default.heavy,
                    { opacity: opacity, textDecorationLine: decorationLine },
                  ]}>
                  {item.amount}
                </Text>
                <Text
                  style={[
                    Styles.cardDescHorizontal,
                    Theme.fonts.default.heavy,
                    { opacity: opacity },
                  ]}>
                  {getCurrencySymbol(item)}
                </Text>
                {replaceConfig[item.replaceStatus] && (
                  <Text
                    style={[
                      // Styles.tag,
                      {
                        backgroundColor:
                          replaceConfig[item.replaceStatus].color,
                        fontSize: 8,
                        paddingVertical: 2,
                        borderRadius: 7,
                        paddingHorizontal: 5,
                        opacity: opacity,
                        marginLeft: 8,
                        overflow: 'hidden',
                      },
                    ]}>
                    {I18n.t(replaceConfig[item.replaceStatus].i18n)}
                  </Text>
                )}
              </View>
              {item.txid != null && item.txid.length > 0 && (
                <View style={{ flexDirection: 'row', flex: 1, marginTop: 3 }}>
                  <Text
                    style={[
                      Styles.tag,
                      {
                        backgroundColor: theme.colors.pickerBg,
                        fontSize: 8,
                        opacity: 0.5,
                      },
                    ]}>
                    {I18n.t('txid')}
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    style={[
                      Styles.cardDesc,
                      Theme.fonts.default.regular,
                      { marginLeft: 2, flexShrink: 1, marginRight: 10 },
                    ]}>
                    {item.txid}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              {!item.success && (
                <Image source={ERROR_ICON} style={{ marginRight: 5 }} />
              )}
              <DisplayTime
                prefix={item.replaceStatus != null ? ` #${item.nonce} ` : ''}
                textStyle={[
                  Styles.cardDesc,
                  { opacity: opacity, marginLeft: 0, marginRight: 16 },
                  Theme.fonts.default.regular,
                ]}
                format="YYYY/M/D"
                unix={item.timestamp}
              />
            </View>

            {item.pending && item.success && !item.dropped && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <DotIndicator color={Theme.colors.primary} size={4} count={3} />
              </View>
            )}
          </>
        </TouchableRipple>
      </Surface>
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
