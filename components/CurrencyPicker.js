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
import { Icon, Container } from 'native-base';
import { Searchbar, Text } from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import IconSvgXml from './IconSvgXml';
import Headerbar from './Headerbar';
const clearIcon = require('../assets/image/ic_input_clear.png');
import { withTheme } from 'react-native-paper';
import { CHECK_ICON, LIST_ICON_SIMPLE_SIZE } from '../Constants';
import ListEmptyView from './ListEmptyView';
const CurrencyPicker: () => React$Node = ({
  theme,
  rawData = [],
  initSelect,
  clickItem,
  searchables = ['symbol', 'displayName'],
  itemStyle = {},
  getKey = item => `${item.currency}#${item.tokenAddress}`,
  getMainText = item => `${item.symbol}`,
  getSubText = item => `${item.displayName}`,
  getXmlKey = item => `${item.symbol}`,
  emptyDataText = I18n.t('no_data_available'),
  title = I18n.t('select_currency'),
  initShowModal = false,
  onBack = () => {},
}) => {
  const _getInitSelect = () =>
    initSelect || (rawData.length > 0 ? rawData[0] : {});
  const [showModal, setShowModal] = useState(initShowModal);
  const [selected, setSelected] = useState(_getInitSelect());
  const [keyword, setKeyword] = useState('');
  const isSelected = item => {
    if (!selected == null || item == null) {
      return false;
    }
    return getKey(selected) === getKey(item);
  };

  const _onBackHandle = () => {
    if (keyword.length > 0) {
      setKeyword('');
      return true;
    }
    if (showModal) {
      setShowModal(false);
      if (onBack) {
        onBack();
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (showModal) {
      StatusBar.setBackgroundColor(theme.colors.background);
    } else {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
      setKeyword('');
    }
    return function cleanup() {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    };
  }, [showModal]);
  useEffect(() => {
    let found = rawData.find(d => isSelected(d));
    if (!found) {
      setSelected(_getInitSelect());
    }
  }, [rawData]);

  const _filter = (item, keyword) => {
    if (!keyword) {
      return true;
    }
    const regex = new RegExp(keyword, 'i');
    for (let i = 0; i < searchables.length; i++) {
      const f = searchables[i];
      if (item[f] && item[f].toString().match(regex)) {
        return true;
      }
    }
    return false;
  };
  const data = rawData.filter(item => _filter(item, keyword));
  const _hideModal = () => {
    setShowModal(false);
  };
  const _renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelected(item);
        clickItem(item);
        _hideModal();
      }}
      style={styles.listItem}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconSvgXml xmlkey={getXmlKey(item)} fillType={'1'} />
        <Text style={styles.listItemText}>{getMainText(item)}</Text>
        <Text style={styles.listItemSubText}>{getSubText(item)}</Text>
      </View>
      {isSelected(item) && (
        <Image
          source={CHECK_ICON}
          style={{
            height: LIST_ICON_SIMPLE_SIZE,
            width: LIST_ICON_SIMPLE_SIZE,
          }}
        />
      )}
    </TouchableOpacity>
  );
  return (
    <View>
      {rawData.length > 0 ? (
        <TouchableOpacity
          disabled={rawData.length == 1}
          style={[styles.item, itemStyle]}
          onPress={() => {
            setShowModal(true);
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconSvgXml xmlkey={getXmlKey(selected)} fillType={'1'} />
            <View>
              <Text style={[styles.listItemText, Theme.fonts.default.heavy]}>
                {getMainText(selected)}
              </Text>
              <Text
                style={[styles.listItemSubText, Theme.fonts.default.regular]}>
                {getSubText(selected)}
              </Text>
            </View>
          </View>
          {data.length > 1 && (
            <Image source={require('../assets/image/ic_arrow_right.png')} />
          )}
        </TouchableOpacity>
      ) : (
        <Text
          style={[
            {
              backgroundColor: theme.colors.errorBg,
              color: theme.colors.error,
              textAlign: 'left',
              padding: 10,
              borderRadius: 6,
              overflow: 'hidden',
            },
          ]}>
          {emptyDataText}
        </Text>
      )}
      <Modal
        visible={showModal}
        transparent={true}
        style={Styles.container}
        animationType={'slide'}
        onRequestClose={_onBackHandle}>
        <Container style={Styles.bottomContainer}>
          <Headerbar
            transparent
            backIcon={require('../assets/image/ic_cancel.png')}
            title={title}
            onBack={() => {
              _hideModal();
              if (onBack) {
                onBack();
              }
            }}
            Parent={View}
          />
          <Searchbar
            inputStyle={[
              {
                backgroundColor: 'transparent',
                fontSize: 14,
              },
              Theme.fonts.default.regular,
            ]}
            style={styles.searchBar}
            iconColor={theme.colors.text}
            clearIcon={clearIcon}
            placeholderTextColor={theme.colors.placeholder}
            placeholder={I18n.t('search_placeholder')}
            onChangeText={keyword => setKeyword(keyword)}
            value={keyword}
          />
          <FlatList
            data={data}
            renderItem={_renderItem}
            keyExtractor={getKey}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <ListEmptyView
                text={I18n.t('no_search_result')}
                img={require('../assets/image/ic_no_search_result.png')}
              />
            }
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
    elevation: 0,
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
export default withTheme(CurrencyPicker);
