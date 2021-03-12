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
import { Theme } from '../styles/MainTheme';
import { CHECK_ICON, LIST_ICON_SIMPLE_SIZE } from '../Constants';
import { withTheme, Text } from 'react-native-paper';
import Styles from '../styles/Styles';
const { width } = Dimensions.get('window');
const MENU_MARGIN_TOP = 3;
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
            right: 0,
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
      <TouchableOpacity
        style={[
          Styles.tag,
          {
            backgroundColor: theme.colors.pickerBg,
            height: 24,
            paddingRight: 11,
            paddingLeft: 15,
            paddingVertical: 4,
            borderRadius: 11,
          },
        ]}
        onPress={event => {
          if (Platform.OS == 'ios') {
            const { current } = refContainer;
            current.measureInWindow((x, y, containerWidth, containerHeight) => {
              setTop(y + containerHeight - MENU_MARGIN_TOP);
              setButtonWidth(containerWidth * 2);
              setLeft(x - containerWidth);
            });
          }
          setShowModal(true);
        }}>
        <Text
          style={{
            fontFamily: 'Avenir-Roman',
            fontSize: 12,
          }}>
          {currentSelect}
        </Text>
        <Image
          source={require('../assets/image/ic_menu_down.png')}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
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
    marginRight: 10,
    fontFamily: 'Avenir-Roman',
    color: 'white',
  },
});
export default withTheme(Dropdown);
