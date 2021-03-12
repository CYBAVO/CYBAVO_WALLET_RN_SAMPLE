import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SectionList,
  FlatList,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { Container, Content, Toast } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { WalletSdk, Auth, Wallets } from '@cybavo/react-native-wallet-service';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n, {
  getLanguage,
  IndexLanguageMap,
  LanguageIndexMap,
  setLanguage,
} from '../i18n/i18n';
import { withTheme, Text, ActivityIndicator } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { CHECK_ICON, LIST_ICON_SIMPLE_SIZE, LOCALES } from '../Constants';
import {
  BIO_SETTING_USE_BIO,
  BIO_SETTING_USE_SMS,
  updateBioSetting,
} from '../store/actions';
const SetBioScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const key = useNavigationParam('key');
  const { navigate, goBack } = useNavigation();

  let data = [
    { key: 'pin_sms', value: BIO_SETTING_USE_SMS },
    { key: 'pin_bio', value: BIO_SETTING_USE_BIO },
  ];
  const setBio = item => {
    setLoading(true);
    dispatch(updateBioSetting(item.value));
    let messageKey =
      item.value == BIO_SETTING_USE_SMS
        ? 'change_bio_success_temp_desc'
        : 'change_bio_success_desc';
    setResult({
      type: TYPE_SUCCESS,
      successButtonText: I18n.t('ok'),
      title: I18n.t('change_successfully'),
      message: I18n.t(messageKey, { method: I18n.t(item.key) }),
      buttonClick: () => {
        setResult(null);
        goBack();
      },
    });
    setLoading(false);
  };
  const _renderItem = ({ item, index, separators }) => {
    let isSelected = key == item.key;
    return (
      <TouchableOpacity
        disabled={isSelected}
        onPress={() => setBio(item)}
        style={styles.listItem}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
          }}>
          <Text style={styles.listItemText}>{I18n.t(item.key)}</Text>
          {isSelected ? (
            <Image
              source={CHECK_ICON}
              style={{
                height: LIST_ICON_SIMPLE_SIZE,
                width: LIST_ICON_SIMPLE_SIZE,
                marginRight: 5,
              }}
            />
          ) : (
            <View
              style={{
                height: LIST_ICON_SIMPLE_SIZE,
                width: LIST_ICON_SIMPLE_SIZE,
                marginRight: 5,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const _keyExtractor = item => {
    return item.key;
  };
  return (
    <Container style={Styles.container}>
      <Headerbar
        transparent
        title={I18n.t('transaction_auth_method')}
        onBack={() => goBack()}
      />
      <FlatList
        data={data}
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
        contentContainerStyle={styles.listContainer}
      />
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
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          successButtonText={result.successButtonText}
          type={result.type}
          message={result.message}
          errorMsg={result.error}
          onButtonClick={result.buttonClick}
          secondaryConfig={result.secondaryConfig}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  listItem: {
    minHeight: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  listItemVertical: {
    minHeight: 60,
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
  },
  listItemHorizontal: {
    minHeight: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
    paddingRight: 0,
  },
  image: {
    width: 36,
    height: 36,
  },
  listContainer: {
    marginHorizontal: 16,
    flexGrow: 1,
  },
});

export default withTheme(SetBioScreen);
