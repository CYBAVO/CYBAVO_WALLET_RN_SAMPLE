import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
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
import { Wallets } from '@cybavo/react-native-wallet-service';
import { SvgXml } from 'react-native-svg';
import { CANCEL_SVG, replaceConfig } from '../Constants';
import { hasValue } from '../Helpers';

const ERROR_ICON = require('../assets/image/ic_error.png');
const ApiHistoryList: () => React$Node = ({
  theme,
  onPress,
  data: data,
  onRefresh,
  refreshing,
  onEndReached,
  footLoading,
  style = {},
}) => {
  const _renderItem = ({ item }) => {
    const opacity =
      item.status == Wallets.ApiHistoryItem.Status.WAITING ? 0.35 : 1;
    const decorationLine =
      item.replaceStatus === CANCELLED ? 'line-through' : 'none';
    return (
      <TouchableOpacity
        style={[styles.item]}
        onPress={() => {
          onPress(item);
        }}>
        <View
          style={{
            flexDirection: 'column',
            flex: 1,
            alignItems: 'flex-start',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            <Text
              style={[
                {
                  paddingVertical: 2,
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.primary,
                  marginBottom: 3,
                  opacity: opacity,
                  textDecorationLine: decorationLine,
                },
                Theme.fonts.default.regular,
              ]}>
              {item.apiName}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              {replaceConfig[item.replaceStatus] && (
                <Text
                  style={[
                    {
                      backgroundColor: replaceConfig[item.replaceStatus].color,
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
              {item.nonce != null && (
                <Text
                  style={[
                    styles.listItemSubText,
                    Theme.fonts.default.regular,
                    {
                      opacity: opacity * 0.7,
                      marginLeft: 3,
                    },
                  ]}>
                  {`#${item.nonce}`}
                </Text>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            <Text
              style={[
                styles.listItemText,
                Theme.fonts.default.heavyBold,
                {
                  opacity: opacity,
                  flexShrink: 1,
                  marginLeft: 8,
                  marginRight: 24,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="middle">
              {item.walletName}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 3 }}>
              <Text
                style={[
                  styles.listItemSubText,
                  Theme.fonts.default.regular,
                  {
                    opacity: opacity * 0.7,
                  },
                ]}>
                {item.formatTime}
              </Text>
            </View>
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {hasValue(item.txid) && (
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  marginTop: 3,
                  marginRight: 24,
                  opacity: opacity,
                }}>
                <Text
                  style={[
                    {
                      backgroundColor: theme.colors.background,
                      fontSize: 8,
                      opacity: 0.5,
                      paddingVertical: 2,
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      textAlign: 'center',
                      overflow: 'hidden',
                    },
                  ]}>
                  {I18n.t('txid')}
                </Text>
                <Text
                  style={[
                    styles.listItemSubText,
                    {
                      marginLeft: 5,
                      flexShrink: 1,
                      marginRight: 0,
                      textDecorationLine: decorationLine,
                    },
                    Theme.fonts.default.regular,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="middle">
                  {item.txid}
                </Text>
              </View>
            )}
            {(item.status == Wallets.ApiHistoryItem.Status.FAILED ||
              item.status == Wallets.ApiHistoryItem.Status.DROPPED) && (
              <Image
                source={ERROR_ICON}
                style={{ marginRight: 0, alignSelf: 'flex-end' }}
              />
            )}
          </View>
          {item.status == Wallets.ApiHistoryItem.Status.WAITING && (
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
        </View>
      </TouchableOpacity>
      // </Surface>
    );
  };
  const renderFooter = footLoading => {
    switch (footLoading) {
      case NO_MORE:
        return data.length == 0 ? (
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
        contentContainerStyle={{ flexGrow: 1, marginTop: 8 }}
        data={data}
        keyExtractor={(item, idx) => `${item.createTime}#${idx}`}
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
    borderBottomWidth: 1,
    borderColor: Theme.colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: 8,
    paddingVertical: 8,
  },
  listItemText: {
    marginTop: 6,
    fontSize: 16,
    marginRight: 24,
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
    justifyContent: 'center',
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
  listItemSubText: {
    fontSize: 12,
  },
});

export default withTheme(ApiHistoryList);
