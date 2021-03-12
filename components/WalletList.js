import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SectionList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import CardItem from './CardItem';
import { useSelector, useDispatch } from 'react-redux';
import CurrencyText from './CurrencyText';
const { width, height } = Dimensions.get('window');
import Styles from '../styles/Styles';
import CurrencyPriceText from './CurrencyPriceText';
import { effectiveBalance, getWalletKeyByWallet } from '../Helpers';
import I18n from '../i18n/i18n';
import { Text, withTheme } from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
import ListEmptyView from './ListEmptyView';
const WalletList: () => React$Node = ({
  theme,
  wallets = [],
  latestKey,
  hide = false,
  onClickAction = ({ item }) => {},
  onRefresh,
  refreshing,
}) => {
  const h = 120;
  const offset = 100;
  const w = width * 0.9;
  const marginHorizontal = 32;
  const balances = useSelector(state => state.balance.balances || {});
  const currencyPrice = useSelector(state => state.currencyPrice.currencyPrice);
  const _getData = () => {
    switch (wallets.length) {
      case 0:
        return [];
      case 1:
        return [{ title: '', data: wallets }];
    }
    let latest;
    let others = [];
    for (let i = 0; i < wallets.length; i++) {
      let key = getWalletKeyByWallet(wallets[i]);
      if (key == latestKey) {
        latest = wallets[i];
      } else {
        others.push(wallets[i]);
      }
    }
    if (latest) {
      return [
        { title: I18n.t('latest'), data: [latest] },
        { title: I18n.t('more'), data: others },
      ];
    } else if (others.length > 0) {
      return [{ title: '', data: others }];
    }
    return [];
  };
  const _renderSectionHeader = ({ section: { title } }) => {
    if (title == '') {
      return <View />;
    }
    return (
      <View style={{ backgroundColor: theme.colors.background }}>
        <Text
          style={[
            Styles.secHeaderLabel,
            { paddingVertical: 15 },
            Theme.fonts.default.regular,
          ]}>
          {title}
        </Text>
      </View>
    );
  };
  const data = _getData();
  const _getSingleItem = (wallet, style) => {
    let key = getWalletKeyByWallet(wallet);
    let balance = effectiveBalance(balances[key]);
    return (
      <View
        style={[
          {
            height: h,
            width: w,
            alignSelf: 'center',
            //shadow
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.58,
            shadowRadius: 16.0,
          },
          style,
        ]}>
        <CardItem
          onPress={() => {
            onClickAction(wallet);
          }}
          bgImageStyle={{ width: w, height: h }}
          type={wallet.currencySymbol}
          hide={hide}
          title={wallet.currencySymbol}
          subTitle={
            <CurrencyText
              currency={wallet.currency}
              tokenAddress={wallet.tokenAddress}
              currencySymbol={wallet.currencySymbol}
              textStyle={[Styles.cardSubTitle, Theme.fonts.default.regular]}
              hide={hide}
            />
          }
          desc={wallet.name}
          amount={balance}
          amount2={maxWidth => {
            return (
              !hide &&
              !wallet.isFungible &&
              currencyPrice && (
                <CurrencyPriceText
                  wallets={[wallet]}
                  textStyle={[
                    Styles.cardDesc,
                    Theme.fonts.default.heavyBold,
                    { maxWidth: maxWidth, textAlign: 'right' },
                  ]}
                />
              )
            );
          }}
          // onPress={() => onClickAction(wallet)}
        />
      </View>
    );
  };
  return (
    <SectionList
      stickySectionHeadersEnabled={false}
      sections={data}
      renderSectionHeader={_renderSectionHeader}
      renderItem={({ item, index, separators }) => {
        return _getSingleItem(item);
      }}
      CellRendererComponent={({ children, index, style, ...props }) => {
        if (!children[0] || !children[0].props) {
          return <View {...props}>{children}</View>;
        }
        if (!children[0].props.cellKey || !children[0].props.trailingItem) {
          return children[0].props.item ? (
            <View {...props} style={{ zIndex: 10 }}>
              {children}
            </View>
          ) : (
            <View {...props}>{children}</View>
          );
        }
        return (
          <View {...props} style={{ height: 100, zIndex: 10 }}>
            {children}
          </View>
        );
      }}
      keyExtractor={wallet => `${wallet.walletId}`}
      // ListFooterComponent={() =>  <View style={{ height: 30 }} />}
      ListHeaderComponent={
        data.length == 1 ? <View style={{ height: 12 }} /> : null
      } // avoid first item being hided while pressing
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 16,
        minHeight: '105%',
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.placeholder}
          />
        ) : null
      }
      ListEmptyComponent={<ListEmptyView style={{ height: height * 0.5 }} />}
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

export default withTheme(WalletList);
