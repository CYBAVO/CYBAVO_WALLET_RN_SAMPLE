import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { withTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { useDispatch } from 'react-redux';
import {AUTH_UPDATE_FOR_NEWS, setSkipNews, signOut} from '../store/actions/auth';
import ResultModal, { TYPE_CONFIRM } from '../components/ResultModal';
import NavigationService from '../NavigationService';

const LoadingScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const routeName = useNavigationParam('routeName');
  return (
    <View style={styles.container}>
      <ResultModal
        visible={true}
        title={I18n.t('news_title')}
        message={I18n.t('news_message')}
        type={TYPE_CONFIRM}
        successButtonText={I18n.t('ok')}
        onButtonClick={() => {
          setTimeout(() => {
            dispatch({ type: AUTH_UPDATE_FOR_NEWS, showNews: false });
            setSkipNews('true');
            goBack();
          }, 100);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#00000040',
  },
});
export default withTheme(LoadingScreen);
