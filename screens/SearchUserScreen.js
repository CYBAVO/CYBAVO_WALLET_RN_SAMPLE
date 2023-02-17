import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SectionList,
  FlatList,
  Platform,
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
import {
  CHECK_ICON,
  LIST_ICON_SIMPLE_SIZE,
  LOCALES,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { signIn } from '../store/actions';
import { sleep, toast, toastError } from '../Helpers';
import { KycHelper } from '../utils/KycHelper';
import CompoundTextInput from '../components/CompoundTextInput';
const SearchUserScreen: () => React$Node = ({ theme }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const refs = [useRef()];
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const _performSearch = async () => {
    refs[0].current.blur();
    setLoading(true);
    try {
      // await sleep(1000);
      // let l = [];
      // for (let i = 0; i < 7; i++) {
      //   l.push({ userName: 'eva' + i, referralCode: 'code' + i });
      // }
      let result = await Auth.searchUser(query);
      if (result.infos) {
        setSearchResult(result.infos);
      } else {
        setSearchResult([]);
      }
    } catch (error) {
      console.log('search failed', error);
      setResult({
        type: TYPE_FAIL,
        error: I18n.t(`error_msg_${error.code}`, {
          defaultValue: error.message,
        }),
        title: I18n.t('search_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const _renderItem = ({ item, index, separators }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 60,
          borderBottomColor: Theme.colors.divider,
          borderBottomWidth: 1,
        }}>
        <Text
          style={{
            fontSize: 14,
          }}>{`#${index}`}</Text>
        <View
          style={{
            flexDirection: 'column',
          }}>
          <Text
            style={{
              fontSize: 16,
              marginLeft: 15,
            }}>{`Name: ${item.realName}`}</Text>

          <Text
            style={{
              fontSize: 16,
              marginLeft: 15,
            }}>{`Code: ${item.referralCode}`}</Text>
        </View>
      </View>
    );
  };
  return (
    <Container style={[Styles.container]}>
      <Headerbar
        transparent
        title={I18n.t('search_user')}
        onBack={() => goBack()}
      />

      <ScrollView
        style={{
          flexDirection: 'column',
          paddingHorizontal: 16,
          backgroundColor: theme.colors.background,
        }}>
        <Text style={Styles.labelBlock}>
          {I18n.t('user_name_or_referral_code')}
        </Text>
        <CompoundTextInput
          ref={refs[0]}
          style={Styles.compoundInput}
          value={query}
          autoCapitalize="none"
          underlineColor={Theme.colors.normalUnderline}
          hasError={false}
          onChangeText={v => setQuery(v)}
          placeholder={I18n.t('search_hint')}
          onClear={() => {
            setQuery('');
          }}
          onSubmitEditing={() => {
            refs[0].current.blur();
          }}
        />
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[{ marginTop: 16, backgroundColor: theme.colors.primary }]}
          disabledStyle={{ backgroundColor: theme.colors.primaryDisabled }}
          disabled={loading}
          labelStyle={[
            { color: theme.colors.text, fontSize: ROUND_BUTTON_FONT_SIZE },
          ]}
          onPress={_performSearch}>
          {I18n.t('search')}
        </RoundButton2>
        <Text style={Styles.labelBlock}>
          {I18n.t('result_count_template', { count: searchResult.length })}
        </Text>
        <FlatList
          data={searchResult}
          renderItem={_renderItem}
          keyExtractor={item => `${item.realName}#${item.referralCode}`}
          contentContainerStyle={styles.listContainer}
        />
      </ScrollView>

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
    flex: 1,
  },
});

export default withTheme(SearchUserScreen);
