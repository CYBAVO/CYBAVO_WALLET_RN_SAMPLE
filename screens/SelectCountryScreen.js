import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SectionList } from 'react-native';
import { withTheme, Text, Surface, TouchableRipple } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import FlagDisplay from '../components/FlagDisplay';
import Styles from '../styles/Styles';
import I18n, { Country } from '../i18n/i18n';
import { COUNTRIES } from '../Constants';
import { useNavigationParam } from 'react-navigation-hooks';
import {Theme} from '../styles/MainTheme';

function localeCompare(a, b) {
  return a.localeCompare(b);
}

function getSortKey({ displayName, regionCode }) {
  return (displayName || regionCode).charAt(0).toUpperCase() || '#';
}

function generateCountries() {
  // console.log('Country:', Country);
  const countries = Object.entries(COUNTRIES).map(
    ([regionCode, { countryCode }]) => {
      const country = {
        regionCode,
        countryCode,
        displayName: I18n.t(regionCode) || regionCode,
      };
      return {
        ...country,
        sortKey: getSortKey(country),
      };
    }
  );

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

const COUNTRY_SECTIONS = generateCountries();

const SelectCountryScreen: () => React$Node = ({
  theme,
  navigation: { goBack, navigate },
}) => {
  const source = useNavigationParam('source');
  const selected = useNavigationParam('selected');
  const onSelectCountry = useNavigationParam('onSelectCountry');
  const _selectCountry = (regionCode, countryCode) => {
    if (source) {
      navigate(source, {
        selected: {
          regionCode,
          countryCode,
        },
      });
    } else {
      goBack();
    }
  };

  const _renderHeader = ({ section: { title } }) => (
    <Text
      style={[
        styles.listHeader,
        theme.fonts.medium,
        {
          color: theme.colors.gray600,
          backgroundColor: theme.colors.backgroundColor,
        },
      ]}>
      {title}
    </Text>
  );

  const _renderItem = ({
    item: { displayName, regionCode, countryCode },
    index,
    section: { data },
  }) => {
    const isLast = index === data.length - 1;
    const isSelected = selected === regionCode;
    return (
      <Surface style={[styles.listItem]}>
        <TouchableRipple
          onPress={() => _selectCountry(regionCode, countryCode)}>
          <View
            style={[
              styles.listItemContent,
              { borderColor: isLast ? 'transparent' : theme.colors.countryCodeDivider },
            ]}>
            <View style={styles.itemLeft}>
              <FlagDisplay style={styles.flag} regionCode={regionCode} />
            </View>
            <Text
              style={[
                styles.countryName,
                isSelected
                  ? {
                      ...theme.fonts.medium,
                      color: theme.colors.primary,
                    }
                  : null,
              ]}>
              {displayName}
            </Text>
            <Text
              style={[
                styles.countryCode,
                { color: theme.colors.countryCodeText },
              ]}>{`+${countryCode}`}</Text>
          </View>
        </TouchableRipple>
      </Surface>
    );
  };

  return (
    <View style={Styles.Container}>
      <Headerbar
        dark
        onBack={goBack}
        title={I18n.t('title_select_country')}
        style={styles.headerbar}
      />
      <View style={[Styles.Body, styles.body]}>
        <SectionList
          style={styles.list}
          sections={COUNTRY_SECTIONS}
          keyExtractor={(item, index) => item + index}
          renderSectionHeader={_renderHeader}
          renderItem={_renderItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerbar: {},
  body: {},
  list: {
    flex: 1,
  },
  listHeader: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 6,
    textTransform: 'uppercase',
  },
  listItem: {
    // borderBottomWidth: 1,
    shadowOpacity: 0,
  },
  listItemContent: {
    minHeight: 44,
    borderBottomWidth: 1,
    marginLeft: 16,
    paddingRight: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLeft: {
    width: 40,
  },
  flag: {},
  countryName: {
    flex: 1,
    color: Theme.colors.text,
  },
  countryCode: {
    fontSize: 12,
  },
});

export default withTheme(SelectCountryScreen);
