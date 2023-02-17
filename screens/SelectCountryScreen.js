import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SectionList, Image, Modal } from 'react-native';
import {
  withTheme,
  Text,
  Surface,
  TouchableRipple,
  Searchbar,
} from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import FlagDisplay from '../components/FlagDisplay';
import Styles from '../styles/Styles';
import I18n, { Country } from '../i18n/i18n';
import { CHECK_ICON, COUNTRIES, LIST_ICON_SIMPLE_SIZE } from '../Constants';
import { useNavigationParam } from 'react-navigation-hooks';
import { Theme } from '../styles/MainTheme';
import { Container } from 'native-base';
import ListEmptyView from '../components/ListEmptyView';
import NavigationService from '../NavigationService';
import { useDispatch } from 'react-redux';

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

const SelectCountryScreen: () => React$Node = ({
  theme,
  navigation: { goBack, navigate },
}) => {
  const clearIcon = require('../assets/image/ic_input_clear.png');
  const from = useNavigationParam('from') || 'EnterPhone';
  const callback = useNavigationParam('callback');
  const initSelected = useNavigationParam('initSelected');
  const number = useNavigationParam('number');
  const [keyword, setKeyword] = useState('');
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(initSelected);
  const isSelected = regionCode => {
    if (!selected == null || regionCode == null) {
      return false;
    }
    return selected === regionCode;
  };
  let rawData = COUNTRIES;
  let searchables = ['regionCode', 'countryCode', 'displayName'];

  const getData = () => {
    let arr = Object.entries(rawData);
    return generateCountries(arr, keyword, searchables);
  };
  const data = getData();

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
            { paddingVertical: 15, fontSize: 14, color: theme.colors.sliver },
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
          NavigationService.navigate(from, {
            regionCode: regionCode,
            countryCode: countryCode,
            number: number,
          });
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
  const _getKey = item => {
    const s = `${item.regionCode}`;
    return s;
  };
  return (
    <Container style={[{ flex: 1, backgroundColor: theme.colors.navy }]}>
      <Headerbar
        style={{
          zIndex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 62,
          backgroundColor: theme.colors.navy,
        }}
        iosInsetTop={false}
        androidInsetTop={false}
        titleColor={theme.colors.text}
        title={I18n.t('register')}
        onBack={() => {
          NavigationService.navigate(from, {
            regionCode: selected,
            countryCode: rawData[selected].countryCode,
            number: number,
          });
        }}
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
        keyExtractor={_getKey}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <ListEmptyView
            text={I18n.t('no_search_result')}
            img={require('../assets/image/ic_no_search_result.png')}
          />
        }
      />
    </Container>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: Theme.colors.navy,
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

export default withTheme(SelectCountryScreen);
