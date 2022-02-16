import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StyleSheet, View, Dimensions, Image, ScrollView } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import { Container } from 'native-base';
import { Text, withTheme } from 'react-native-paper';
const { width, height } = Dimensions.get('window');
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { useClipboard } from '@react-native-community/hooks';
import {
  startColors,
  endColors,
  Theme,
  nftStartColors,
  nftEndColors,
} from '../styles/MainTheme';
import { ROUND_BUTTON_HEIGHT } from '../Constants';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import BackgroundImage from '../components/BackgroundImage';
import { CardPatternImg } from '../components/CurrencyIcon';
import {
  checkStoragePermission,
  effectiveBalance,
  getWalletKeyByWallet,
  toastError,
} from '../Helpers';
import Headerbar from '../components/Headerbar';

import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import AssetPicker from '../components/AssetPicker';
import RoundButton2 from '../components/RoundButton2';
import TopDownHint from '../components/TopDownHint';

const DepositScreen: () => React$Node = ({ theme }) => {
  const { goBack } = useNavigation();
  const [_, setClipboard] = useClipboard();
  const qrRef = useRef(null);
  const balances = useSelector(state => state.balance.balances || {});
  const wallets = useSelector(state => state.wallets.wallets);
  const recentSet = useSelector(state => {
    if (state.transactions.transactions == null) {
      return new Set();
    }
    let data = [];
    let byWalletTxs = Object.values(state.transactions.transactions);
    for (let i = 0; i < byWalletTxs.length; i++) {
      if (byWalletTxs[i].latestTx == null) {
        continue;
      }
      data = data.concat(byWalletTxs[i].latestTx);
    }
    data.sort((a, b) => b.timestamp - a.timestamp);
    return data.length > 5
      ? new Set(data.slice(0, 5).map(item => item.address))
      : new Set(data.map(item => item.address));
  });
  const qrSize = width * 0.56;
  const w = useNavigationParam('wallet');
  const [wallet, setWallet] = useState(w);
  const [hint, setHint] = useState(null);
  if (!wallet) {
    console.warn('No wallet/transaction specified');
    goBack();
  }
  const _copyAddress = async () => {
    setClipboard(wallet.address);
    setHint(I18n.t('copied'));
    // Toast.show({ text: I18n.t('address_copied'), type: 'success' });
  };
  const _saveQrCode = async () => {
    const hasPermission = await checkStoragePermission();
    if (!hasPermission) {
      toastError({ message: I18n.t('permission_denied') });
      return;
    }
    if (qrRef.current) {
      qrRef.current.toDataURL(async data => {
        const path = `${RNFS.DocumentDirectoryPath}/${wallet.name}-${wallet.address}.png`;
        try {
          await RNFS.writeFile(path, data, 'base64');
          await CameraRoll.save(path, 'photo');
          setHint(I18n.t('saved'));
        } catch (error) {
          console.log('_saveQrCode failed', error);
          toastError(error);
        }
        // this.setState({ loading: false });
      });
    }
  };
  return (
    <ScrollView style={Styles.bottomContainer}>
      <BackgroundImage
        containerStyle={Styles.detailBackgroundImage}
        imageStyle={Styles.detailCardPattern}
        imageSource={wallet.isNft ? null : CardPatternImg}
        startColor={
          (wallet.isNft
            ? nftStartColors[wallet.colorIndex]
            : startColors[wallet.currencySymbol]) || startColors.UNKNOWN
        }
        endColor={
          (wallet.isNft
            ? nftEndColors[wallet.colorIndex]
            : endColors[wallet.currencySymbol]) || endColors.UNKNOWN
        }
        start={{ x: 0, y: 0 }}
        end={wallet.isNft ? { x: 0, y: 1 } : { x: 1, y: 0 }}>
        <View>
          <Headerbar
            transparent
            title={I18n.t('receive')}
            onBack={() => goBack()}
          />
          <View style={[Styles.numContainer]}>
            <AssetPicker
              rawData={wallets}
              isNftTop={wallet.isNft}
              recentSet={recentSet}
              initSelected={wallet}
              clickItem={item => {
                setWallet(item);
              }}
              getBalanceText={item => {
                let key = getWalletKeyByWallet(item);
                let balance = effectiveBalance(balances[key], '');
                return balance;
              }}
            />
          </View>
        </View>
      </BackgroundImage>
      <View
        style={[
          {
            flex: 1,
            alignItems: 'center',
            // marginTop: 32,
            backgroundColor: theme.colors.background,
          },
        ]}>
        <View
          style={{
            padding: 8,
            backgroundColor: 'white',
            marginTop: 32,
          }}>
          <QRCode
            backgroundColor="white"
            size={qrSize}
            value={wallet.address}
            getRef={ref => {
              qrRef.current = ref;
            }}
          />
        </View>
        <Text
          style={[
            styles.text,
            Theme.fonts.default.regular,
            {
              marginTop: 16,
              marginHorizontal: 16,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="middle">
          {wallet.address}
        </Text>
        <View style={styles.roundButtonContainer}>
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={styles.button}
            labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
            onPress={_copyAddress}>
            {I18n.t('copy_address')}
          </RoundButton2>
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={[
              styles.button,
              {
                marginLeft: 20,
              },
            ]}
            labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
            onPress={_saveQrCode}>
            {I18n.t('save_qr_code')}
          </RoundButton2>
        </View>

        <View style={Styles.infoBackground}>
          <Image
            style={{ marginTop: 3 }}
            source={require('../assets/image/ic_Info.png')}
          />
          <Text
            note
            style={[
              styles.text,
              Theme.fonts.default.regular,
              {
                textAlign: 'left',
                marginLeft: 5,
              },
            ]}>
            {I18n.t('deposit_desc', wallet)}
          </Text>
        </View>
      </View>
      <TopDownHint
        title={hint}
        onDismiss={() => {
          setHint(null);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: Theme.colors.text,
    marginRight: 10,
  },
  roundButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 25,
  },
  button: {
    height: ROUND_BUTTON_HEIGHT,
    minWidth: '40%',
  },
  bottomBoarderContainer: {
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 8,
    width: '100%',
  },
});
export default withTheme(DepositScreen);
