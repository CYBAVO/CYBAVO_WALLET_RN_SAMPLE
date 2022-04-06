import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { Container, Content, Icon, Button } from 'native-base';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {
  ActivityIndicator,
  IconButton,
  withTheme,
  Text,
} from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import CurrencyPickerLite from '../components/CurrencyPickerLite';
import ImagePicker from 'react-native-image-picker';
import Jimp from 'jimp';
import jsQR from 'jsqr';
import { Buffer } from 'buffer';
const { width, height } = Dimensions.get('window');
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
} from '../components/ResultModal';
import {
  checkStoragePermission,
  checkWalletConnectUri,
  effectiveBalance,
  getWalletKeyByWallet,
  toastError,
} from '../Helpers';
import { Wallets } from '@cybavo/react-native-wallet-service';
import { Coin, SCAN_ICON } from '../Constants';
import IconSvgXml from '../components/IconSvgXml';
import { newSession, DONT_SHOW_WC_DISCLAIMER } from '../store/actions';
import NavigationService from '../NavigationService';
import DisclaimerModal from '../components/DisclaimerModal';
import AsyncStorage from '@react-native-community/async-storage';
import AssetPicker from '../components/AssetPicker';
import AssetPickerLite from '../components/AssetPickerLite';

const ScanScreen: () => React$Node = ({ theme }) => {
  const qrScannerRef = useRef();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [address, setAddress] = useState(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [wcResult, setWcResult] = useState(null);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [dontShowWcDisclaimer, setDontShowWcDisclaimer] = useState(false);
  const { navigate, goBack } = useNavigation();
  const onResult = useNavigationParam('onResult');
  const isModal = useNavigationParam('modal');
  const scanHint = useNavigationParam('scanHint');
  const disableWalletConnect = useNavigationParam('disableWalletConnect');
  const balances = useSelector(state => state.balance.balances || {});

  const enableWalletconnect = useSelector(
    state => state.user.userState.enableWalletconnect
  );
  const dispatch = useDispatch();
  const [possibleCurrencies, setPossibleCurrencies] = useState([]);
  const [possibleWallets, setPossibleWallets] = useState([]);
  const _getCoinKey = item => `${item.currency}#`;
  const _getCurrencyKey = item => `${item.currency}#${item.tokenAddress}`;
  const ethWallet = useSelector(state => state.wallets.ethWallet);
  const currencies = useSelector(state => state.currency.currencies || []);
  const currencyMap = useSelector(state => {
    let map = {};
    if (state.currency.currencies) {
      for (let i = 0; i < state.currency.currencies.length; i++) {
        let key = _getCoinKey(state.currency.currencies[i]);
        map[key] = map[key] || [];
        map[key].push(state.currency.currencies[i]);
      }
    }
    return map;
  });
  const wallets = useSelector(state => state.wallets.wallets || []);
  useEffect(() => {
    if (dontShowWcDisclaimer) {
      return;
    }
    AsyncStorage.getItem(DONT_SHOW_WC_DISCLAIMER, (error, r) => {
      if (r == '1') {
        setDontShowWcDisclaimer(true);
      }
    });
  }, []);
  useEffect(() => {
    if (qrCode == null) {
      return;
    }
    if (disableWalletConnect == true || !enableWalletconnect) {
      _qrCodeAsAddress(qrCode);
      return;
    }
    let result = checkWalletConnectUri(qrCode);
    if (result.valid) {
      if (dontShowWcDisclaimer) {
        _qrCodeAsWalletConnect(result.uri, result.address, result.chainId);
        return;
      }
      setWcResult(result);
      setShowDisclaimerModal(true);
    } else {
      _qrCodeAsAddress(qrCode);
    }
  }, [qrCode]);

  const _qrCodeAsWalletConnect = (qrCode, address, chainId) => {
    goBack();
    NavigationService.navigate('Connecting', {});
    dispatch(newSession(qrCode, address, chainId, ethWallet));
  };
  const _qrCodeAsAddress = qrCode => {
    setAddress(qrCode);
    if (onResult) {
      onResult(qrCode);
      goBack();
    } else {
      Wallets.queryCoinType(qrCode)
        .then(result => {
          console.log('queryCoinType = ', result.coinItems.length);
          let currencies = [];
          let exist = new Set(); // api return dublicate item
          for (let i = 0; i < result.coinItems.length; i++) {
            if (Coin.EOS == result.coinItems[i].currency) {
              continue;
            }
            setAddress(result.coinItems[i].tokenAddress);
            let arr = currencyMap[_getCoinKey(result.coinItems[i])] || [];
            for (let j = 0; j < arr.length; j++) {
              let key = _getCurrencyKey(arr[j]);
              if (!exist.has(key)) {
                currencies.push(arr[j]);
                exist.add(key);
              }
            }
          }
          if (currencies.length == 1) {
            _onSelectCurrency(currencies[0]);
          } else if (currencies.length > 1) {
            setPossibleCurrencies(currencies);
            setShowCurrencyModal(true);
          } else {
            setResult({
              title: I18n.t('invalid_address'),
              error: I18n.t('invalid_address_desc'),
              message: I18n.t('scanned_content', { qrCode: qrCode }),
              type: TYPE_FAIL,
              buttonClick: _reactivateOrLeave,
            });
          }
        })
        .catch(error => {
          setAddress(qrCode);
          setPossibleCurrencies(currencies);
          setShowCurrencyModal(true);
          toastError(error);
        });
    }
  };
  const _onSelectWallet = item => {
    setAddress(item.address);
    goBack();
    navigate('Withdraw', {
      qrCode: item.address,
      wallet: item,
      onComplete: () => {},
    });
  };
  const _onSelectCurrency = item => {
    let ws = wallets.filter(
      w => w.currency === item.currency && w.tokenAddress === item.tokenAddress
    );
    if (ws.length == 1) {
      _onSelectWallet(ws[0]);
    } else if (ws.length == 0) {
      setResult({
        title: I18n.t('create_first_wallet', item),
        message: I18n.t('ask_create_wallet_desc', item),
        type: TYPE_CONFIRM,
        successButtonText: I18n.t('go_create'),
        currency: item,
        buttonClick: () => {
          goBack();
          navigate('AddAsset', { currency: item });
          setResult(null);
        },
        secondaryConfig: {
          color: theme.colors.primary,
          text: I18n.t('cancel'),
          onClick: () => {
            _reactivateOrLeave();
          },
        },
      });
    } else {
      setPossibleWallets(ws);
      setShowWalletModal(true);
    }
  };
  const _reactivateOrLeave = () => {
    setResult(null);
    if (qrScannerRef.current) {
      qrScannerRef.current.reactivate();
      setQrCode(null);
      setWcResult(null);
    } else {
      goBack();
    }
  };
  const _pickImage = async () => {
    if (!(await checkStoragePermission())) {
      return;
    }
    setLoading(true);
    ImagePicker.launchImageLibrary({}, async response => {
      console.log('Response = ', response);
      if (response.didCancel) {
        // cancelled
      } else if (response.error) {
        // error
        setResult({
          title: I18n.t('pick_image_failed'),
          error: response.error,
          type: TYPE_FAIL,
          buttonClick: _reactivateOrLeave,
        });
      } else {
        try {
          const image = await Jimp.read(Buffer.from(response.data, 'base64'));
          if (image) {
            const code = jsQR(
              image.bitmap.data,
              image.bitmap.width,
              image.bitmap.height
            );
            if (code) {
              setQrCode(code.data);
            } else {
              setResult({
                title: I18n.t('pick_image_failed'),
                error: I18n.t('invalid_qr_code_desc'),
                type: TYPE_FAIL,
                buttonClick: _reactivateOrLeave,
              });
            }
          } else {
            setResult({
              title: I18n.t('pick_image_failed'),
              error: I18n.t('read_image_failed_desc'),
              type: TYPE_FAIL,
              buttonClick: _reactivateOrLeave,
            });
          }
        } catch (err) {
          console.warn('decode image QR code failed', err);
          setResult({
            title: I18n.t('decode_qr_image_failed'),
            error: err.message,
            type: TYPE_FAIL,
            buttonClick: _reactivateOrLeave,
          });
        }
      }
      setLoading(false);
    });
  };
  const _getBalanceText = item => {
    let key = getWalletKeyByWallet(item);
    let b = effectiveBalance(balances[key], '');
    return b;
  };
  const _renderViewFinder = () => {
    return (
      <View style={styles.viewFinder}>
        <View style={styles.mask} />
        <View style={styles.markerContainer}>
          <View style={styles.mask} />
          <View
            style={[styles.marker, { borderColor: theme.colors.placeholder }]}
          />
          <View style={styles.mask} />
        </View>
        <View style={[styles.mask, { alignItems: 'center' }]}>
          <Text
            style={{
              color: theme.colors.placeholder,
              marginTop: 8,
              marginHorizontal: 16,
              fontSize: 12,
            }}>
            {scanHint
              ? scanHint
              : enableWalletconnect
              ? I18n.t('scan_hint')
              : I18n.t('scan_hint_address_only')}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#0a133a' }}>
      <Headerbar
        // transparent
        backIcon={
          isModal
            ? require('../assets/image/ic_cancel.png')
            : require('../assets/image/ic_back.png')
        }
        title={I18n.t('scan')}
        onBack={() => goBack()}
        actions={
          <IconButton
            borderless
            color={'rgba(255, 255, 255, 0.56)'}
            onPress={_pickImage}
            icon={({ size, color }) => (
              <Image
                source={require('../assets/image/ic_photos.png')}
                style={{ width: 24, height: 24 }}
              />
            )}
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
          />
        }
      />
      <View style={styles.contentContainer}>
        <QRCodeScanner
          ref={qrScannerRef}
          showMarker={false}
          checkAndroid6Permissions
          cameraProps={{
            style: styles.camera,
          }}
          onRead={e => {
            if (loading) {
              return;
            }
            setQrCode(e.data);
          }}
        />
        {_renderViewFinder()}
      </View>
      {showDisclaimerModal && (
        <DisclaimerModal
          onCancel={() => {
            _reactivateOrLeave();
            setShowDisclaimerModal(false);
          }}
          onConfirm={dontShow => {
            if (dontShow) {
              AsyncStorage.setItem(DONT_SHOW_WC_DISCLAIMER, '1')
                .then(() => {
                  console.debug('set SHOWED_WC_DISCLAIMER');
                })
                .catch(error => {
                  console.debug('set SHOWED_WC_DISCLAIMER err:' + error);
                });
            }
            setShowDisclaimerModal(false);
            if (wcResult != null) {
              setTimeout(() => {
                _qrCodeAsWalletConnect(
                  wcResult.uri,
                  wcResult.address,
                  wcResult.chainId
                );
              }, 100);
            }
          }}
        />
      )}
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          message={result.message}
          messageStyle={{ width: '90%' }}
          errorMsg={result.error}
          successButtonText={result.successButtonText}
          type={result.type} // only !success & confirm here
          secondaryConfig={result.secondaryConfig}
          onButtonClick={result.buttonClick}
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
      {showCurrencyModal && (
        <CurrencyPickerLite
          rawData={possibleCurrencies}
          onCancel={() => {
            if (qrScannerRef.current) {
              setQrCode(null);
              qrScannerRef.current.reactivate();
            }
            setShowCurrencyModal(false);
          }}
          clickItem={item => {
            setShowCurrencyModal(false);
            setTimeout(() => {
              // ios need wait after perivous modal close
              _onSelectCurrency(item);
            }, 100);
          }}
        />
      )}
      {showWalletModal && (
        <AssetPickerLite
          rawData={possibleWallets}
          onCancel={() => {
            if (qrScannerRef.current) {
              setQrCode(null);
              qrScannerRef.current.reactivate();
            }
            setShowWalletModal(false);
          }}
          clickItem={item => {
            setShowWalletModal(false);
            setTimeout(() => {
              // ios need wait after perivous modal close
              _onSelectWallet(item);
            }, 100);
          }}
          getBalanceText={_getBalanceText}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  viewFinder: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  markerContainer: {
    flexDirection: 'row',
  },
  marker: {
    width: 240,
    height: 240,
    borderWidth: 2,
  },
});
export default withTheme(ScanScreen);
