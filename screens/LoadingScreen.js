import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { withTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import I18n from '../i18n/i18n';
import { useDispatch } from 'react-redux';
import { signOut } from '../store/actions/auth';
import ResultModal, {TYPE_CONFIRM} from '../components/ResultModal';

const LoadingScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const sessionExpire = useNavigationParam('sessionExpire');
  const sdkSignOut = useNavigationParam('sdkSignOut');
  const [showModal, setShowModal] = useState(sessionExpire); //null or currency
  return (
    <View style={styles.container}>
      {sessionExpire && showModal && (
        <ResultModal
          visible={true}
          title={I18n.t('session_expired')}
          message={I18n.t('session_expired_content')}
          type={TYPE_CONFIRM}
          successButtonText={I18n.t('ok')}
          onButtonClick={() => {
            setShowModal(false);
            setTimeout(() => {
              dispatch(signOut(false, sdkSignOut !== false)); // null seems as true
            }, 100);
          }}
        />
      )}
      {!showModal && (
        <ActivityIndicator color={theme.colors.primary} size="large" />
      )}
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
