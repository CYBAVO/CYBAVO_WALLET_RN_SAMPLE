import React, { useEffect } from 'react';
import { useAppState } from '@react-native-community/hooks';
import { useDispatch } from 'react-redux';
import AppNavigator from './AppNavigator';
import { initListener, initLocale, removeListener } from './store/actions/auth';
import NavigationService from './NavigationService';
import * as RNLocalize from 'react-native-localize';
import I18n from 'react-native-i18n';

const App: () => React$Node = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initListener());
    dispatch(initLocale());
    return () => removeListener();
  }, [dispatch]);

  return (
    <AppNavigator
      ref={navigatorRef => {
        NavigationService.setTopLevelNavigator(navigatorRef);
      }}
    />
  );
};
export default App;
