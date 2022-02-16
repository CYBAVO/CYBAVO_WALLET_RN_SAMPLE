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
  approveSession,
  killAllSession,
  rejectSession,
} from '../store/actions';
import { Dimensions } from 'react-native';
import { DotIndicator } from 'react-native-indicators';
import { HEADER_BAR_PADDING, ROUND_BUTTON_HEIGHT } from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { useDimensions, useLayout } from '@react-native-community/hooks';
const { height } = Dimensions.get('window');
const DOT_SIZE = 6;
const CIRCEL_SIZE = 32;

const ConnectingScreen: () => React$Node = ({ theme, visible = true }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const peerId = useNavigationParam('peerId');
  const peerName = useNavigationParam('peerName');
  const { onLayout, ...layout } = useLayout();
  const payload = useNavigationParam('payload');
  const address = useNavigationParam('address');
  const chainId = useNavigationParam('chainId');
  const returnAddress = useNavigationParam('returnAddress');
  const returnChainId = useNavigationParam('returnChainId');
  const _rejectSession = async () => {
    dispatch(rejectSession(peerId));
    goBack();
  };
  const _approveSession = async () => {
    let addr = returnAddress || address;
    let cId = returnChainId || chainId;
    const response = { accounts: [addr], chainId };
    goBack();
    await dispatch(approveSession(peerId, peerName, response));
  };
  const _getSessionRequestView = () => {
    const { peerMeta, chainId } = payload.params[0];
    const newSession =
      payload.method === 'wc_sessionRequest' ||
      payload.method === 'session_request';
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
            paddingTop: 48,
            paddingHorizontal: 24,
            paddingBottom: 32,
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
              height: height * 0.5,
            }}>
            <Text
              style={[styles.request_message, Theme.fonts.default.heavyBold]}>
              {I18n.t('session_request_message', peerMeta)}
            </Text>
            <Image
              source={{ uri: peerMeta.icons[0] }}
              style={{ width: 60, height: 60 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: Theme.colors.resultTitle,
                textAlign: 'center',
                marginVertical: 16,
              }}>
              {peerMeta.url}
            </Text>
            <View style={styles.barBlock}>
              <View style={styles.dot} />
              <Text style={styles.permission_message}>
                {I18n.t('allow_wallet_address')}
              </Text>
            </View>
            <View style={styles.barBlock}>
              <View style={styles.dot} />
              <Text style={styles.permission_message}>
                {I18n.t('allow_signature_request')}
              </Text>
            </View>
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
                  : { color: theme.colors.primary, fontSize: 14 }
              }>
              {I18n.t('reject')}
            </Text>
          </TouchableOpacity>
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={styles.button}
            labelStyle={[
              { color: theme.colors.text, fontSize: 14, width: '100%' },
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
            marginTop: 100,
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
            paddingBottom: 32,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
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
              {I18n.t('walletconnecting_message')}
            </Text>
          </View>
          <IconButton
            borderless
            style={{ marginRight: 8 }}
            color={'rgba(255, 255, 255, 0.56)'}
            onPress={() => {
              goBack();
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
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            marginTop: layout.height / 4,
          }}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../assets/image/ic_walletconnect.png')}
              style={{ width: 32, height: 32 }}
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
        <Text
          style={[
            Theme.fonts.default.regular,
            {
              color: theme.colors.battleshipGrey,
              marginTop: 24,
              fontSize: 16,
              textAlign: 'center',
              alignSelf: 'center',
            },
          ]}>
          {I18n.t('walletconnecting_message')}
        </Text>
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
        {peerId == null ? _getConnectingView() : _getSessionRequestView()}
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
    fontSize: 16,
    marginBottom: 16,
    color: Theme.colors.resultContent,
    textAlign: 'center',
  },
  permission_message: {
    fontSize: 16,
    color: Theme.colors.pinDisplayInactivate,
    width: '90%',
  },
  barBlock: {
    backgroundColor: Theme.colors.pickerBgTransparent,
    marginTop: 10,
    paddingVertical: HEADER_BAR_PADDING,
    paddingRight: 6,
    width: '100%',
    paddingLeft: 2,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 6,
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
export default withTheme(ConnectingScreen);
