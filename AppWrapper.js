import React, { useEffect, useState } from 'react';
import { AppState, Platform, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { Container, Root, Text } from 'native-base';
import { store, persistor } from './store';
import AppNavigator from './AppNavigator';
import NavigationService from './NavigationService';
import { initPushNotification } from './PushNotification';
import { getPushToken } from './PushNotification';
import { PersistGate } from 'redux-persist/integration/react';
import { Wallets, WalletSdk } from '@cybavo/react-native-wallet-service';
import { GoogleSignin } from 'react-native-google-signin';
import {
  Provider as PaperProvider,
  DefaultTheme,
  configureFonts,
} from 'react-native-paper';
import { GOOGLE_SIGN_IN_WEB_CLI_ID } from './BuildConfig.json';
import { Theme } from './styles/MainTheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Styles from './styles/Styles';
import I18n from './i18n/i18n';
import VersionNumber from 'react-native-version-number';
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...Theme.colors,
  },
  fonts: configureFonts(Theme.fonts), //didn't work
};
const AppWrapper: () => React$Node = () => {
  StatusBar.setBarStyle('light-content');
  if (Platform.OS === 'android') {
    StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    StatusBar.setTranslucent(true);
  }
  const _initGoogle = () => {
    GoogleSignin.configure({
      offlineAccess: false,
      webClientId: GOOGLE_SIGN_IN_WEB_CLI_ID,
    });
  };
  // update push token
  useEffect(() => {
    initPushNotification().then(token => {
      console.log('push initialized: ', token);
    });
    _initGoogle();
  }, []);
  const LoadingPlaceholder: () => React$Node = () => {
    return (
      <Container style={Styles.bottomContainer}>
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
            },
          ]}>
          {`${I18n.t('version')} ${VersionNumber.appVersion}...`}
        </Text>
      </Container>
    );
  };
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <PersistGate loading={<LoadingPlaceholder />} persistor={persistor}>
            <Root>
              <AppNavigator
                ref={navigatorRef => {
                  NavigationService.setTopLevelNavigator(navigatorRef);
                }}
              />
            </Root>
          </PersistGate>
        </PaperProvider>
      </Provider>
    </SafeAreaProvider>
  );
};
export default AppWrapper;
