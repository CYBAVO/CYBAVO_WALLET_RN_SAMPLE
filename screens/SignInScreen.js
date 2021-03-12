import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  NativeModules,
  Animated,
  Easing,
} from 'react-native';
const { RNTwitterSignIn } = NativeModules;
import { Container, Text } from 'native-base';
import { WebView } from 'react-native-webview';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { AUTH_UPDATE_ANIMATE, AUTH_UPDATE_DEV, signIn } from '../store/actions';
import appleAuth from '@invertase/react-native-apple-authentication';
import { ROUND_BUTTON_HEIGHT, ROUND_BUTTON_ICON_SIZE } from '../Constants';
import { SERVICE_ENDPOINT } from '../BuildConfig.json';
import { getLoginBgSvg, toastError } from '../Helpers';
import { withTheme, ActivityIndicator } from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import RoundButton2 from '../components/RoundButton2';
import { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } from '../BuildConfig';
const { height, width } = Dimensions.get('window');
import { SvgXml } from 'react-native-svg';

const SignInScreen: () => React$Node = ({ theme }) => {
  const skipAnimate = useSelector(state => state.auth.skipAnimate);
  const webviewRef = useRef(null);
  const { navigate } = useNavigation();
  const error = useSelector(state => state.auth.error);
  const loading = useSelector(state => state.auth.loading);
  const signInState = useSelector(state => state.auth.signInState);
  const [animOpacity, setAnimOpacity] = useState(new Animated.Value(0));
  const [translateY, setTranslateY] = useState(new Animated.Value(0));
  const iconInitMarginTop = height * 0.35;
  const iconAfterMarginTop = -iconInitMarginTop * 0.55;
  const dispatch = useDispatch();
  const startTranslateY = () => {
    Animated.timing(translateY, {
      toValue: iconAfterMarginTop,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      dispatch({ type: AUTH_UPDATE_ANIMATE, skipAnimate: true });
      startOpacityAnimation();
    });
  };
  const startOpacityAnimation = () => {
    Animated.timing(animOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {});
  };
  useEffect(() => {
    if (error) {
      toastError(error);
    }
    startTranslateY();
  }, [error]);

  return (
    <Container
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
      <SvgXml
        xml={getLoginBgSvg(width, height)}
        style={{
          position: 'absolute',
          zIndex: 0,
          top: -1,
          left: 0,
          width: '100%',
        }}
      />
      <View style={{ justifyContent: 'center', flex: 1, flexShrink: 1 }}>
        <Animated.Image
          resizeMode="contain"
          source={require('../assets/image/splash.png')}
          style={{
            alignSelf: 'center',
            marginTop: iconInitMarginTop,
            transform: [{ translateY }],
          }}
        />
      </View>
      <Animated.View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flex: 1,
          paddingHorizontal: 16,
          paddingBottom: 0,
          opacity: animOpacity,
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
            width: width,
            height: 80,
          }}>
          <WebView
            ref={webviewRef}
            useWebKit={true}
            source={{ html: I18n.t(`sign_in_agreement_${Platform.OS}`) }}
            style={{
              backgroundColor: 'rgba(0,0,0,0)',
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
      </Animated.View>
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
