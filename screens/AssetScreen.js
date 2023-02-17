import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
} from 'react-native';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';
import Tab from '../components/Tab';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
const { width, height } = Dimensions.get('window');

import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUserState,
  fetchWallets,
  fetchCurrencyPricesIfNeed,
  EXCHANGE_CURRENCIES,
  EXCHANGE_CURRENCY_UPDATE,
  fetchBalance,
  fetchApiHistory,
  walletconnectSync,
  newSession,
  WALLETCONNECT_PENDING_URI,
  fetchCurrencies,
  startFetchFee,
  stopFetchFee,
  getSkipNews,
  setSkipNews,
  AUTH_UPDATE_GLOBAL_MODAL,
  fetchTokenUriIfNeed,
  fetchSameCurrencyWalletLimit,
  checkApplicantStatusAndNext,
  KYC_APPLICANT_STATUS_UPDATE,
  KYC_APPLICANT_STATUS_ERROR,
  canGoKyc,
  inSuList,
  fetchSolNftTokens,
  initSignClient,
  initAccountWalletMap,
  fetchSupportedChain,
} from '../store/actions';
import I18n, { LanguageIndexMap } from '../i18n/i18n';
import WalletList from '../components/WalletList';
import Dropdown from '../components/Dropdown';
import TransactionList from '../components/TransactionList';
import Headerbar from '../components/Headerbar';
import {
  ActivityIndicator,
  FAB,
  IconButton,
  Text,
  withTheme,
} from 'react-native-paper';
import { NO_MORE } from './WalletDetailScreen';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useNavigationParam } from 'react-navigation-hooks';
import { useAppState } from '@react-native-community/hooks';
import {
  convertAmountFromRawNumber,
  convertHexToString,
  getConnectionList,
  getExchangeAmountFromWallets,
  getRestCurrencies,
  getWalletConnectSvg,
  getWalletConnectSvg2,
  getWalletKeyByWallet,
  hasValue,
  renderTabBar,
  toast,
  toastError,
} from '../Helpers';
import CurrencyPriceTextLite from '../components/CurrencyPriceTextLite';
import NavigationService from '../NavigationService';
import { SvgXml } from 'react-native-svg';
import { WalletConnectSdk, Wallets } from '@cybavo/react-native-wallet-service';
const { V2Manager } = WalletConnectSdk;
import {
  ADD_SVG,
  ALL_WALLET_ID,
  CANCEL_SVG,
  Coin,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_LARGE_HEIGHT,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import SectionWaterFallList from '../components/SectionWaterFallList';
import WalletNftList from '../components/WalletNftList';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
} from '../components/ResultModal';
import { KycHelper } from '../utils/KycHelper';
const MyLoader = props => {
  let cardWidth = width - 32;
  let cardHeight = 120;
  let cardRadius = 7;
  let cardListTop = height * 0.29 + 20;
  let cardListMarginTop = 120 + 15;
  return (
    <ContentLoader
      speed={0.6}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      backgroundColor="#1C223A"
      foregroundColor="#292F45"
      {...props}>
      {/*top*/}
      <Rect x="16" y={height * 0.15} rx="3" ry="3" width="120" height="25" />
      <Rect
        x={width - 76}
        y={height * 0.15 + 7}
        rx="3"
        ry="3"
        width="58"
        height="15"
      />
      {/*tab*/}
      <Rect x="35" y={height * 0.25} rx="3" ry="3" width="53" height="15" />
      <Rect x="125" y={height * 0.25} rx="3" ry="3" width="53" height="15" />
      {/*card*/}
      {[0, 1, 2, 3].map(i => (
        <Rect
          key={i}
          x="16"
          y={cardListTop + cardListMarginTop * i}
          rx={cardRadius}
          ry={cardRadius}
          width={cardWidth}
          height={cardHeight}
        />
      ))}
    </ContentLoader>
  );
};
const H_MAX_HEIGHT = 150;
const H_MIN_HEIGHT = 52;
const H_SCROLL_DISTANCE = H_MAX_HEIGHT - H_MIN_HEIGHT;

