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
  SectionList,
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
import { signIn } from '../store/actions';
import RoundButton2 from './RoundButton2';
import { DotIndicator } from 'react-native-indicators';
import { useLayout } from '@react-native-community/hooks';
import { useNavigation } from 'react-navigation-hooks';
import { getL2MapCount, isL2MapEmpty } from '../Helpers';
import { WalletConnectSdk, Wallets } from '@cybavo/react-native-wallet-service';
const { V2Manager, WalletConnectHelper } = WalletConnectSdk;
const V2WalletConnectAssetPicker: () => React$Node = ({
  theme,
  rawData = {},
  initSelect = {},
  onConfirm,
  itemStyle = {},
  getKey = item => {
    if (!item) {
      return '';
    }
    const s = item.walletId;
    return s;
  },
  getMainText = item => `${item.name}`,
  getSubText = item => {
    return `${item.currencySymbol}`;
  },
  getSubText2 = item => `${item.address}`,
  getConfirmSelect = () => {},
  initShowModal = false,
  hasWallet,
}) => {
  const { onLayout, ...layout } = useLayout();
  const { navigate, goBack } = useNavigation();
  const [showModal, setShowModal] = useState(initShowModal);
  const [walletIdMap, setWalletIdMap] = useState(initSelect);
  const checkImg = require('../assets/image/ic_check3.png');
  const uncheckImg = require('../assets/image/ic_uncheck3_gray.png');
  const _onBackHandle = () => {
    if (showModal) {
      setShowModal(false);
      setWalletIdMap(getConfirmSelect());
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
  // const _getHeaderBottomPart(){
  //
  //   }
  const _renderSectionHeader = ({ section: { title, support, data } }) => {
    return (
      <View
        style={{
          paddingHorizontal: 0,
          backgroundColor: 'white',
        }}>
        <Text
          style={[
            Theme.fonts.default.regular,
            {
              paddingVertical: 15,
              fontSize: 14,
              color: theme.colors.gray600,
              fontWeight: 'bold',
            },
          ]}>
          {title}
        </Text>
        {data.length === 0 && (
          <View
            style={{
              marginTop: 0,
              marginBottom: 10,
              backgroundColor: Theme.colors.gray1,
              alignItems: 'center',
              borderRadius: 12,
            }}>
            <Text
              style={[
                Theme.fonts.default.regular,
                {
                  paddingVertical: 15,
                  fontSize: 14,
                  color: theme.colors.error,
                },
              ]}>
              {support
                ? `${I18n.t('no_wallet_text')}`
                : I18n.t('unsupported_chain_text')}
            </Text>
          </View>
        )}
      </View>
    );
  };
  const _renderItem = ({ item }) => {
    let key = getKey(item);
    let chain = `${item.caip2ChainId}`;
    let isSelected = walletIdMap[chain] && walletIdMap[chain][key] == true;
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          let nMap = { ...walletIdMap };
          if (nMap[chain] == null) {
            nMap[chain] = {};
          }
          if (nMap[chain][key] == null) {
            nMap[chain][key] = true;
          } else {
            delete nMap[chain][key];
          }
          setWalletIdMap(nMap);
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
          source={isSelected ? checkImg : uncheckImg}
          style={{ alignSelf: 'center', marginLeft: 12, width: 20, height: 20 }}
        />
      </TouchableOpacity>
    );
  };
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
            {`${I18n.t('change_wallet')} (${getL2MapCount(walletIdMap)})`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View>
      {isL2MapEmpty(walletIdMap) ? _getUnselectedView() : _getSelectedView()}
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
                  setWalletIdMap(getConfirmSelect());
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
                {I18n.t('wc_v2_select_wallet_hint')}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'column',
                alignSelf: 'center',
                width: '100%',
                flex: 1,
                justifyContent: 'space-between',
                marginTop: 10,
              }}>
              <SectionList
                stickySectionHeadersEnabled={false}
                sections={data}
                extraData={walletIdMap}
                renderItem={_renderItem}
                renderSectionHeader={_renderSectionHeader}
                keyExtractor={getKey}
                contentContainerStyle={[styles.listContainer]}
                ListEmptyComponent={
                  <ListEmptyView
                    text={I18n.t('no_search_result')}
                    img={require('../assets/image/ic_no_search_result.png')}
                  />
                }
              />
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  marginBottom: 0,
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  style={[
                    {
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      height: ROUND_BUTTON_HEIGHT,
                      alignSelf: 'stretch',
                    },
                  ]}
                  disabled={!hasWallet}
                  onPress={() => {
                    let nMap = {};
                    setWalletIdMap(nMap);
                  }}>
                  <Text
                    style={[
                      Theme.fonts.default.medium,
                      {
                        color: hasWallet
                          ? theme.colors.primary
                          : Theme.colors.primaryDisabled,
                        fontSize: 16,
                        alignSelf: 'center',
                      },
                    ]}>
                    {I18n.t('clear')}
                  </Text>
                </TouchableOpacity>

                <RoundButton2
                  height={ROUND_BUTTON_HEIGHT}
                  style={[
                    {
                      borderWidth: 0,
                      opacity: 1,
                      backgroundColor: hasWallet
                        ? theme.colors.primary
                        : Theme.colors.primaryDisabled,
                      alignSelf: 'stretch',
                      marginLeft: 80,
                    },
                  ]}
                  color={theme.colors.primary}
                  outlined={true}
                  labelStyle={[{ color: 'white', fontSize: 16 }]}
                  disabled={!hasWallet}
                  onPress={() => {
                    onConfirm({ ...walletIdMap });
                    _hideModal();
                  }}>
                  {I18n.t('apply')}
                </RoundButton2>
              </View>
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
export default withTheme(V2WalletConnectAssetPicker);
