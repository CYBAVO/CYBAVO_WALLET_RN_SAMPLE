import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  NativeModules,
} from 'react-native';
const { RNTwitterSignIn } = NativeModules;
import { Container, Text } from 'native-base';
import { WebView } from 'react-native-webview';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { signIn } from '../store/actions';
import appleAuth from '@invertase/react-native-apple-authentication';
import { ROUND_BUTTON_HEIGHT, ROUND_BUTTON_ICON_SIZE } from '../Constants';
import { SERVICE_ENDPOINT } from '../BuildConfig.json';
import { toastError } from '../Helpers';
import { withTheme, ActivityIndicator } from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import RoundButton2 from '../components/RoundButton2';
import { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } from '../BuildConfig';
const { height, width } = Dimensions.get('window');

const SignInScreen: () => React$Node = ({ theme }) => {
  const webviewRef = useRef(null);
  const { navigate } = useNavigation();
  const error = useSelector(state => state.auth.error);
  // const [loading, setLoading] = useState(true); //useSelector(state => state.auth.loading);
  const loading = useSelector(state => state.auth.loading);
  const signInState = useSelector(state => state.auth.signInState);

  const dispatch = useDispatch();
  useEffect(() => {
    if (error) {
      toastError(error);
    }
  }, [error]);

  return (
    <Container
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
      <Image
        source={require('../assets/image/bg_login.png')}
        style={{
          flex: 1,
          position: 'absolute',
          zIndex: 0,
          top: -1,
          left: 0,
          width: '100%',
        }}
      />
      <View style={{ justifyContent: 'center', flex: 1, flexShrink: 1 }}>
        <Text
          style={[
            {
              padding: 0,
              fontSize: 36,
              color: Theme.colors.text,
              marginLeft: 36,
            },
            Theme.fonts.default.heavy,
          ]}>
          {I18n.t('sign_in_with_social_account')}
        </Text>
      </View>
      <View
        style={{
          // backgroundColor: colorPrimaryDark,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flex: 1,
          paddingHorizontal: 16,
          paddingBottom: 0,
        }}>
        {appleAuth.isSupported && (
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={[styles.roundButton, { backgroundColor: 'white' }]}
            disabled={loading}
            icon={({ size, color }) => (
              <Image
                source={require('../assets/image/ic_login_apple.png')}
                style={{
                  width: ROUND_BUTTON_ICON_SIZE,
                  height: ROUND_BUTTON_ICON_SIZE,
                }}
              />
            )}
            labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
            onPress={() => {
              if (loading) {
                return;
              }
              dispatch(signIn('Apple'));
            }}>
            {I18n.t('sign_in_btn_apple')}
          </RoundButton2>
        )}
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[styles.roundButton, { backgroundColor: 'white' }]}
          disabled={loading}
          icon={({ size, color }) => (
            <Image
              source={require('../assets/image/ic_login_google.png')}
              style={{
                width: ROUND_BUTTON_ICON_SIZE,
                height: ROUND_BUTTON_ICON_SIZE,
              }}
            />
          )}
          labelStyle={[{ color: 'rgb(46,48,53)', fontSize: 14 }]}
          onPress={() => {
            if (loading) {
              return;
            }
            dispatch(signIn('Google'));
          }}>
          {I18n.t('sign_in_btn_google')}
        </RoundButton2>
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[styles.roundButton, { backgroundColor: 'rgb(0,195,0)' }]}
          disabled={loading}
          icon={({ size, color }) => (
            <Image
              source={require('../assets/image/ic_login_line.png')}
              style={{
                width: ROUND_BUTTON_ICON_SIZE,
                height: ROUND_BUTTON_ICON_SIZE,
              }}
            />
          )}
          labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
          onPress={() => dispatch(signIn('LINE'))}>
          {I18n.t('sign_in_btn_line')}
        </RoundButton2>
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[styles.roundButton, { backgroundColor: 'rgb(66,103,178)' }]}
          disabled={loading}
          icon={({ size, color }) => (
            <Image
              source={require('../assets/image/ic_login_fb.png')}
              style={{
                width: ROUND_BUTTON_ICON_SIZE,
                height: ROUND_BUTTON_ICON_SIZE,
              }}
            />
          )}
          labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
          onPress={() => dispatch(signIn('Facebook'))}>
          {I18n.t('sign_in_btn_facebook')}
        </RoundButton2>
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[styles.roundButton, { backgroundColor: '#1da1f2' }]}
          disabled={loading}
          icon={({ size, color }) => (
            <Image
              source={require('../assets/image/ic_login_twitter.png')}
              style={{
                width: ROUND_BUTTON_ICON_SIZE,
                height: ROUND_BUTTON_ICON_SIZE,
              }}
            />
          )}
          labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
          onPress={() => {
            RNTwitterSignIn.init(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET);
            dispatch(signIn('Twitter'));
          }}>
          {I18n.t('sign_in_btn_twitter')}
        </RoundButton2>
        <View
          style={{
            // backgroundColor: 'rgba(0,0,0,1)',
            // flex: 1,
            width: width,
            height: 80,
            // marginTop: 20,
          }}>
          <WebView
            ref={webviewRef}
            useWebKit={true}
            source={{ html: I18n.t('sign_in_agreement') }}
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
              // flex: 1,
              // width: width,
              // height: 10,
              // marginTop: 20,
            }}
            onShouldStartLoadWithRequest={event => {
              if (!/^[data:text, about:blank]/.test(event.url)) {
                Linking.openURL(event.url);
                return false;
              }
              return true;
            }}
          />
        </View>
      </View>
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
    </Container>
  );
};

const styles = StyleSheet.create({
  roundButton: {
    width: '100%',
    marginBottom: 16,
  },
});
export default withTheme(SignInScreen);
