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
import { Text, withTheme } from 'react-native-paper';
import { CHECK_ICON, LIST_ICON_SIMPLE_SIZE } from '../Constants';
import ListEmptyView from './ListEmptyView';
const CurrencyPickerLite: () => React$Node = ({
  theme,
  rawData = [],
  clickItem,
  initSelected = {},
  getKey = item => {
    const s = `${item.currency}#${item.tokenAddress}`;
    return s;
  },
  getMainText = item => `${item.symbol}`,
  getSubText = item => `${item.displayName}`,
  getXmlKey = item => `${item.symbol}`,
  onCancel = () => {},
}) => {
  const _onBackHandle = () => {
    onCancel();
    return true;
  };
  const data = rawData;
  const _renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        clickItem(item);
      }}
      style={styles.listItem}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconSvgXml xmlkey={getXmlKey(item)} fillType={'1'} />
        <Text style={styles.listItemText}>{getMainText(item)}</Text>
        <Text style={styles.listItemSubText}>{getSubText(item)}</Text>
      </View>
    </TouchableOpacity>
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
            title={I18n.t('select_currency')}
            onBack={onCancel}
            Parent={View}
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
export default withTheme(CurrencyPickerLite);
