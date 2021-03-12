import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Image,
  SectionList,
  StatusBar,
  Platform,
} from 'react-native';
import { Icon, Container } from 'native-base';
import {
  Searchbar,
  withTheme,
  Text,
  Surface,
  TouchableRipple,
} from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
import I18n, { Country } from '../i18n/i18n';
import IconSvgXml from './IconSvgXml';
import Headerbar from './Headerbar';
import {
  CHECK_ICON,
  COUNTRIES,
  LIST_ICON_SIMPLE_SIZE,
  SMALL_ICON_SIMPLE_SIZE,
} from '../Constants';
import { getWalletKeyByWallet } from '../Helpers';
import { fetchCurrenciesIfNeed } from '../store/actions';
import { useDispatch } from 'react-redux';
import ListEmptyView from './ListEmptyView';
import FlagDisplay from './FlagDisplay';
const { width } = Dimensions.get('window');
const clearIcon = require('../assets/image/ic_input_clear.png');

function localeCompare(a, b) {
  return a.localeCompare(b);
}

function getSortKey({ displayName, regionCode }) {
  return (displayName || regionCode).charAt(0).toUpperCase() || '#';
}

const _filter = (item, keyword, searchables) => {
  if (!keyword) {
    return true;
  }
  const regex = new RegExp(keyword, 'i');
  for (let i = 0; i < searchables.length; i++) {
    const f = searchables[i];
    if (item[f] && item[f].toString().match(regex)) {
      return true;
    }
  }
  return false;
};
function generateCountries(arr, keyword, searchables) {
  let countries = [];
  for (let i = 0; i < arr.length; i++) {
    let [regionCode, { countryCode }] = arr[i];
    let displayName = I18n.t(regionCode) || regionCode;
    if (
      _filter({ regionCode, countryCode, displayName }, keyword, searchables)
    ) {
      const country = {
        regionCode,
        countryCode,
        displayName,
      };
      countries.push({
        ...country,
        sortKey: getSortKey(country),
      });
    }
  }
  let suggested = null;
  const map = {};
  countries.forEach(country => {
    const { displayName = '', regionCode, countryCode, sortKey } = country;
    // const sortKey = getSortKey(country);
    if (!map[sortKey]) {
      map[sortKey] = {
        data: [],
      };
    }
    const item = { displayName, regionCode, countryCode };
    if (regionCode === Country) {
      suggested = item;
    }
    map[sortKey].data.push(item);
  });

  const sortKeys = Object.keys(map).sort(localeCompare);
  const sections = sortKeys.map(sortKey => ({
    title: sortKey,
    data: map[sortKey].data.sort((c1, c2) =>
      localeCompare(c1.displayName, c2.displayName)
    ),
  }));

  // add suggested
  if (suggested) {
    sections.unshift({
      title: I18n.t('label_seggested'),
      data: [suggested],
    });
  }
  return sections;
}
// const COUNTRY_SECTIONS = generateCountries();
const CountryCodePicker: () => React$Node = ({
  theme,
  rawData = COUNTRIES,
  style = {},
  clickItem,
  initSelected = '',
  searchables = ['regionCode', 'countryCode', 'displayName'],
  getKey = item => {
    const s = `${item.regionCode}`;
    return s;
  },
}) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(initSelected);
  const [keyword, setKeyword] = useState('');
  const isSelected = regionCode => {
    if (!selected == null || regionCode == null) {
      return false;
    }
    return selected === regionCode;
  };

  useEffect(() => {
    setSelected(initSelected);
    // clickItem(initSelected);
  }, [initSelected]);

  const _onBackHandle = () => {
    if (keyword.length > 0) {
      setKeyword('');
      return true;
    }
    if (showModal) {
      setShowModal(false);
      return true;
    }
    return false;
  };

  const getData = () => {
    let arr = Object.entries(rawData);
    return generateCountries(arr, keyword, searchables);
  };
  const data = getData();
  const _hideModal = () => {
    setShowModal(false);
  };
  const _renderSectionHeader = ({ section: { title } }) => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.navy,
          paddingHorizontal: 16,
        }}>
        <Text
          style={[
            Theme.fonts.default.regular,
            Styles.secHeaderLabel,
            { paddingVertical: 15, fontSize: 14, color: theme.colors.silver },
          ]}>
          {title}
        </Text>
      </View>
    );
  };
  const _renderItem = ({
    item: { displayName, regionCode, countryCode },
    index,
    section: { data },
  }) => (
    <Surface
      style={[
        Styles.listItem,
        {
          backgroundColor: theme.colors.navy,
          paddingHorizontal: 16,
        },
      ]}>
      <TouchableRipple
        onPress={() => {
          setSelected(regionCode);
          clickItem(regionCode, countryCode);
          _hideModal();
        }}
        style={styles.listItem}>
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <FlagDisplay regionCode={regionCode} />
            <Text style={[styles.listItemText, Theme.fonts.default.heavy]}>
              {displayName}
            </Text>
            <Text style={[styles.listItemSubText, Theme.fonts.default.regular]}>
              {`+${countryCode}`}
            </Text>
          </View>
          <View />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
            }}>
            <Text
              style={[
                Theme.fonts.default.regular,
                styles.listItemSubText,
                { marginRight: 3, paddingBottom: 3 },
              ]}>
              {''}
            </Text>
            {isSelected(regionCode) ? (
              <Image
                source={CHECK_ICON}
                style={{
                  height: LIST_ICON_SIMPLE_SIZE,
                  width: LIST_ICON_SIMPLE_SIZE,
                }}
              />
            ) : (
              <View
                style={{
                  height: LIST_ICON_SIMPLE_SIZE,
                  width: LIST_ICON_SIMPLE_SIZE,
                }}
              />
            )}
          </View>
        </>
      </TouchableRipple>
    </Surface>
  );
  const countryCode = COUNTRIES[selected].countryCode;
  return (
    <React.Fragment>
      <TouchableOpacity
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            borderRadius: 4,
            height: 44,
            backgroundColor: theme.colors.pickerBg,
          },
          style,
        ]}
        onPress={() => {
          setShowModal(true);
        }}>
        <FlagDisplay style={styles.flag} regionCode={selected} />
        <Text
          style={[
            Styles.currencyTextMain,
            Theme.fonts.default.heavy,
            {
              marginLeft: 4,
              fontSize: 12,
            },
          ]}>
          {`+${countryCode}`}
        </Text>
        <Image source={require('../assets/image/ic_arrow_expand_w.png')} />
      </TouchableOpacity>
      <Modal
        visible={showModal}
        transparent={true}
        style={[Styles.container, { backgroundColor: 'transparent' }]}
        animationType={'fade'}
        onRequestClose={_onBackHandle}>
        <Container style={[{ flex: 1, backgroundColor: 'transparent' }]}>
          <Headerbar
            style={{
              zIndex: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              marginTop: 62,
              backgroundColor: theme.colors.navy,
            }}
            ParentIos={View}
            Parent={View}
            titleColor={theme.colors.text}
            title={I18n.t('register')}
            onBack={() => _hideModal()}
          />
          <Searchbar
            inputStyle={[
              {
                backgroundColor: theme.colors.navy,
                fontSize: 14,
                color: theme.colors.text,
              },
              Theme.fonts.default.regular,
            ]}
            icon={require('../assets/image/ic_search_dark_bg.png')}
            style={styles.searchBar}
            iconColor={theme.colors.blueGrey}
            clearIcon={clearIcon}
            placeholderTextColor={theme.colors.blueGrey}
            placeholder={I18n.t('search_placeholder')}
            onChangeText={keyword => setKeyword(keyword)}
            value={keyword}
          />
          <SectionList
            sections={data}
            renderItem={_renderItem}
            renderSectionHeader={_renderSectionHeader}
            keyExtractor={getKey}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<ListEmptyView />}
          />
        </Container>
      </Modal>
    </React.Fragment>
  );
};
const styles = StyleSheet.create({
  modalContent: {
    flex: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderBottomColor: Theme.colors.dividerDarkBg,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  listItemSubText: {
    fontSize: 14,
    marginLeft: 15,
    color: Theme.colors.text,
  },
  searchBar: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderBottomColor: Theme.colors.dividerDarkBg,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 0,
  },
  listContainer: {
    flexGrow: 1,
    backgroundColor: Theme.colors.navy,
  },
  item: {
    backgroundColor: Theme.colors.pickerBgTransparent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    marginLeft: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
});
export default withTheme(CountryCodePicker);
