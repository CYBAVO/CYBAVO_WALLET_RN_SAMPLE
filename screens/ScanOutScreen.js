import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { Container, Content, Icon, Button } from 'native-base';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import QRCodeScanner from 'react-native-qrcode-scanner';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import jsQR from 'jsqr';
const PNG = require('pngjs/browser').PNG;
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
import { launchImageLibrary } from 'react-native-image-picker';
import Jimp from 'jimp';
const { width, height } = Dimensions.get('window');
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
} from '../components/ResultModal';
import {
  checkStoragePermission,
  checkWalletConnectUri,
  effectiveBalance,
  getWalletKeyByWallet, pickImage,
  toastError,
} from '../Helpers';
import { Wallets } from '@cybavo/react-native-wallet-service';
import { Coin, SCAN_ICON } from '../Constants';
import IconSvgXml from '../components/IconSvgXml';
import {
  newSession,
  DONT_SHOW_WC_DISCLAIMER,
  checkApplicantStatusAndNext,
  KYC_APPLICANT_STATUS_UPDATE,
  inSuList,
  canGoKyc,
  KYC_APPLICANT_STATUS_ERROR,
} from '../store/actions';
import NavigationService from '../NavigationService';
import DisclaimerModal from '../components/DisclaimerModal';
import AsyncStorage from '@react-native-community/async-storage';
import AssetPicker from '../components/AssetPicker';
import AssetPickerLite from '../components/AssetPickerLite';

const ScanOutScreen: () => React$Node = ({ theme }) => {
  const qrScannerRef = useRef();
  const [result, setResult] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [address, setAddress] = useState(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [wcResult, setWcResult] = useState(null);

  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(false);
  const onResult = useNavigationParam('onResult');
  const isModal = useNavigationParam('modal');
  const scanHint = useNavigationParam('scanHint');

  useEffect(() => {
    if (qrCode == null) {
      return;
    }
    if (onResult) {
      onResult(qrCode);
    }
  }, [qrCode]);

  const _reactivateOrLeave = () => {
    setResult(null);
    if (qrScannerRef.current) {
      qrScannerRef.current.reactivate();
      setQrCode(null);
      setWcResult(null);
    } else {
      NavigationService.navigate('Init', {});
    }
  };
  const _pickImage = async () => {
    await pickImage(setLoading, setResult, _reactivateOrLeave, setQrCode);
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
            {I18n.t('scan_hint_address_only')}
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
        onBack={() => NavigationService.navigate('Init', {})}
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
export default withTheme(ScanOutScreen);
