import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Icon, Container } from 'native-base';
import { IconButton, Searchbar, Text } from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import IconSvgXml from './IconSvgXml';
import Headerbar from './Headerbar';
const clearIcon = require('../assets/image/ic_input_clear.png');
import { withTheme } from 'react-native-paper';
import {
  CHECK_ICON,
  LIST_ICON_SIMPLE_SIZE,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
} from '../Constants';
import ListEmptyView from './ListEmptyView';
import supportedChains from '../utils/chains';
import { signIn } from '../store/actions';
import RoundButton2 from './RoundButton2';
import { DotIndicator } from 'react-native-indicators';
import { useLayout } from '@react-native-community/hooks';
import { useNavigation } from 'react-navigation-hooks';
const WalletConnectAssetPicker: () => React$Node = ({
  theme,
  rawData = [],
  initSelect,
  clickItem,
  itemStyle = {},
  getKey = item => {
    if (!item) {
      return '';
    }
    const s = `${item.currency}#${item.tokenAddress}`;
    return s;
  },
  getMainText = item => `${item.name}`,
  getSubText = item => {
    let chainName = supportedChains[item.chainId]
      ? `(${supportedChains[item.chainId].name})`
      : `(${item.chainId})`;
    return `${item.currencySymbol} ${chainName}`;
  },
  getSubText2 = item => `${item.address}`,
  getXmlKey = item => `${item.currencySymbol}`,
  emptyDataText = I18n.t('no_data_available'),
  title = I18n.t('select_wallet'),
  initShowModal = false,
  onBack = () => {},
  dappName = '',
}) => {
  const { onLayout, ...layout } = useLayout();
  const { navigate, goBack } = useNavigation();
  const [showModal, setShowModal] = useState(initShowModal);
  const [selected, setSelected] = useState(initSelect);
  const isSelected = item => {
    if (!selected == null || item == null) {
      return false;
    }
    return getKey(selected) === getKey(item);
  };

  const _onBackHandle = () => {
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
    }
    return function cleanup() {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    };
  }, [showModal]);

  const data = rawData;
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
      style={[
        styles.listItem,
        { flexDirection: 'row', justifyContent: 'space-between' },
      ]}>
      <View style={{ flexDirection: 'column', flexShrink: 1 }}>
        <Text numberOfLines={2} style={[styles.listItemText]}>
          {getMainText(item)}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={styles.listItemSubText}>
          {getSubText(item)}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={styles.listItemSubText}>
          {getSubText2(item)}
        </Text>
      </View>
      <Image
        source={require('../assets/image/ic_arrow_right_black.png')}
        style={{ alignSelf: 'center', marginLeft: 12 }}
      />
    </TouchableOpacity>
  );
  const _getUnselectedView = () => {
    return (
      <RoundButton2
        outlined
        height={ROUND_BUTTON_HEIGHT}
        style={[
          {
            backgroundColor: theme.colors.primary,
            borderWidth: 0,
          },
          itemStyle,
        ]}
        icon={({ size, color }) => (
          <Image
            source={require('../assets/image/ic_tab_asset2.png')}
            style={{
              width: ROUND_BUTTON_ICON_SIZE,
              height: ROUND_BUTTON_ICON_SIZE,
            }}
          />
        )}
        labelStyle={[
          { color: theme.colors.text, fontSize: 16 },
          Theme.fonts.default.heavy,
        ]}
        onPress={() => setShowModal(true)}>
        {I18n.t('select_wallet')}
      </RoundButton2>
    );
  };
  const _getSelectedView = () => {
    return (
      <View>
        <View style={[styles.listItem, itemStyle]}>
          <Text numberOfLines={2} style={[styles.listItemText]}>
            {getMainText(selected)}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={styles.listItemSubText}>
            {getSubText(selected)}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={styles.listItemSubText}>
            {getSubText2(selected)}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            height: ROUND_BUTTON_HEIGHT,
            marginTop: 10,
          }}
          onPress={() => setShowModal(true)}>
          <Text
            style={[
              {
                color: theme.colors.primary,
                fontSize: 16,
                fontWeight: '800',
                textDecorationLine: 'underline',
              },
              Theme.fonts.default.medium,
            ]}>
            {I18n.t('change_wallet')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View>
      {selected ? _getSelectedView() : _getUnselectedView()}
      <Modal
        visible={showModal}
        transparent={true}
        contentContainerStyle={{
          flex: 1,
          shadowOpacity: 1,
        }}
        animationType={'slide'}
        onRequestClose={_onBackHandle}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            onLayout={onLayout}
            style={[
              {
                marginTop: Platform.os == 'ios' ? 20 : 0,
                alignItems: 'center',
                justifyContent: 'flex-start',
                flex: 1,
                paddingBottom: 32,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: theme.colors.surface,
              },
            ]}>
            <View
              style={{
                height: 56,
                borderBottomWidth: 1,
                borderColor: 'rgba(9,16,42,0.1)',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
              }}>
              <View
                style={{
                  height: 56,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  position: 'absolute',
                  left: 0,
                }}>
                <Text
                  style={[
                    {
                      fontSize: 20,
                      color: Theme.colors.gunmetal,
                      textAlign: 'center',
                      paddingHorizontal: 16,
                    },
                    Theme.fonts.default.heavyBold,
                  ]}>
                  {I18n.t('select_wallet')}
                </Text>
              </View>
              <IconButton
                borderless
                style={{ marginRight: 8 }}
                color={'rgba(255, 255, 255, 0.56)'}
                onPress={() => {
                  setShowModal(false);
                }}
                icon={({ size, color }) => (
                  <Image
                    source={require('../assets/image/ic_cancel_gray.png')}
                    style={{ width: 24, height: 24 }}
                  />
                )}
                accessibilityTraits="button"
                accessibilityComponentType="button"
                accessibilityRole="button"
              />
            </View>
            <View
              style={[
                {
                  marginTop: 24,
                  alignSelf: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginHorizontal: 24,
                },
              ]}>
              <Image
                source={require('../assets/image/ic_info2.png')}
                resizeMode="stretch"
                style={{
                  width: 20,
                  height: 20,
                }}
              />
              <Text
                style={[
                  {
                    fontSize: 12,
                    color: Theme.colors.primary,
                    flexShrink: 1,
                    marginLeft: 8,
                  },
                ]}>
                {I18n.t('select_wallet_hint', { name: dappName })}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: 10,
                // marginTop: layout.height / 4,
              }}>
              <FlatList
                data={data}
                renderItem={_renderItem}
                keyExtractor={getKey}
                contentContainerStyle={[styles.listContainer]}
                ListEmptyComponent={
                  <ListEmptyView
                    text={I18n.t('no_search_result')}
                    img={require('../assets/image/ic_no_search_result.png')}
                  />
                }
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  modalContent: {
    flex: 0,
  },
  listItem: {
    backgroundColor: Theme.colors.gray1,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.resultContent,
  },
  listItemSubText: {
    fontSize: 12,
    marginTop: 2,
    color: Theme.colors.gray600,
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
    paddingBottom: 108,
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
export default withTheme(WalletConnectAssetPicker);
