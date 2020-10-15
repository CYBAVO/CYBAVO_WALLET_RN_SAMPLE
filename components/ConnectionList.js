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
import IconSvgXml from './IconSvgXml';

const ERROR_ICON = require('../assets/image/ic_error.png');
/*
 * 進出 金額 幣別     時間
 *      txid
 * */
const ConnectionList: () => React$Node = ({
  theme,
  onPress,
  data,
  style = {},
}) => {
  const _renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.item]}
        onPress={() => {
          onPress(item);
        }}>
        <View
          style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start' }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 60 / 2,
              backgroundColor: theme.colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={{ uri: item.icon }}
              style={{ width: 50, height: 50 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.listItemText, Theme.fonts.default.heavy]}>
              {item.name}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 3 }}>
              <Text
                style={[
                  styles.listItemSubText,
                  Theme.fonts.default.regular,
                  {
                    flex: 1,
                  },
                ]}
                ellipsizeMode={'middle'}
                numberOfLines={2}>
                {item.address}
              </Text>
            </View>

            <Text
              style={[
                styles.listItemSubText,
                Theme.fonts.default.regular,
                {
                  alignSelf: 'flex-end',
                  flex: 1,
                },
              ]}>
              {item.timestamp}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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
        data={data}
        keyExtractor={(data, idx) => `${data.peerId}`}
        renderItem={_renderItem}
        ListEmptyComponent={
          <ListEmptyView text={I18n.t('add_connection_hint')} />
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
  item: {
    backgroundColor: Theme.colors.pickerBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    // height: 80,
    paddingHorizontal: 10,
    marginBottom: 8,
    paddingVertical: 8,
  },
  listItemText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: 'bold',
  },
  listItemSubText: {
    fontSize: 14,
    marginLeft: 15,
    color: Theme.colors.placeholder,
  },
});

export default withTheme(ConnectionList);
