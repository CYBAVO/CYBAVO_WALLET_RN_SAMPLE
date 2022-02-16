import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Image,
  SectionList,
  StatusBar,
} from 'react-native';
import { Icon, Container } from 'native-base';
import {
  Searchbar,
  withTheme,
  Text,
  Surface,
  TouchableRipple,
} from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import IconSvgXml from './IconSvgXml';
import Headerbar from './Headerbar';
import {
  CHECK_ICON,
  LIST_ICON_SIMPLE_SIZE,
  nftIcons,
  SMALL_ICON_SIMPLE_SIZE,
} from '../Constants';
import { getWalletKeyByWallet } from '../Helpers';
import { fetchCurrenciesIfNeed } from '../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import ListEmptyView from './ListEmptyView';
const { width } = Dimensions.get('window');
const clearIcon = require('../assets/image/ic_input_clear.png');
const AssetPicker: () => React$Node = ({
  theme,
  rawData = [],
  isNftTop = false,
  recentSet = new Set(),
  clickItem,
  initSelected = rawData.length > 0 ? rawData[0] : {},
  searchables = ['currencySymbol', 'currencyDisplayName'],
  getKey = item => {
    const s = `${item.currency}#${item.tokenAddress}`;
    return s;
  },
  getMainText = item =>
    item.isNft ? item.currencyDisplayName : item.currencySymbol,
  getSubText = item => {
    if (item.currencyDisplayName) {
      return item.currencyDisplayName;
    } else if (rawData.length > 0 && rawData[0].currencyDisplayName) {
      let key = getWalletKeyByWallet(item);
      let foundItem = rawData.find(
        wallet => getWalletKeyByWallet(wallet) == key
      );
      return foundItem.currencyDisplayName;
    }
    return null;
  },
  getXmlKey = item => item.currencySymbol,
  getBalanceText = item => '',
}) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(initSelected);
  const [keyword, setKeyword] = useState('');
  const nftWallets = useSelector(state => {
    return state.wallets.nftWallets || [];
  });
  const isSelected = item => {
    if (!selected == null || item == null) {
      return false;
    }
    return getKey(selected) === getKey(item);
  };

  useEffect(() => {
    dispatch(fetchCurrenciesIfNeed());
  }, [dispatch]);

  useEffect(() => {
    setSelected(initSelected);
    clickItem(initSelected);
  }, [initSelected]);

  const _onBackHandle = () => {
    if (keyword.length > 0) {
      setKeyword('');
      return true;
    }
    if (showModal) {
      setShowModal(false);
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
  }, [showModal]);

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
  const getData = () => {
    let subData = [];
    let mainData = [];
    let subDataTitle = '';
    let mainDataTitle = '';
    if (nftWallets.length == 0) {
      mainData = rawData;
      mainDataTitle = I18n.t('select_asset');
      subDataTitle = I18n.t('select_asset_nft');
    } else {
      if (isNftTop) {
        mainData = nftWallets;
        subData = rawData.filter(item => !item.isNft);
        mainDataTitle = I18n.t('asset_nft');
        subDataTitle = I18n.t('asset');
      } else {
        mainData = rawData.filter(item => !item.isNft);
        subData = nftWallets;
        mainDataTitle = I18n.t('asset');
        subDataTitle = I18n.t('asset_nft');
      }
    }
    const allData = mainData.filter(item => _filter(item, keyword));
    if (mainData.length <= 5) {
      const d = [];
      d.push({
        title: mainDataTitle,
        data: allData,
      });
      if (subData.length > 0) {
        d.push({
          title: subDataTitle,
          data: subData,
        });
      }
      return d;
    } else {
      let recentData = [];
      let otherData = [];
      for (let i = 0; i < allData.length; i++) {
        let key = getWalletKeyByWallet(allData[i]);
        if (recentSet.has(key)) {
          recentData = recentData.concat(allData[i]);
        } else {
          otherData = otherData.concat(allData[i]);
        }
      }
      const d = [];
      if (recentData.length > 0) {
        d.push({
          title: I18n.t('recent'),
          data: recentData,
        });
      }
      if (otherData.length > 0) {
        d.push({
          title: mainDataTitle,
          data: otherData,
        });
      }
      if (subData.length > 0) {
        d.push({
          title: subDataTitle,
          data: subData,
        });
      }
      return d;
    }
  };
  const data = getData();
  const _hideModal = () => {
    setShowModal(false);
  };
  const _renderSectionHeader = ({ section: { title } }) => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.background,
          paddingHorizontal: 16,
        }}>
        <Text
          style={[
            Theme.fonts.default.regular,
            Styles.secHeaderLabel,
            { paddingVertical: 15, fontSize: 14 },
          ]}>
          {title}
        </Text>
      </View>
    );
  };
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
          setSelected(item);
          clickItem(item);
          _hideModal();
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
            {isSelected(item) ? (
              <Image
                source={CHECK_ICON}
                style={{
                  height: LIST_ICON_SIMPLE_SIZE,
                  width: LIST_ICON_SIMPLE_SIZE,
                }}
              />
            ) : (
              <View
                style={{
                  height: LIST_ICON_SIMPLE_SIZE,
                  width: LIST_ICON_SIMPLE_SIZE,
                }}
              />
            )}
          </View>
        </>
      </TouchableRipple>
    </Surface>
  );
  return (
    <View>
      <TouchableOpacity
        style={[styles.item]}
        onPress={() => {
          setShowModal(true);
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {selected.isNft ? (
            <Image
              resizeMode="stretch"
              source={nftIcons[selected.iconIndex]}
              style={{
                height: 20,
                width: 20,
                alignSelf: 'center',
              }}
            />
          ) : (
            <IconSvgXml
              xmlkey={getXmlKey(selected)}
              width={SMALL_ICON_SIMPLE_SIZE}
              height={SMALL_ICON_SIMPLE_SIZE}
            />
          )}
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={[
              Styles.currencyTextMain,
              Theme.fonts.default.heavy,
              {
                maxWidth: '90%',
                textAlign: 'center',
                fontSize: 20,
              },
            ]}>
            {getSubText(selected)}
          </Text>
        </View>
        <Image source={require('../assets/image/ic_arrow_right.png')} />
      </TouchableOpacity>
      <Modal
        visible={showModal}
        transparent={true}
        style={Styles.container}
        animationType={'slide'}
        onRequestClose={_onBackHandle}>
        <Container style={Styles.bottomContainer}>
          <Headerbar
            backIcon={require('../assets/image/ic_cancel.png')}
            transparent
            title={I18n.t('select_asset')}
            onBack={() => _hideModal()}
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
          <SectionList
            sections={data}
            renderItem={_renderItem}
            renderSectionHeader={_renderSectionHeader}
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
    // maxWidth: '75%',
    fontWeight: 'bold',
  },
  listItemSubText: {
    fontSize: 14,
    marginLeft: 15,
    flexShrink: 1,
    color: Theme.colors.placeholder,
  },
  searchBar: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    elevation: 0,
    // marginHorizontal: 16,
  },
  listContainer: {
    flexGrow: 1,
  },
  item: {
    backgroundColor: Theme.colors.pickerBgTransparent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    marginLeft: 20,
    // height: 60,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
});
export default withTheme(AssetPicker);
