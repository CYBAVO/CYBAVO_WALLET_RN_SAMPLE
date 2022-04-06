import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { withTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { useDispatch } from 'react-redux';
import {
  AUTH_UPDATE_GLOBAL_MODAL,
  setSkipNews,
  signOut,
} from '../store/actions/auth';
import ResultModal, { TYPE_CONFIRM } from '../components/ResultModal';
import NavigationService from '../NavigationService';

const GlobalModalScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const isNews = useNavigationParam('isNews');
  const config = useNavigationParam('config');

  const _getContentView = () => {
    if (isNews) {
      return (
        <ResultModal
          visible={true}
          title={I18n.t('news_title')}
          message={I18n.t('news_message')}
          type={TYPE_CONFIRM}
          successButtonText={I18n.t('ok')}
          onButtonClick={() => {
            setTimeout(() => {
              dispatch({ type: AUTH_UPDATE_GLOBAL_MODAL, globalModal: {} });
              setSkipNews('true');
              goBack();
            }, 100);
          }}
        />
      );
    }
    if (!config) {
      goBack();
      return;
    }
    return (
      <ResultModal
        visible={true}
        title={config.title}
        message={config.message}
        type={config.type}
        errorMsg={config.errorMsg}
        successButtonText={config.successButtonText}
        failButtonText={config.failButtonText}
        onButtonClick={() => {
          setTimeout(() => {
            dispatch({ type: AUTH_UPDATE_GLOBAL_MODAL, globalModal: {} });
            goBack();
          }, 100);
        }}
      />
    );
  };
  return <View style={styles.container}>{_getContentView()}</View>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#00000040',
  },
});
export default withTheme(GlobalModalScreen);
