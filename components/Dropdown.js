import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text, Button, Icon } from 'native-base';
import { Theme } from '../styles/MainTheme';
import { CHECK_ICON, LIST_ICON_SIMPLE_SIZE } from '../Constants';
import { withTheme } from 'react-native-paper';
const { width } = Dimensions.get('window');
const MENU_MARGIN_TOP = 7;
const ITEM_WIDTH_ADD = 20;
const Dropdown: () => React$Node = ({
  theme,
  data = [''],
  clickItem,
  currentSelect,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [top, setTop] = useState(110);
  const [left, setLeft] = useState(width - 135);
  const [buttonWidth, setButtonWidth] = useState(130);
  const refContainer = useRef();
  const _onBackHandle = () => {
    if (showModal) {
      setShowModal(false);
      return true;
    }
    return false;
  };

  const _renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        clickItem(item);
        setShowModal(false);
      }}
      style={{
        backgroundColor: theme.colors.pickerBg,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={styles.listItem}>{item}</Text>
      {currentSelect == item && (
        <Image
          source={CHECK_ICON}
          style={{
            height: LIST_ICON_SIMPLE_SIZE,
            width: LIST_ICON_SIMPLE_SIZE,
            position: 'absolute',
            right: 5,
          }}
        />
      )}
    </TouchableOpacity>
  );
  const _keyExtractor = item => {
    return item;
  };
  return (
    <View ref={refContainer}>
      <Button
        iconRight
        rounded
        small
        style={{
          backgroundColor: theme.colors.pickerBg,
          flex: 1,
          paddingRight: 11,
        }}
        onPress={event => {
          if (Platform.OS == 'ios') {
            const { current } = refContainer;
            current.measureInWindow((x, y, containerWidth, containerHeight) => {
              setTop(y + containerHeight + MENU_MARGIN_TOP);
              setButtonWidth(containerWidth);
              setLeft(x);
            });
          }
          setShowModal(true);
        }}>
        <Text
          style={{
            fontFamily: 'Avenir-Roman',
          }}>
          {currentSelect}
        </Text>
        <Image source={require('../assets/image/ic_menu_down.png')} />
      </Button>
      <Modal
        visible={showModal}
        transparent={true}
        style={styles.modalContent}
        animationType={'fade'}
        onRequestClose={_onBackHandle}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.overlay },
          ]} //need to set backgroundColor to make touch work on Android
          onStartShouldSetResponder={evt => {
            evt.persist();
            setShowModal(false);
          }}>
          <FlatList
            data={data}
            renderItem={_renderItem}
            keyExtractor={_keyExtractor}
            scrollEnabled={false}
            contentContainerStyle={[
              styles.wrapper,
              {
                top: top,
                width: buttonWidth + ITEM_WIDTH_ADD,
                left: left - ITEM_WIDTH_ADD,
              },
            ]}
          />
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  modalContent: {
    flex: 0,
  },
  wrapper: {
    position: 'absolute',
    backgroundColor: Theme.colors.pickerBg,
    width: 180,
    alignSelf: 'center',
    paddingLeft: 7,
    paddingRight: 7,
    paddingBottom: 5,
    borderRadius: 8,
  },
  listItem: {
    paddingTop: 10,
    height: 35,
    fontSize: 14,
    fontFamily: 'Avenir-Roman',
    color: 'white',
  },
});
export default withTheme(Dropdown);
