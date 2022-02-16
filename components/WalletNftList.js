import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  VirtualizedList,
  Image,
} from 'react-native';
import CardItem from './CardItem';
import { useSelector, useDispatch } from 'react-redux';
import CurrencyText from './CurrencyText';
const { width, height } = Dimensions.get('window');
import Styles from '../styles/Styles';
import CurrencyPriceText from './CurrencyPriceText';
import {
  effectiveBalance,
  explorer,
  explorerNft,
  getNftColorIndex,
  getNftIconIndex,
  getWalletKeyByWallet,
  renderNftItem,
} from '../Helpers';
import I18n from '../i18n/i18n';
import { Text, withTheme } from 'react-native-paper';
import { nftEndColors, nftStartColors, Theme } from '../styles/MainTheme';
import ListEmptyView from './ListEmptyView';
import {
  Coin,
  nftIcons,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';
import { fetchCurrenciesIfNeed, fetchTokenUriIfNeed } from '../store/actions';
const WalletNftList: () => React$Node = ({
  theme,
  wallets = [],
  latestKey,
  hide = false,
  onClickSectionAction = ({ item }) => {},
  onClickAction = ({ item }) => {},
  onRefresh,
  refreshing,
  renderFooter,
}) => {
  const expolreImg = require('../assets/image/open_window.png');
  const config = useSelector(state => {
    return state.auth.config;
  });
  const tokenUriMap = useSelector(state => {
    return state.tokenUri.tokenUriMap;
  });
  const _getDataSub721 = (
    wallet,
    columns,
    startColor,
    endColor,
    title,
    icon,
    i,
    secData
  ) => {
    let total = wallets[i].tokens.length;
    for (let t = 0; t < wallet.tokens.length; t++) {
      columns[t % 2].push({
        ...wallet,
        tokenId: wallet.tokens[t],
        startColor: startColor,
        endColor: endColor,
        icon: icon,
      });
      if ((t + 1) % 6 == 0) {
        secData.push({
          title: title,
          total: total,
          wallet: { ...wallet },
          icon: icon,
          index: i,
          data: [{ columns: columns }],
        });
        columns = [[], []];
        title = '';
      }
    }
    if (wallet.tokens.length == 0 || wallet.tokens.length % 6 != 0) {
      secData.push({
        title: title,
        total: total,
        wallet: { ...wallet },
        icon: icon,
        index: i,
        data: [{ columns: columns }],
      });
    }
    return secData;
  };
  const _getDataSub1155 = (
    wallet,
    columns,
    startColor,
    endColor,
    title,
    icon,
    i,
    secData
  ) => {
    let total = wallets[i].tokenIdAmounts.length;
    for (let t = 0; t < wallet.tokenIdAmounts.length; t++) {
      columns[t % 2].push({
        ...wallet,
        tokenId: wallet.tokenIdAmounts[t].tokenId,
        amount: wallet.tokenIdAmounts[t].amount,
        startColor: startColor,
        endColor: endColor,
        icon: icon,
      });
      if ((t + 1) % 6 == 0) {
        secData.push({
          title: title,
          total: total,
          wallet: { ...wallet },
          icon: icon,
          index: i,
          data: [{ columns: columns }],
        });
        columns = [[], []];
        title = '';
      }
    }
    if (
      wallet.tokenIdAmounts.length == 0 ||
      wallet.tokenIdAmounts.length % 6 != 0
    ) {
      secData.push({
        title: title,
        total: total,
        wallet: { ...wallet },
        icon: icon,
        index: i,
        data: [{ columns: columns }],
      });
    }
    return secData;
  };
  const _getData = () => {
    let secData = [];
    for (let i = 0; i < wallets.length; i++) {
      let columns = [[], []];
      let colorIndex = wallets[i].colorIndex;
      let iconIndex = wallets[i].iconIndex; //getNftIconIndex(i);
      let title = wallets[i].currencyDisplayName;
      let startColor = nftStartColors[colorIndex];
      let endColor = nftEndColors[colorIndex];
      let icon = nftIcons[iconIndex];

      secData =
        wallets[i].tokenVersion == 721
          ? _getDataSub721(
              wallets[i],
              columns,
              startColor,
              endColor,
              title,
              icon,
              i,
              secData
            )
          : _getDataSub1155(
              wallets[i],
              columns,
              startColor,
              endColor,
              title,
              icon,
              i,
              secData
            );
    }
    return secData;
  };
  const _renderSectionHeader = ({
    section: { title, total, wallet, icon, index },
  }) => {
    if (title == '') {
      return <View />;
    }
    let marginTop = index == 0 ? 0 : 16;
    return (
      <>
        <TouchableOpacity
          style={[
            {
              backgroundColor: 'rgba(255,255,255,0.08)',
              paddingVertical: 4,
              borderRadius: 12,
              marginBottom: 16,
              marginTop: marginTop,
              justifyContent: 'space-between',
              paddingHorizontal: 8,
              flexDirection: 'row',
              alignItems: 'center',
              textAlign: 'center',
              alignSelf: 'stretch',
              overflow: 'hidden',
            },
          ]}
          onPress={() => {
            onClickSectionAction(wallet);
          }}>
          <View style={{ flexDirection: 'row', flexShrink: 1 }}>
            <Image
              resizeMode="stretch"
              source={icon}
              style={{
                height: 16,
                width: 16,
                marginRight: 8,
                alignSelf: 'center',
              }}
            />
            <Text
              style={[
                Styles.secHeaderLabel,
                {
                  flexShrink: 1,
                  fontSize: 12,
                  color: theme.colors.sliver,
                  opacity: 1,
                },
                Theme.fonts.default.regular,
              ]}>
              {title}
            </Text>
          </View>
          <Text
            style={[
              {
                marginLeft: 8,
                backgroundColor: theme.colors.primary,
                color: 'white',
                fontSize: 14,
                borderRadius: 12,
                paddingVertical: 2,
                paddingHorizontal: 8,
                minWidth: 35,
                overflow: 'hidden',
                textAlign: 'center',
              },
              Theme.fonts.default.regular,
            ]}>
            {total}
          </Text>
        </TouchableOpacity>
        {/*{total == 0 && (*/}
        {/*  <Text*/}
        {/*    style={{*/}
        {/*      fontSize: 14,*/}
        {/*      opacity: 0.7,*/}
        {/*      marginTop: 4,*/}
        {/*      marginBottom: 14,*/}
        {/*      textAlign: 'center',*/}
        {/*    }}>*/}
        {/*    {I18n.t('nft_list_empty_desc')}*/}
        {/*  </Text>*/}
        {/*)}*/}
      </>
    );
  };

  const data = _getData();
  const _getSingleItem = (item, style) => {
    return renderNftItem(
      item,
      onClickAction,
      config,
      expolreImg,
      0,
      tokenUriMap
    );
  };
  return (
    <SectionList
      stickySectionHeadersEnabled={false}
      CellRendererComponent={null}
      sections={data}
      renderSectionHeader={_renderSectionHeader}
      renderItem={({ item, index, separators }) => {
        return _getSingleItem(item);
      }}
      keyExtractor={wallet => `${wallet.tokenId}`}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 16,
        minHeight: '100%',
      }}
      ListEmptyComponent={
        <View style={[Styles.emptyContent]}>{renderFooter()}</View>
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.placeholder}
          />
        ) : null
      }
      ListFooterComponent={data.length == 0 ? null : renderFooter}
    />
  );
};

const styles = StyleSheet.create({
  scroll: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    // paddingHorizontal: 16,
    paddingBottom: 24,
  },
  root: {
    flex: 1,
    margin: 16,
  },
  container: {
    flex: 1,
  },
});

export default withTheme(WalletNftList);
