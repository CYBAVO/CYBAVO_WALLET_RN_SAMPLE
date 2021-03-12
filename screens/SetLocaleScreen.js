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
import { WalletSdk, Auth } from '@cybavo/react-native-wallet-service';
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
const SetLocaleScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const index = useNavigationParam('index');
  const onChange = useNavigationParam('onChange');
  const { navigate, goBack } = useNavigation();
  const [languageIndex, setLanguageIndex] = useState(0);

  const _setLanguageIndex = i => {
    setLanguageIndex(i);
    setLanguage(IndexLanguageMap[i]);
    setResult({
      type: TYPE_SUCCESS,
      successButtonText: I18n.t('ok'),
      title: I18n.t('change_successfully'),
      message: I18n.t('change_locale_success_desc'),
      buttonClick: () => {
        if (onChange) {
          onChange(i);
        }
        navigate('Assets', { refresh: true });
        setResult(null);
      },
    });
  };

  const _getLanguageIndexFromStorage = () => {
    getLanguage()
      .then(lan => {
        if (!lan) {
          lan = 'en';
        }
        setLanguageIndex(LanguageIndexMap[lan] || 0);
      })
      .catch(error => {});
  };

  useEffect(() => {
    if (index == null) {
      _getLanguageIndexFromStorage();
    } else {
      setLanguageIndex(index);
    }
  }, []);

  const _renderItem = ({ item, index, separators }) => {
    let isSelected = languageIndex == index;
    return (
      <TouchableOpacity
        onPress={() => _setLanguageIndex(index)}
        style={styles.listItem}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
          }}>
          <Text style={styles.listItemText}>{item}</Text>
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
    return item;
  };
  return (
    <Container style={Styles.container}>
      <Headerbar
        transparent
        title={I18n.t('language')}
        onBack={() => goBack()}
      />
      <FlatList
        data={LOCALES}
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

export default withTheme(SetLocaleScreen);
