import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { withTheme, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {
  approveSession,
  rejectSession,
} from '../store/actions';
import { Container } from 'native-base';
import Styles from '../styles/Styles';
import Headerbar from '../components/Headerbar';
import { SvgXml } from 'react-native-svg';
import { getChainData, getWalletConnectSvg } from '../Helpers';
import { Dimensions } from 'react-native';
import { Theme } from '../styles/MainTheme';
import { DotIndicator } from 'react-native-indicators';
import {
  HEADER_BAR_PADDING,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
const { height } = Dimensions.get('window');
const DOT_SIZE = 6;

const ConnectingScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const peerId = useNavigationParam('peerId');
  const payload = useNavigationParam('payload');
  const address = useNavigationParam('address');
  const chainId = useNavigationParam('chainId');
  const _onBack = () => {
    if (peerId != null) {
      _rejectSession();
    }
    goBack();
  };
  const _rejectSession = async () => {
    dispatch(rejectSession(peerId));
    goBack();
  };
  const _approveSession = async () => {
    const response = { accounts: [address], chainId };
    goBack();
    await dispatch(approveSession(peerId, response));
  };
  const _getSessionRequestView = () => {
    const { peerMeta, chainId } = payload.params[0];
    const newSession =
      payload.method === 'wc_sessionRequest' ||
      payload.method === 'session_request';
    // const activeChain = getChainData(chainId);

    return (
      <View
        style={[
          {
            // marginTop: height * 0.3,
            alignItems: 'center',
            backgroundColor: theme.colors.background,
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
            <Image
              source={{ uri: peerMeta.icons[0] }}
              style={{ width: 60, height: 60 }}
            />
            <Text style={styles.request_message}>
              {I18n.t('session_request_message', peerMeta)}
            </Text>
            <Text
              style={{
                // textAlign: 'center',
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
        style={[
          {
            marginTop: height * 0.3,
            alignItems: 'center',
            backgroundColor: theme.colors.background,
          },
        ]}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <SvgXml xml={getWalletConnectSvg()} width={58} height={58} />
          <DotIndicator
            color={theme.colors.primary}
            size={4}
            count={3}
            style={{ flex: null, marginHorizontal: 16 }}
          />
          <Image
            source={require('../assets/image/ic_logo.png')}
            style={{ width: 60, height: 60 }}
          />
        </View>
        <Text
          style={{
            color: theme.colors.text,
            marginTop: 16,
            opacity: 0.8,
            fontSize: 16,
          }}>
          {I18n.t('walletconnecting_message')}
        </Text>
      </View>
    );
  };
  return (
    <Container style={Styles.bottomContainer}>
      <Headerbar
        backIcon={require('../assets/image/ic_cancel.png')}
        transparent
        onBack={peerId == null ? _onBack : null}
      />
      {peerId == null ? _getConnectingView() : _getSessionRequestView()}
    </Container>
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
    marginVertical: 16,
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
});
export default withTheme(ConnectingScreen);
