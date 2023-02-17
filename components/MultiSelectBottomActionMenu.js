import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Styles from '../styles/Styles';
import {
  useDimensions,
  useLayout,
  useBackHandler,
} from '@react-native-community/hooks';
import {
  withTheme,
  TextInput,
  Modal,
  Surface,
  Portal,
  Paragraph,
  Subheading,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import I18n from '../i18n/i18n';
import { Theme } from '../styles/MainTheme';
import {
  CHECK_ICON,
  LIST_ICON_SIMPLE_SIZE,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
import { Button } from 'native-base';
import RoundButton2 from './RoundButton2';
import CheckBox from './CheckBox';

const ARROW_ICON = require('../assets/image/ic_down_arrow.png');
const MultiSelectBottomActionMenu: () => React$Node = ({
  theme,
  visible,
  onClick,
  onCancel,
  data = [],
  onConfirm = map => {},
  containerStyle,
  scrollEnabled = true,
  title = I18n.t('filter'),
  mainText = '',
  getValue,
}) => {
  const [iosImeHeight, setiosImeHeight] = useState(0);
  const [currentSelect, setCurrentSelect] = useState({});

  const { height: screenHeight } = useDimensions().screen;
  const { onLayout, ...layout } = useLayout();
  const [translateY] = useState(
    new Animated.Value(layout.height || screenHeight)
  );
  const [modalVisible, setModalVisible] = useState(false);

  const _updateKeyboardSpace = (frames: Object) => {
    console.log('_updateKeyboardSpace: ', frames);
    setiosImeHeight(frames.endCoordinates.height);
  };

  const _resetKeyboardSpace = (frames: Object) => {
    console.log('_resetKeyboardSpace');
    setiosImeHeight(0);
  };

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', _updateKeyboardSpace);
    Keyboard.addListener('keyboardWillHide', _resetKeyboardSpace);
    return () => {
      Keyboard.removeListener('keyboardWillShow', _updateKeyboardSpace);
      Keyboard.removeListener('keyboardWillHide', _resetKeyboardSpace);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
      setModalVisible(true);
      // animate show
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    } else {
      // animate hide
      Animated.timing(translateY, {
        toValue: layout.height || screenHeight,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        setModalVisible(false);
      });
    }
  }, [visible, translateY]);

  // handle back
  useBackHandler(() => {
    if (visible) {
      onCancel();
      return true;
    }
    return false;
  });

  const _renderItem = ({ item, index, separators }) => {
    return (
      <Surface
        style={[
          Styles.listItem,
          {
            backgroundColor: theme.colors.background,
          },
        ]}>
        <CheckBox
          style={{ marginLeft: 16, marginRight: 16 }}
          text={item.title}
          subText={item.desc}
          selected={currentSelect[item.value] == true}
          onPress={() => {
            let nMap = { ...currentSelect };
            if (currentSelect[item.value] == null) {
              nMap[item.value] = true;
            } else {
              nMap[item.value] = !nMap[item.value];
            }
            setCurrentSelect(nMap);
          }}
        />
      </Surface>
    );
  };
  const _keyExtractor = item => {
    return getValue ? getValue(item) : item;
  };
  return (
    <>
      <TouchableOpacity
        style={[
          Styles.tag,
          {
            backgroundColor: theme.colors.backgroundPressed,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
          containerStyle,
        ]}
        onPress={onClick}>
        <Text
          style={[styles.text, Theme.fonts.default.heavy]}
          numberOfLines={1}>
          {mainText}
        </Text>
        <Image source={ARROW_ICON} />
      </TouchableOpacity>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={onCancel}
          dismissable={true}
          transparent={true}
          contentContainerStyle={styles.model}>
          <TouchableWithoutFeedback onPressIn={onCancel}>
            <View style={styles.blank} />
          </TouchableWithoutFeedback>
          <Animated.View style={{ transform: [{ translateY }] }}>
            <Surface
              onLayout={onLayout}
              style={[
                styles.content,
                { backgroundColor: theme.colors.background },
              ]}>
              <View
                style={[
                  styles.footer,
                  { height: screenHeight < 700 ? screenHeight * 0.6 : 600 },
                ]}>
                <Text style={styles.lowTitle}>{title}</Text>
                <FlatList
                  data={data}
                  extraData={currentSelect}
                  renderItem={_renderItem}
                  keyExtractor={_keyExtractor}
                  scrollEnabled={scrollEnabled}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 16,
                    marginBottom: 16,
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    style={[
                      {
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        height: ROUND_BUTTON_HEIGHT,
                        alignSelf: 'stretch',
                      },
                    ]}
                    onPress={() => {
                      let nMap = {};
                      for (let i = 0; i < data.length; i++) {
                        nMap[data[i].value] = false;
                      }
                      setCurrentSelect(nMap);
                    }}>
                    <Text
                      style={[
                        Theme.fonts.default.medium,
                        {
                          color: theme.colors.primary,
                          fontSize: 16,
                          alignSelf: 'center',
                        },
                      ]}>
                      {I18n.t('clear')}
                    </Text>
                  </TouchableOpacity>

                  <RoundButton2
                    height={ROUND_BUTTON_HEIGHT}
                    style={[
                      {
                        backgroundColor: theme.colors.primary,
                        alignSelf: 'stretch',
                        marginLeft: 80,
                      },
                    ]}
                    color={theme.colors.primary}
                    outlined={true}
                    labelStyle={[{ color: 'white', fontSize: 16 }]}
                    onPress={() => {
                      onConfirm({ ...currentSelect });
                    }}>
                    {I18n.t('apply')}
                  </RoundButton2>
                </View>
              </View>
              <View style={{ height: iosImeHeight }} />
            </Surface>
          </Animated.View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  model: {
    flex: 1,
    shadowOpacity: 0,
  },
  blank: {
    flex: 1,
  },
  content: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 24,
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingTop: 16,
    paddingBottom: 16,
  },
  footerButton: {
    flex: 1,
  },
  lowTitle: {
    fontSize: 12,
    color: Theme.colors.text,
    opacity: 0.4,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 16,
  },
  menuText: {
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: LIST_ICON_SIMPLE_SIZE,
    marginLeft: 16,
  },
  text: {
    fontSize: 12,
    color: Theme.colors.text,
    marginRight: 10,
    textAlign: 'center',
    flexShrink: 1,
  },
  action: {
    paddingVertical: 2,
    borderRadius: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
});
export default withTheme(MultiSelectBottomActionMenu);