const AssetScreen: () => React$Node = ({ theme, navigation: { navigate } }) => {
  const NA = '-';
  const dispatch = useDispatch();
  const setPin = useSelector(state => state.user.userState.setPin);
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const scrollOffsetY2 = useRef(new Animated.Value(0)).current;
  const startKycParam = useNavigationParam('startKyc');

  useEffect(() => {
    if (startKycParam) {
      KycHelper.getLanguageAndStartKyc(
        kycUserExist,
        setLoading,
        dispatch,
        setResult
      );
    }
  }, [startKycParam]);
  const headerScrollHeight = scrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  const headerScrollOpacity = scrollOffsetY.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const headerScrollHeight2 = scrollOffsetY2.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  const headerScrollOpacity2 = scrollOffsetY2.interpolate({
    inputRange: [0, H_SCROLL_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const wallets = useSelector(state => {
    return state.wallets.wallets || [];
  });
  const nftWallets = useSelector(state => {
    let stateW = state.wallets.nftWallets || [];
    let solWalletMap = state.wallets.solWalletMap || {};
    let newW = [];
    let stateB = state.balance.balances || {};
    for (let i = 0; i < stateW.length; i++) {
      if (stateW[i].tokenVersion == 721) {
        let k = getWalletKeyByWallet(stateW[i]);
        let b = stateB[k];
        if (b == null || b.tokens == null || b.tokens.length == 0) {
          newW.push({ ...stateW[i], tokens: [] });
        } else {
          newW.unshift({ ...stateW[i], tokens: b.tokens });
        }
      } else if (stateW[i].tokenVersion == 1155) {
        let k = getWalletKeyByWallet(stateW[i]);
        let b = stateB[k];
        if (
          b == null ||
          b.tokenIdAmounts == null ||
          b.tokenIdAmounts.length == 0
        ) {
          newW.push({ ...stateW[i], tokenIdAmounts: [] });
        } else {
          newW.unshift({ ...stateW[i], tokenIdAmounts: b.tokenIdAmounts });
        }
      }
    }
    newW.push(...Object.values(solWalletMap));
    return newW;
  });

  const refresh = useNavigationParam('refresh');
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hideZeroNft, setHideZeroNft] = useState(false);
  const currencyPriceLoading = useSelector(
    state => state.currencyPrice.loading
  );
  const deeplink = useSelector(state => state.walletconnect.deeplink);
  const walletsLoading = useSelector(state => state.wallets.loading);
  const ethWallet = useSelector(state => state.wallets.ethWallet);
  const kycResult = useSelector(state => state.kyc.applicantStatus.result);
  const kycUserExist = useSelector(state => state.kyc.userExist);
  const [loading, setLoading] = useState(false);
  const [hide, setHide] = useState(false);
  const [result, setResult] = useState(null);
  const [hasV2Connection, setHasV2Connection] = useState(false);

  const hasConnection = useSelector(state => {
    return Object.keys(state.walletconnect.connecting).length > 0;
  });
  const v2RefreshTimestamp = useSelector(
    state => state.walletconnect.v2RefreshTimestamp
  );
  useEffect(() => {
    if (!v2RefreshTimestamp) {
      return;
    }
    try {
      setHasV2Connection(
        V2Manager.signClient &&
          (V2Manager.signClient.session.values.length > 0 ||
            V2Manager.signClient.pairing.values.length > 0)
      );
    } catch (error) {
      console.log(error);
    }
  }, [v2RefreshTimestamp]);
  const enableWalletconnect = useSelector(state => {
    // console.debug(
    //   `enableWalletconnect:${state.user.userState.enableWalletconnect}`
    // );
    return state.user.userState.enableWalletconnect;
  });

  const hasApiHistory = useSelector(state => {
    let hasApiHistory = false;
    try {
      let apihistoryMap = state.apihistory.apihistory[ALL_WALLET_ID].data;
      let arr = Object.values(apihistoryMap);
      if (arr.length > 0) {
        hasApiHistory = true;
      }
    } catch (error) {
      console.debug(error);
    }
    return hasApiHistory;
  });
  const balances = useSelector(state => state.balance.balances || {});
  const canAddAsset = useSelector(state => {
    if (ready == false) {
      return false;
    }
    let restCurrencies = getRestCurrencies(
      state.currency.currencies,
      state.wallets.wallets,
      state.wallets.walletLimit
    );
    return restCurrencies.length > 0;
  });
  const exchangeCurrency = useSelector(
    state => state.currencyPrice.exchangeCurrency
  );
  const currencyPrice = useSelector(
    state => state.currencyPrice.currencyPrice || {}
  );
  const exchangeAmount = useSelector(state => {
    let keys = Object.keys(balances);
    if (keys.length == 0) {
      return null;
    } else {
      if (ready == false) {
        // if already show UI, don't make exchangeAmount null
        for (let k of keys) {
          if (balances[k].loading != false) {
            return;
          }
        }
      }
      let value = getExchangeAmountFromWallets(
        wallets,
        exchangeCurrency,
        balances,
        currencyPrice,
        3
      );
      if (value == null) {
        return NA; // null means not ready
      }
      return value;
    }
  });
  // const appState = useAppState();
  // useEffect(() => {
  //   if (appState == 'active') {
  //     getSkipNews()
  //       .then(skip => {
  //         if (!skip) {
  //           NavigationService.navigate('GlobalModal', {
  //             isNews: true,
  //           });
  //         }
  //       })
  //       .catch(error => {});
  //   }
  // }, [appState]);

  useEffect(() => {
    console.reportErrorsAsExceptions = false;
    dispatch(fetchSameCurrencyWalletLimit());
    dispatch(fetchWallets());
    dispatch(fetchUserState());
    dispatch(initSignClient());
    dispatch(fetchSupportedChain());
  }, [dispatch]);

  useEffect(() => {
    if (!refresh) {
      return;
    }
    dispatch(fetchSameCurrencyWalletLimit());
    dispatch(fetchWallets());
    dispatch(fetchUserState());
  }, [refresh]);

  useEffect(() => {
    dispatch(fetchCurrencyPricesIfNeed(true));
  }, [dispatch, wallets]);
  useEffect(() => {
    if (!ready) {
      return;
    }
    if (ethWallet) {
      dispatch(fetchApiHistory(false));
    }
    // if (nftWallets.length != 0) {
    //   dispatch(fetchTokenUriIfNeed(nftWallets, true));
    // }

    if (deeplink) {
      if (Date.now() - deeplink.timestamp < 240000) {
        if (ethWallet) {
          NavigationService.navigate('Connecting', {});
          dispatch(newSession(deeplink.uri, null, null, ethWallet));
          dispatch({ type: WALLETCONNECT_PENDING_URI, uri: null });
        } else {
          toast(I18n.t('no_eth_wallet_prompt'));
        }
      }
    }
  }, [dispatch, ethWallet, ready, deeplink]);

  useEffect(() => {
    wallets.map((wallet, i) => {
      dispatch(
        fetchBalance(wallet.currency, wallet.tokenAddress, wallet.address, true)
      );
      if (wallet.currency == Coin.SOL) {
        dispatch(fetchSolNftTokens(wallet));
      }
    });
  }, [dispatch, wallets]);

  useEffect(() => {
    if (
      walletsLoading == false &&
      (wallets.length == 0 ||
        (currencyPriceLoading == false && exchangeAmount != null))
    ) {
      dispatch(initAccountWalletMap(wallets));
      setReady(true);
      setRefreshing(false);
    }
  }, [currencyPriceLoading, walletsLoading, exchangeAmount, wallets]);

  //retry to fetch currencyPrice
  useEffect(() => {
    if (exchangeAmount == NA) {
      setHide(false);
      setTimeout(() => {
        dispatch(fetchCurrencyPricesIfNeed(true));
      }, 3000);
    }
  }, [exchangeAmount]);

  const transactions = useSelector(state => {
    if (state.transactions.transactions == null) {
      return null;
    }
    let data = [];
    let byWalletTxs = Object.values(state.transactions.transactions);
    for (let i = 0; i < byWalletTxs.length; i++) {
      if (byWalletTxs[i].data == null) {
        continue;
      }
      data = data.concat(Object.values(byWalletTxs[i].data));
    }
    data.sort((a, b) => b.timestamp - a.timestamp);
    return data;
  });
  const latestKey = useSelector(state => {
    if (
      state.transactions.transactions == null ||
      state.transactions.transactions.latestTx == null
    ) {
      return null;
    }
    return state.transactions.transactions.latestTx.address;
  });

  const unhideImg = require('../assets/image/ic_unhide.png');
  const hideImg = require('../assets/image/ic_hide.png');
  let _scrollX = new Animated.Value(0);
  useEffect(() => {
    if (setPin === false) {
      NavigationService.navigate('SetupPin');
    }
  }, [navigate, setPin]);
  const _refresh = () => {
    setRefreshing(true);
    dispatch(fetchWallets());
    dispatch(fetchCurrencyPricesIfNeed(true));
    dispatch(fetchApiHistory());
  };
  const _refreshCurrency = () => {
    setRefreshing(true);
    dispatch(fetchCurrencies());
    dispatch(fetchWallets());
    if (nftWallets.length != 0) {
      dispatch(fetchTokenUriIfNeed(nftWallets, true));
    }
  };

  const loadData2: () => Item[] = () => {
    let sec = [];
    for (let s = 0; s < 15; s++) {
      let res: Item[] = [];
      for (let i = 0; i < s; i++) {
        // res.push({
        //   _height: 100 + Math.floor(100 * Math.random()),
        //   _color: getRandowColor(),
        // });
        if (i % 3 == 0) {
          res.push(
            Math.floor(100 * Math.random()) *
              Math.floor(999999999991234 * Math.random()) *
              Math.floor(10000 * Math.random())
          );
        } else if (i % 3 == 1) {
          res.push(Math.floor(100 * Math.random()));
        } else {
          res.push(Math.floor(10000 * Math.random()));
        }
      }
      sec.push({
        displayName: 'collection' + s,
        currencySymbol: 'c' + s,
        tokens: res,
      });
    }
    return sec;
  };
  let testData = loadData2();

  const _checkApplicantDataAndNext = (next = () => {}) => {
    checkApplicantStatusAndNext(
      kycResult,
      (result, update) => {
        if (update) {
          dispatch({ type: KYC_APPLICANT_STATUS_UPDATE, result });
        }
        next();
      },
      (result, update, reason) => {
        if (update) {
          dispatch({ type: KYC_APPLICANT_STATUS_UPDATE, result });
        }
        let isSu = inSuList();
        if (canGoKyc(result)) {
          setResult({
            title: I18n.t('kyc_block_init_title'),
            message: I18n.t('kyc_block_init_desc'),
            type: TYPE_FAIL,
            failButtonText: I18n.t('kyc_block_go'),
            buttonClick: () => {
              setResult(null);
              KycHelper.getLanguageAndStartKyc(
                kycUserExist,
                setLoading,
                dispatch,
                setResult
              );
            },
            secondaryConfig: {
              color: theme.colors.primary,
              text: isSu ? I18n.t('skip') : I18n.t('kyc_block_later'),
              onClick: () => {
                setResult(null);
                if (isSu) {
                  next();
                }
              },
            },
          });
        } else {
          setResult({
            title: I18n.t('kyc_block_pending_title'),
            message: I18n.t('kyc_block_pending_desc'),
            type: TYPE_CONFIRM,
            successButtonText: I18n.t('kyc_block_pending_ok'),
            buttonClick: () => {
              setResult(null);
              KycHelper.getLanguageAndStartKyc(
                kycUserExist,
                setLoading,
                dispatch,
                setResult
              );
            },
            secondaryConfig: {
              color: theme.colors.primary,
              text: isSu ? I18n.t('skip') : I18n.t('kyc_block_pending_cancel'),
              onClick: () => {
                setResult(null);
                if (isSu) {
                  next();
                }
              },
            },
          });
        }
      },
      error => {
        dispatch({ type: KYC_APPLICANT_STATUS_ERROR, error });
        setResult({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t('check_failed'),
          buttonClick: () => {
            setResult(null);
          },
        });
      }
    );
  };
  return ready ? (
    <View style={Styles.container}>
      <Animated.View>
        <Headerbar
          transparent
          title={I18n.t('app_name')}
          actions={
            canAddAsset ? (
              <IconButton
                borderless
                color={theme.colors.primary}
                onPress={() => {
                  _checkApplicantDataAndNext(() => {
                    navigate('AddAsset');
                  });
                }}
                icon={({ size, color }) => (
                  <Image
                    source={require('../assets/image/ic_add_primary.png')}
                    style={{ width: 24, height: 24 }}
                  />
                )}
                accessibilityTraits="button"
                accessibilityComponentType="button"
                accessibilityRole="button"
              />
            ) : null
          }
        />
        {exchangeAmount !== NA && (
          <Text style={[Styles.topSecLabel, Theme.fonts.default.heavy]}>
            {I18n.t('total_assets')}
          </Text>
        )}
        {exchangeAmount !== NA && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingRight: 16,
            }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', width: width * 0.72 }}
              onPress={() => {
                setHide(!hide);
                // setHideZeroNft(!hide);
              }}>
              <CurrencyPriceTextLite
                symbol={false}
                textStyle={[
                  Styles.topTotalAsset,
                  Theme.fonts.default.heavyBold,
                ]}
                hide={hide}
                imgSrc={hide ? hideImg : unhideImg}
                imgStyle={{ height: 30, width: 30 }}
                exchangeAmount={exchangeAmount}
                exchangeCurrency={exchangeCurrency}
              />
            </TouchableOpacity>
            <Dropdown
              data={EXCHANGE_CURRENCIES}
              currentSelect={exchangeCurrency}
              clickItem={item => {
                dispatch({
                  type: EXCHANGE_CURRENCY_UPDATE,
                  exchangeCurrency: item,
                });
              }}
            />
          </View>
        )}
      </Animated.View>
      <ScrollableTabView
        renderTabBar={() => {
          return renderTabBar(theme, _scrollX);
        }}
        onScroll={x => _scrollX.setValue(x)}>
        <View style={{ paddingTop: 8 }} tabLabel={{ label: I18n.t('assets') }}>
          <WalletList
            wallets={wallets.filter(item => !item.isNft)}
            scrollEventThrottle={16}
            // wallets={wallets}
            hide={hide}
            latestKey={latestKey}
            onClickAction={item => {
              navigate('WalletDetail', { wallet: item });
            }}
            onRefresh={_refresh}
            refreshing={refreshing}
          />
        </View>
        <View
          tabLabel={{ label: I18n.t('asset_nft') }}
          style={{ paddingTop: 8, height: '100%' }}>
          {nftWallets.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                minHeight: 40,
                alignItems: 'center',
                marginBottom: 16,
              }}>
              <TouchableOpacity
                style={{
                  marginLeft: 0,
                  padding: 12,
                  paddingRight: 3,
                  paddingLeft: 18,
                }}
                onPress={() => {
                  setHideZeroNft(!hideZeroNft);
                }}>
                <Image
                  source={
                    hideZeroNft
                      ? require('../assets/image/ic_checkbox_check.png')
                      : require('../assets/image/ic_checkbox_uncheck_2.png')
                  }
                  resizeMode="stretch"
                  style={{
                    width: 24,
                    height: 24,
                  }}
                />
              </TouchableOpacity>
              <Text style={{ marginLeft: 2, fontSize: 12 }}>
                {hideZeroNft
                  ? I18n.t('show_all_collection')
                  : I18n.t('hide_zero_collection')}
              </Text>
            </View>
          )}
          <WalletNftList
            wallets={
              hideZeroNft
                ? nftWallets.filter(
                    item => item.tokens != null && item.tokens.length > 0
                  )
                : nftWallets
            }
            hide={hide}
            // latestKey={latestKey}
            onClickSectionAction={item => {
              navigate('WalletNftDetail', { wallet: item });
            }}
            onClickAction={(item, tokenId) => {
              _checkApplicantDataAndNext(() => {
                navigate('Withdraw', {
                  wallet: item,
                  onComplete: null,
                  tokenId: tokenId,
                });
              });
            }}
            onRefresh={_refreshCurrency}
            refreshing={refreshing}
            renderFooter={() => (
              <RoundButton2
                height={ROUND_BUTTON_LARGE_HEIGHT}
                style={[
                  {
                    backgroundColor: theme.colors.pickerBg,
                    marginLeft: 16,
                    marginTop: 20,
                    marginBottom: 36,
                    alignSelf: 'center',
                    justifyContent: 'center',
                  },
                ]}
                icon={({ size, color }) => (
                  <SvgXml
                    xml={ADD_SVG}
                    style={{
                      tintColor: theme.colors.white35,
                      width: 24,
                      height: 24,
                    }}
                  />
                )}
                labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
                color={theme.colors.pickerBg}
                onPress={() => {
                  _checkApplicantDataAndNext(() => {
                    navigate('AddContractCurrency', {});
                  });
                }}>
                {I18n.t('add_collectible')}
              </RoundButton2>
            )}
          />
        </View>
      </ScrollableTabView>
      {enableWalletconnect &&
        (hasV2Connection ||
          hasConnection ||
          hasApiHistory ||
          hasApiHistory ||
          hasApiHistory) && (
          <FAB
            // animated={true}
            style={[Styles.fab, { backgroundColor: '#FFF' }]}
            icon={({ size, color }) => (
              <SvgXml xml={getWalletConnectSvg2()} width={size} height={size} />
            )}
            onPress={() => {
              NavigationService.navigate('ConnectionList', {});
            }}
          />
        )}

      {loading && (
        <ActivityIndicator
          color={theme.colors.primary}
          size="large"
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: height / 2,
          }}
        />
      )}
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          message={result.message}
          errorMsg={result.error}
          type={result.type}
          onButtonClick={result.buttonClick}
          successButtonText={result.successButtonText}
          failButtonText={result.failButtonText}
          secondaryConfig={result.secondaryConfig}
        />
      )}
    </View>
  ) : (
    <View style={Styles.container}>
      <MyLoader style={{ opacity: 1 }} />
    </View>
  );
};
export default withTheme(AssetScreen);
