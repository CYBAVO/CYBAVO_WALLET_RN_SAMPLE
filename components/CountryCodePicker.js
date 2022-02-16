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
// const COUNTRY_SECTIONS = generateCountries();
const CountryCodePicker: () => React$Node = ({
  theme,
  rawData = COUNTRIES,
  style = {},
  clickItem,
  initSelected = '',
  onPress = () => {},
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
        onPress={onPress}>
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
