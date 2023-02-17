import React, { useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import I18n from '../i18n/i18n';
import { useSelector, useDispatch } from 'react-redux';
import {
  AUTH_UPDATE_DEV,
  AUTH_UPDATE_GLOBAL_MODAL,
  DONT_SHOW_WC_DISCLAIMER,
  CONFIG_QR_CODE,
  initAuth,
  setSkipNews,
} from '../store/actions';
import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');
import { Text } from 'react-native-paper';
import { withTheme } from 'react-native-paper';
import Styles from '../styles/Styles';
import VersionNumber from 'react-native-version-number';
import * as DeviceInfo from 'react-native-device-info';
import { WalletSdk } from '@cybavo/react-native-wallet-service';
import { endpoint, apiCode, uniqueIds, devDialogOption } from '../BuildConfig';
import { checkCameraPermission, getLoginBgSvg, toast } from '../Helpers';
import NavigationService from '../NavigationService';
import { useClipboard } from '@react-native-community/hooks';
import { SvgXml } from 'react-native-svg';
import AsyncStorage from '@react-native-community/async-storage';
import ResultModal, { TYPE_FAIL } from '../components/ResultModal';

const InitializeScreen: () => React$Node = ({ theme }) => {
  const iconInitMarginTop = height * 0.35;
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();
  const [_, setClipboard] = useClipboard();
  const apnsSandbox = false;
  const [animOpacity] = useState(new Animated.Value(0));
  const _initWalletSdk = (option, network) => {
    WalletSdk.init({
      endpoint: endpoint[option],
      apiCode: apiCode[option][Platform.OS],
      apnsSandbox: apnsSandbox,
    });

    dispatch({
      type: AUTH_UPDATE_DEV,
      option: option,
      config: network,
      endpoint: endpoint[option],
    });
    dispatch(initAuth());
  };
  const _inDevListAlert = op3 => {
    Alert.alert(
      'Connect to',
      'Select endpoint\n(QR: endpoint#CBO#apiCode#CBO#network)',
      [
        {
          text: devDialogOption[0].name,
          onPress: () =>
            _initWalletSdk(devDialogOption[0].key, devDialogOption[0].network),
        },
        {
          text: devDialogOption[1].name,
          onPress: () =>
            _initWalletSdk(devDialogOption[1].key, devDialogOption[1].network),
        },
        op3,
      ],
      { cancelable: false }
    );
  };
  const _afterAnimate = inList => {
    if (inList) {
      AsyncStorage.getItem(CONFIG_QR_CODE, async (error, r) => {
        if (r) {
          _inDevListAlert({
            text: 'Last time saved QR code',
            onPress: () => {
              initByQrCode(r, false);
            },
          });
          return;
        }
        _inDevListAlert({
          text: 'Scan QR code',
          onPress: async () => {
            if (await checkCameraPermission()) {
              NavigationService.navigate('ScanOut', {
                modal: true,
                onResult: qrcode => {
                  initByQrCode(qrcode, true);
                },
              });
            }
          },
        });
      });
    } else {
      AsyncStorage.getItem(CONFIG_QR_CODE, async (error, r) => {
        if (r) {
          initByQrCode(r, false);
          return;
        }

        Alert.alert(
          I18n.t('scan_config_qr_title'),
          I18n.t('scan_config_qr_desc'),
          [
            {
              text: I18n.t('scan_config_qr_bt'),
              onPress: async () => {
                if (!(await checkCameraPermission())) {
                  return;
                }
                NavigationService.navigate('ScanOut', {
                  modal: true,
                  onResult: qrcode => {
                    initByQrCode(qrcode, true);
                  },
                });
              },
            },
          ],
          { cancelable: false }
        );
      });
    }
  };
  const initByQrCode = (qrcode, save) => {
    let arr = qrcode.split('#CBO#');
    if (arr.length < 2) {
      toast(I18n.t('wrong_config_qr_try_again'));
      NavigationService.navigate('Init', {});
      return;
    }
    let network = arr.length >= 3 && arr[2] === 'main' ? 'main' : 'test';
    WalletSdk.init({
      endpoint: arr[0],
      apiCode: arr[1],
      apnsSandbox: apnsSandbox,
    });
    if (save) {
      AsyncStorage.setItem(CONFIG_QR_CODE, qrcode)
        .then(() => {})
        .catch(error => {
          console.debug('set initQr err:' + error);
        });
    }
    dispatch({
      type: AUTH_UPDATE_DEV,
      option: devDialogOption[0].key,
      config: network,
      endpoint: arr[0],
    });
    dispatch(initAuth());
  };
  const _inDevList = () => {
    let uniqueId = DeviceInfo.getUniqueId();
    setClipboard(uniqueId);
    let inList = uniqueIds.includes(uniqueId) || uniqueIds.includes('all');
    console.debug('uniqueId:' + uniqueId);
    return inList;
  };
  useEffect(() => {
    // setSkipNews('');
    let inDevList = _inDevList();
    Animated.timing(animOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        _afterAnimate(inDevList);
      }, 200);
    });
  }, [dispatch]);
  return (
    <View style={[Styles.bottomContainer, { alignItems: 'center' }]}>
      <SvgXml xml={getLoginBgSvg(width, height)} style={styles.fullBg} />
      <Animated.Image
        resizeMode="contain"
        source={require('../assets/image/splash.png')}
        style={{ marginTop: iconInitMarginTop, opacity: animOpacity }}
      />
      <Text
        color={theme.colors.primary}
        style={[
          {
            position: 'absolute',
            alignSelf: 'center',
            textAlign: 'center',
            bottom: 20,
            fontSize: 14,
            color: theme.colors.placeholder,
            opacity: 0.8,
          },
        ]}>
        {`${I18n.t('version')} ${VersionNumber.appVersion}`}
      </Text>
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          failButtonText={result.failButtonText}
          type={result.type}
          message={result.message}
          errorMsg={result.error}
          onButtonClick={result.buttonClick}
          secondaryConfig={result.secondaryConfig}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullBg: {
    flex: 1,
    position: 'absolute',
    zIndex: 0,
    top: -1,
    left: 0,
    width: '100%',
  },
  upper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  state: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  button: {
    marginHorizontal: 16,
  },
});
export default withTheme(InitializeScreen);
