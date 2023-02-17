import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { Theme } from '../styles/MainTheme';
import { withTheme, Text, IconButton } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {
  approveSessionProposal,
  rejectSessionProposal,
} from '../store/actions';
import { Dimensions } from 'react-native';
import { DotIndicator } from 'react-native-indicators';
import { HEADER_BAR_PADDING, ROUND_BUTTON_HEIGHT } from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { useDimensions, useLayout } from '@react-native-community/hooks';
import AssetPicker from '../components/AssetPicker';
import {
  getFilledArrayCount,
  isWcAccountInvalid,
  isWcAccountValid,
} from '../Helpers';
import V2WalletConnectAssetPicker from '../components/V2WalletConnectAssetPicker';
import NavigationService from '../NavigationService';
import { TYPE_FAIL } from '../components/ResultModal';
const { width, height } = Dimensions.get('window');
const DOT_SIZE = 6;
const CIRCEL_SIZE = 32;

const V2ConnectingScreen: () => React$Node = ({ theme, visible = true }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const proposal = useNavigationParam('proposal');
  const namespace = useNavigationParam('namespace');
  const allWallets = useNavigationParam('allWallets');
  const hasWallet = useNavigationParam('hasWallet');
  const { onLayout, ...layout } = useLayout();
  const [walletIdMap, setWalletIdMap] = useState({});

  const dismissUi = useSelector(state => state.walletconnect.dismissUi);
  useEffect(() => {
    if (dismissUi) {
      if (proposal) {
        dispatch(rejectSessionProposal(proposal));
      }
      goBack();
    }
  }, [dismissUi]);

  const _rejectSession = async () => {
    dispatch(rejectSessionProposal(proposal));
    goBack();
  };
  const _approveSession = async () => {
    let chainWalletMap = {};
    Object.keys(namespace).forEach(key => {
      Object.keys(namespace[key].chainWalletsMap).forEach(chain => {
        chainWalletMap[chain] = [];
        namespace[key].chainWalletsMap[chain].forEach(w => {
          if (walletIdMap[chain] && walletIdMap[chain][w.walletId]) {
            chainWalletMap[chain].push(w);
          }
        });
      });
    });
    goBack();
    dispatch(approveSessionProposal(proposal, chainWalletMap));
  };

  const _getSessionProposalView = () => {
    const { id, params } = proposal;
    const { proposer, requiredNamespaces, relays } = params;
    const peerMeta = proposer.metadata;
    let maxWidth = width * 0.83 - 68;
    return (
      <View
        style={[
          {
            marginTop: 56,
            alignItems: 'center',
          },
        ]}>
        <View
          style={{
            alignSelf: 'center',
            alignItems: 'center',
            width: '83%',
            paddingTop: 40,
            paddingHorizontal: 34,
            paddingBottom: 40,
            borderRadius: 12,
            justifyContent: 'flex-start',
            backgroundColor: theme.colors.surface,
          }}>
          <ScrollView
            contentContainerStyle={{
              alignSelf: 'center',
              alignItems: 'center',
            }}
            style={{
              height: height * 0.6,
            }}>
            <Image
              source={{ uri: peerMeta.icons[0] }}
              style={{ width: 60, height: 60 }}
            />
            <Text
              style={[styles.request_message, Theme.fonts.default.heavyBold]}>
              {I18n.t('session_request_message', peerMeta)}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: Theme.colors.gray600,
                textAlign: 'center',
                marginTop: 0,
                marginBottom: 0,
              }}>
              {peerMeta.url}
            </Text>
            <View
              style={{
                width: maxWidth,
                height: 1,
                marginTop: 24,
                backgroundColor: Theme.colors.line,
              }}
            />
            <View style={[styles.barBlock, { marginTop: 24 }]}>
              <Image
                source={require('../assets/image/ic_check2.png')}
                resizeMode="stretch"
                style={{
                  width: 20,
                  height: 20,
                }}
              />
              <Text
                style={[styles.permission_message, Theme.fonts.default.heavy]}>
                {I18n.t('allow_wallet_address')}
              </Text>
            </View>
            <View style={[styles.barBlock, { marginTop: 18 }]}>
              <Image
                source={require('../assets/image/ic_check2.png')}
                resizeMode="stretch"
                style={{
                  width: 20,
                  height: 20,
                }}
              />
              <Text
                style={[styles.permission_message, Theme.fonts.default.heavy]}>
                {I18n.t('allow_signature_request')}
              </Text>
            </View>
            <V2WalletConnectAssetPicker
              itemStyle={{ marginTop: 16, width: maxWidth }}
              rawData={allWallets}
              initSelected={walletIdMap}
              hasWallet={hasWallet}
              getConfirmSelect={() => walletIdMap}
              onConfirm={map => {
                setWalletIdMap(map);
              }}
            />
          </ScrollView>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
              height: ROUND_BUTTON_HEIGHT,
              marginTop: 10,
              alignSelf: 'stretch',
            }}
            onPress={_rejectSession}>
            <Text
              style={
                Platform.OS === 'ios'
                  ? [
                      //this style looks wired on Android
                      Theme.fonts.default.medium,
                      {
                        color: theme.colors.primary,
                        fontSize: 16,
                        fontWeight: '700',
                      },
                    ]
                  : { color: theme.colors.primary, fontSize: 16 }
              }>
              {I18n.t('reject')}
            </Text>
          </TouchableOpacity>
          <RoundButton2
            outlined
            height={ROUND_BUTTON_HEIGHT}
            style={{
              borderWidth: 0,
              backgroundColor: isWcAccountInvalid(walletIdMap, allWallets)
                ? Theme.colors.primaryDisabled
                : Theme.colors.primary,
              opacity: 1,
            }}
            disabled={isWcAccountInvalid(walletIdMap, allWallets)}
            labelStyle={[
              { color: theme.colors.text, fontSize: 16, width: '100%' },
            ]}
            onPress={_approveSession}>
            {I18n.t('approve')}
          </RoundButton2>
        </View>
      </View>
    );
  };
  const _getConnectingView = () => {
    return (
      <View
        onLayout={onLayout}
        style={[
          {
            marginTop: (height - layout.height) / 2,
            alignItems: 'center',
            alignSelf: 'center',
            paddingBottom: 40,
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            minHeight: 205,
          },
        ]}>
        <View
          style={{
            height: 56,
            borderBottomWidth: 0,
            borderColor: 'rgba(9,16,42,0.1)',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexDirection: 'row',
            width: width - 64,
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
              top: 22,
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
              {I18n.t('walletconnecting_message')}
            </Text>
          </View>
          <IconButton
            borderless
            style={{ marginRight: 8 }}
            color={'rgba(255, 255, 255, 0.56)'}
            onPress={() => {
              if (proposal) {
                dispatch(rejectSessionProposal(proposal));
              }
              goBack();
            }}
            icon={({ size, color }) => (
              <Image
                source={require('../assets/image/ic_cancel_gray2.png')}
                style={{ width: 16, height: 16 }}
              />
            )}
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            marginTop: layout.height / 4,
          }}>
          <View style={[styles.logoFrame, { backgroundColor: 'transparent' }]}>
            <Image
              source={require('../assets/image/ic_walletconnectv2.png')}
              style={{
                width: 60,
                height: 60,
              }}
            />
          </View>
          <DotIndicator
            color={theme.colors.primary}
            size={4}
            count={3}
            style={{ flex: null, marginHorizontal: 16 }}
          />

          <View style={styles.logoFrame}>
            <Image
              source={require('../assets/image/ic_logo.png')}
              style={{ width: 32, height: 32 }}
            />
          </View>
        </View>
      </View>
    );
  };
  return (
    <Modal
      animated
      visible={true}
      transparent={true}
      contentContainerStyle={{
        flex: 1,
        shadowOpacity: 1,
      }}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        {proposal == null ? _getConnectingView() : _getSessionProposalView()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  request_message: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 16,
    color: Theme.colors.resultContent,
    textAlign: 'center',
  },
  permission_message: {
    fontSize: 12,
    color: Theme.colors.resultContent,
    width: '90%',
    marginLeft: 6,
  },
  barBlock: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Theme.colors.pinDisplayInactivate,
    marginHorizontal: 12,
    alignSelf: 'center',
    marginRight: 16,
  },
  logoFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 42,
    backgroundColor: '#fff',
    paddingHorizontal: 11,
    //shadow
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16.0,
  },
});
export default withTheme(V2ConnectingScreen);
