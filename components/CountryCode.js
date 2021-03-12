import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { withTheme, TouchableRipple, Text } from 'react-native-paper';
import FlagDisplay from './FlagDisplay';
import { COUNTRIES } from '../Constants';
import I18n, { Country } from '../i18n/i18n';

function localeCompare(a, b) {
  return a.localeCompare(b);
}

function getSortKey({ displayName, regionCode }) {
  return (displayName || regionCode).charAt(0).toUpperCase() || '#';
}

function generateCountries() {
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
const CountryCode: () => React$Node = ({
  style,
  theme,
  regionCode,
  onPress,
}) => {
  const countryCode = COUNTRIES[regionCode].countryCode;

  return (
    <TouchableRipple
      borderless
      rippleColor={theme.colors.highlightLight}
      style={[
        styles.container,
        style,
        { backgroundColor: theme.colors.primary },
      ]}
      onPress={onPress}>
      <>
        <FlagDisplay style={styles.flag} regionCode={regionCode} />
        <Text style={styles.label}>{`+${countryCode}`}</Text>
        <Image
          style={styles.arrow}
          source={require('../assets/image/icArrowExpand.png')}
        />
      </>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  flag: {},
  badge: {
    position: 'absolute',
    right: 0,
  },
  label: {
    marginLeft: 4,
    fontSize: 12,
    color: 'white',
  },
  arrow: {
    marginLeft: 2,
  },
});

export default withTheme(CountryCode);
