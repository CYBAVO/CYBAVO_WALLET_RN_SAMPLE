/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useState } from 'react';
import { Container, Icon } from 'native-base';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import { Text, Badge, withTheme } from 'react-native-paper';
import Headerbar from './Headerbar';
import { CHECK_ICON, LIST_ICON_SIMPLE_SIZE } from '../Constants';
const SecurityQuestionPicker: () => React$Node = ({
  theme,
  rawData = [],
  clickItem,
  initSelected = rawData.length > 0 ? rawData[0] : {},
  getKey = item => item,
  getMainText = item => item,
  badgeText = '',
  width = 200,
  pickable = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(initSelected);
  const isSelected = item => {
    if (!selected == null || item == null) {
      return false;
    }
    return getKey(selected) === getKey(item);
  };
  const _onBackHandle = () => {
    if (showModal) {
      setShowModal(false);
      return true;
    }
    return false;
  };
  const _hideModal = () => {
    setShowModal(false);
  };
  const _renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelected(item);
        clickItem(item);
        _hideModal();
      }}
      style={styles.listItem}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.listItemText}>{getMainText(item)}</Text>
        {isSelected(item) ? (
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
  return (
    <React.Fragment>
      <TouchableOpacity
        disabled={!pickable}
        style={[styles.item, { width: width, marginTop: 10 }]}
        onPress={() => {
          setShowModal(true);
        }}>
        <View style={{ flexDirection: 'row' }}>
          <Badge
            style={[
              {
                alignSelf: 'center',
                backgroundColor: Theme.colors.primary,
                color: 'white',
              },
            ]}>
            {badgeText}
          </Badge>
          <Text style={[styles.listItemText]}>{getMainText(selected)}</Text>
          {pickable && (
            <Image source={require('../assets/image/ic_arrow_right_gray.png')} />
          )}
        </View>
      </TouchableOpacity>
      <Modal
        visible={showModal}
        transparent={true}
        animationType={'slide'}
        style={[Styles.container]}
        onRequestClose={_onBackHandle}>
        <Container style={Styles.bottomContainer}>
          <Headerbar
            backIcon={require('../assets/image/ic_cancel.png')}
            transparent
            title={I18n.t('select_security_question')}
            onBack={() => _hideModal()}
            androidInsetTop={false}
          />
          <FlatList
            data={rawData}
            renderItem={_renderItem}
            keyExtractor={getKey}
            contentContainerStyle={styles.listContainer}
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
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 14,
    flexShrink: 1,
    flex: 1,
    marginLeft: 10,
    alignSelf: 'center',
  },
  listItemSubText: {
    fontSize: 14,
    marginLeft: 15,
    color: Theme.colors.placeholder,
  },
  searchBar: {
    flexShrink: 1,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  listContainer: {
    marginHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    paddingRight: 20,
  },
});
export default withTheme(SecurityQuestionPicker);
