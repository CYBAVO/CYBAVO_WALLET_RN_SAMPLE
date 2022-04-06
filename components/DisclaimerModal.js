import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Container } from 'native-base';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import IconSvgXml from './IconSvgXml';
import Headerbar from './Headerbar';
import { IconButton, Text, withTheme } from 'react-native-paper';
import {
  CHECK_ICON,
  LIST_ICON_SIMPLE_SIZE,
  ROUND_BUTTON_HEIGHT,
} from '../Constants';
import RoundButton2 from './RoundButton2';
import { TYPE_FAIL } from './ResultModal';
import CheckBox from './CheckBox';
const DisclaimerModal: () => React$Node = ({
  theme,
  visible,
  onConfirm = () => {},
  onCancel = () => {},
}) => {
  const [disableBt, setDisableBt] = useState(true);
  const [dontShow, setDontShow] = useState(false);
  const _onBackHandle = () => {
    onCancel();
    return true;
  };
  const _isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 36;
    let r =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    // console.log(`EEE!_:${r}|${layoutMeasurement.height + contentOffset.y}|${layoutMeasurement.height} + ${contentOffset.y} >=`);
    // console.log(`EEE!_:${contentSize.height - paddingToBottom}|${contentSize.height} - ${paddingToBottom}`);
    return r;
  };

  return (
    <View>
      <Modal
        visible={visible}
        transparent={true}
        style={Styles.container}
        animationType={'slide'}
        onRequestClose={_onBackHandle}>
        <Container style={[Styles.bottomContainer, { paddingHorizontal: 24 }]}>
          <IconButton
            borderless
            style={{ position: 'absolute', right: 24, top: 12 }}
            onPress={() => {
              onCancel();
            }}
            icon={({ size, color }) => (
              <Image source={require('../assets/image/ic_cancel.png')} />
            )}
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
          />
          <Text
            style={[
              {
                color: theme.colors.primary,
                fontSize: 24,
                marginTop: 46,
                marginBottom: 24,
              },
              Theme.fonts.default.heavyMax,
            ]}>
            {I18n.t('walletconnect_disclaimer_1')}
          </Text>
          <ScrollView
            onScroll={({ nativeEvent }) => {
              if (_isCloseToBottom(nativeEvent)) {
                setDisableBt(false);
              }
            }}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.body}>
                {I18n.t('walletconnect_disclaimer_2')}
              </Text>
              <Text style={[styles.body, { marginTop: 0 }]}>
                {I18n.t('walletconnect_disclaimer_3')}
              </Text>
            </View>
          </ScrollView>

          <CheckBox
            style={{ marginTop: 24, minHeight: 0, marginBottom: 24 }}
            text={I18n.t('do_not_show_this_again')}
            textStyle={{ fontWeight: 'bold', fontSize: 14 }}
            selected={dontShow}
            onPress={() => setDontShow(!dontShow)}
            checkImg={require('../assets/image/ic_check3.png')}
            uncheckImg={require('../assets/image/ic_uncheck3.png')}
          />
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            labelStyle={[{ color: theme.colors.text, fontSize: 16 }]}
            disabledStyle={{ backgroundColor: Theme.colors.primaryDisabled }}
            style={[
              Styles.bottomButton,
              {
                marginTop: 0,
              },
            ]}
            disabled={disableBt}
            onPress={() => {
              onConfirm(dontShow);
            }}>
            {I18n.t('i_understand')}
          </RoundButton2>
        </Container>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  modalContent: {
    flex: 0,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.disclaimer,
  },
});
export default withTheme(DisclaimerModal);
