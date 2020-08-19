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
import { CHECK_ICON, LIST_ICON_SIMPLE_SIZE } from '../Constants';
import { Button } from 'native-base';

const ARROW_ICON = require('../assets/image/ic_down_arrow.png');
const BottomActionMenu: () => React$Node = ({
  theme,
  visible,
  onClick,
  onCancel,
  data = [''],
  onChange,
  currentSelect = 0,
  containerStyle,
  scrollEnabled = false,
  title = I18n.t('filter'),
}) => {
  const [iosImeHeight, setiosImeHeight] = useState(0);

  const { height: screneHeight } = useDimensions().screen;
  const { onLayout, ...layout } = useLayout();
  const [translateY] = useState(
    new Animated.Value(layout.height || screneHeight)
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
        toValue: layout.height || screneHeight,
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
    let isSelected = currentSelect == index;
    return (
      <Surface
        style={[
          Styles.listItem,
          {
            backgroundColor: theme.colors.background,
          },
        ]}>
        <TouchableRipple
          onPress={() => {
            onChange(index);
          }}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            borderColor: theme.colors.divider,
            borderBottomWidth: 1,
          }}>
          <>
            <Text style={styles.menuText}>{item}</Text>
            {isSelected && (
              <>
                <View style={styles.flex1} />
                <Image
                  source={CHECK_ICON}
                  style={{
                    height: LIST_ICON_SIMPLE_SIZE,
                    width: LIST_ICON_SIMPLE_SIZE,
                    marginRight: 5,
                  }}
                />
              </>
            )}
          </>
        </TouchableRipple>
      </Surface>
    );
  };
  const _keyExtractor = item => {
    return item;
  };
  return (
    <>
      <TouchableOpacity
        style={[
          Styles.tag,
          {
            backgroundColor: theme.colors.pickerBg,
            flex: 1,
          },
          containerStyle,
        ]}
        onPress={onClick}>
        <Text
          style={[styles.text, Theme.fonts.default.heavy]}
          numberOfLines={1}>
          {data[currentSelect]}
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
              <View style={[styles.footer, { height: 300 }]}>
                <Text style={styles.lowTitle}>{title}</Text>
                <FlatList
                  data={data}
                  renderItem={_renderItem}
                  keyExtractor={_keyExtractor}
                  scrollEnabled={scrollEnabled}
                />
                <Button
                  full
                  transparent
                  style={{ marginTop: 5, marginBottom: 36 }}
                  onPress={onCancel}>
                  <Text style={styles.menuText}>{I18n.t('cancel')}</Text>
                </Button>
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
export default withTheme(BottomActionMenu);
