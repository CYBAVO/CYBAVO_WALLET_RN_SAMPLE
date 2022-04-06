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
import {AUTH_UPDATE_DEV, AUTH_UPDATE_GLOBAL_MODAL, initAuth, setSkipNews} from '../store/actions';
import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');
import { Text } from 'react-native-paper';
import { withTheme } from 'react-native-paper';
import Styles from '../styles/Styles';
import VersionNumber from 'react-native-version-number';
import * as DeviceInfo from 'react-native-device-info';
import { WalletSdk } from '@cybavo/react-native-wallet-service';
import { endpoint, apiCode, uniqueIds } from '../BuildConfig';
import { checkCameraPermission, getLoginBgSvg } from '../Helpers';
import NavigationService from '../NavigationService';
import { useClipboard } from '@react-native-community/hooks';
import { SvgXml } from 'react-native-svg';

const InitializeScreen: () => React$Node = ({ theme }) => {
  const iconInitMarginTop = height * 0.35;
  const dispatch = useDispatch();
  const [_, setClipboard] = useClipboard();
  const apnsSandbox = false;
  const [animOpacity] = useState(new Animated.Value(0));
  const _initWalletSdk = config => {
    WalletSdk.init({
      endpoint: endpoint[config],
      apiCode: apiCode[config][Platform.OS],
      apnsSandbox: apnsSandbox,
    });

    dispatch({ type: AUTH_UPDATE_DEV, config: config });
    dispatch(initAuth());
  };
  const _afterAnimate = inList => {
    if (inList) {
      Alert.alert(
        'Connect to',
        'Connect to test net?\n(QR: endpoint#CBO#apiCode)',
        [
          {
            text: 'Main net',
            onPress: () => _initWalletSdk('main'),
          },
          {
            text: 'Test net',
            onPress: () => _initWalletSdk('test'),
          },
          {
            text: 'Scan QR code',
            onPress: async () => {
              if (await checkCameraPermission()) {
                NavigationService.navigate('ScanOut', {
                  modal: true,
                  onResult: qrcode => {
                    let arr = qrcode.split('#CBO#');
                    if (arr.length != 2) {
                      _afterAnimate(true);
                      return;
                    }
                    WalletSdk.init({
                      endpoint: arr[0],
                      apiCode: arr[1],
                      apnsSandbox: apnsSandbox,
                    });

                    dispatch({ type: AUTH_UPDATE_DEV, config: 'test' });
                    dispatch(initAuth());
                  },
                });
              }
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      _initWalletSdk('main');
    }
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
