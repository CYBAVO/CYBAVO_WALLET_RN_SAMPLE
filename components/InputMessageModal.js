import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
const { height, width } = Dimensions.get('window');
import { TextInput, withTheme, Text, Modal, Portal } from 'react-native-paper';
import I18n from '../i18n/i18n';
import { Theme } from '../styles/MainTheme';
import RoundButton2 from './RoundButton2';
import { ROUND_BUTTON_HEIGHT } from '../Constants';

const InputMessageModal: () => React$Node = ({
  theme,
  title,
  value,
  onCancel,
  onConfirm,
  visible,
  loading,
}) => {
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(null);
  const ref = useRef();
  useEffect(() => {
    setMessage(value);
  }, [value]);

  useEffect(() => {
    setTimeout(() => {
      if (ref && ref.current) {
        ref.current.focus();
      }
    }, 10);
  }, []);
  return (
    <Portal>
      <Modal dismissable={false} visible={visible} transparent={true}>
        <View
          style={{
            height: height,
            width: width,
            justifyContent: 'center',
            backgroundColor: 'transparent', // Android need this
          }}
          onStartShouldSetResponder={() => {
            if (ref.current) {
              ref.current.blur(); // tap outside to dismiss keyboard
              return false;
            }
            return true;
          }}>
          <View
            style={[
              styles.container,
              { backgroundColor: theme.colors.surface, marginBottom: 40 }, // marginBottom for ios because keyboard will block button
            ]}>
            <Text
              style={{
                fontWeight: '600',
                fontSize: 20,
                color: '#000',
                marginBottom: 32,
              }}>
              {title}
            </Text>

            <TextInput
              ref={ref}
              value={message}
              onChangeText={setMessage}
              selectionColor={Theme.colors.primary}
              underlineColor={Theme.colors.primary}
              style={{
                backgroundColor: 'transparent',
                fontSize: 14,
                height: inputHeight,
                paddingVertical: 10, // space between underline and value
              }}
              onContentSizeChange={
                e => setInputHeight(e.nativeEvent.contentSize.height) // make height normal when text exceed a line
              }
              numberOfLines={1}
              theme={{
                colors: {
                  text: 'black',
                },
              }}
              returnKeyType="done"
              autoCapitalize="none"
            />
            <View
              style={{
                flexDirection: 'row',
                marginTop: 24,
                justifyContent: 'flex-end',
              }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    marginRight: 28,
                    height: ROUND_BUTTON_HEIGHT,
                    justifyContent: 'center',
                  },
                ]}
                onPress={onCancel}>
                <Text
                  style={[
                    Theme.fonts.default.medium,
                    {
                      color: theme.colors.primary,
                      fontSize: 16,
                    },
                  ]}>
                  {I18n.t('cancel')}
                </Text>
              </TouchableOpacity>
              <RoundButton2
                height={ROUND_BUTTON_HEIGHT}
                style={[
                  styles.button,
                  { backgroundColor: theme.colors.primary },
                ]}
                color={theme.colors.primary}
                outlined={true}
                labelStyle={[{ color: 'white', fontSize: 16 }]}
                onPress={() => {
                  onConfirm(message);
                }}>
                {I18n.t('ok')}
              </RoundButton2>
            </View>
            {loading && (
              <ActivityIndicator
                color={Theme.colors.primary}
                size="small"
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  right: 16,
                  top: 16,
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'space-between',
  },
  container: {
    alignSelf: 'center',
    justifyContent: 'space-between',
    width: '83%',
    padding: 16,
    borderRadius: 12,
  },
  button: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});
export default withTheme(InputMessageModal);
