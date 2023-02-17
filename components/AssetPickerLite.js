import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  StatusBar,
} from 'react-native';
import { Container } from 'native-base';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import IconSvgXml from './IconSvgXml';
import Headerbar from './Headerbar';
import { Surface, Text, TouchableRipple, withTheme } from 'react-native-paper';
import { CHECK_ICON, LIST_ICON_SIMPLE_SIZE, nftIcons } from '../Constants';
import ListEmptyView from './ListEmptyView';
import { useSelector } from 'react-redux';
const AssetPickerLite: () => React$Node = ({
  theme,
  rawData = [],
  clickItem,
  initSelected = {},
  getKey = item => {
    const s = `${item.currency}#${item.tokenAddress}#${item.address}`;
    return s;
  },
  getMainText = item =>
    item.isNft ? item.currencyDisplayName : item.currencySymbol,
  getSubText = item => {
    return item.name || item.currencyDisplayName;
  },
  getXmlKey = item => item.currencySymbol,
  getBalanceText = item => '',
  onCancel = () => {},
}) => {
  const _onBackHandle = () => {
    onCancel();
    return true;
  };

  const data = rawData;
  const _renderItem = ({ item }) => (
    <Surface
      style={[
        Styles.listItem,
        {
          backgroundColor: theme.colors.background,
        },
      ]}>
      <TouchableRipple
        onPress={() => {
          clickItem(item);
        }}
        style={styles.listItem}>
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 16,
              flex: 4,
            }}>
            {item.isNft ? (
              <Image
                resizeMode="stretch"
                source={nftIcons[item.iconIndex]}
                style={{
                  height: 32,
                  width: 32,
                  alignSelf: 'center',
                }}
              />
            ) : (
              <IconSvgXml xmlkey={getXmlKey(item)} fillType={'1'} />
            )}
            <Text
              style={[styles.listItemText, Theme.fonts.default.heavy]}
              numberOfLines={1}>
              {getMainText(item)}
            </Text>
            <Text
              style={[
                styles.listItemSubText,
                { maxWidth: '40%' },
                Theme.fonts.default.regular,
              ]}
              numberOfLines={1}>
              {item.isNft
                ? '' //I18n.t(chainI18n[item.currency], { defaultValue: '' })
                : getSubText(item) || getMainText(item)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              marginRight: 16,
              flex: 3,
            }}>
            <Text
              style={[
                Theme.fonts.default.regular,
                styles.listItemSubText,
                { marginRight: 3, paddingBottom: 3, maxWidth: '80%' },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {getBalanceText(item)}
            </Text>
          </View>
        </>
      </TouchableRipple>
    </Surface>
  );
  return (
    <View>
      <Modal
        visible={true}
        transparent={true}
        style={Styles.container}
        animationType={'slide'}
        onRequestClose={_onBackHandle}>
        <Container style={Styles.bottomContainer}>
          <Headerbar
            transparent
            backIcon={require('../assets/image/ic_cancel.png')}
            title={I18n.t('select_asset')}
            onBack={onCancel}
            androidInsetTop={false}
          />
          <FlatList
            data={data}
            renderItem={_renderItem}
            keyExtractor={getKey}
            contentContainerStyle={styles.listContainer}
          />
        </Container>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  modalContent: {
    flex: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
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
  searchBar: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  listContainer: {
    marginHorizontal: 16,
    flexGrow: 1,
  },
  item: {
    backgroundColor: Theme.colors.pickerBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    height: 80,
    paddingHorizontal: 10,
  },
});
export default withTheme(AssetPickerLite);
