import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Modal as RNModal,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import {
  withTheme,
  Modal,
  Text,
  ActivityIndicator,
  Portal,
} from 'react-native-paper';
import { ROUND_BUTTON_HEIGHT } from '../Constants';
import { Theme } from '../styles/MainTheme';
import RoundButton2 from './RoundButton2';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import { Container } from 'native-base';
import Headerbar from './Headerbar';
import { animateFadeInOut, hasValue } from '../Helpers';
import { useBackHandler } from '@react-native-community/hooks';

const ICON_SIZE = 48;
const PROGRESS_STROKE = 2;
const SHADOW_SCALE = 1.6;
export const TYPE_SUCCESS = 'success';
export const TYPE_CONFIRM = 'confirm';
export const TYPE_FAIL = 'fail';

const ResultModal: () => React$Node = ({
  visible = true,
  theme,
  title = '',
  message, // = 'Your PIN code has been restored successfully',
  detail,
  messageStyle = {},
  // detail = {
  //   amount: '100',
  //   currency: 'ETH',
  //   isFungible: false,
  //   from: '0x123345',
  //   to: '0x123987',
  //   time: '2020/07/28 14:04:53',
  // },
  errorMsg,
  size = ICON_SIZE,
  onButtonClick = () => {},
  secondaryConfig, // = { color: '', text: '', onClick},
  failButtonText = I18n.t('close'),
  successButtonText = I18n.t('done'),
  iconView,
  type = TYPE_SUCCESS,
  full = false,
}) => {
  useEffect(() => {
    if (visible && full) {
      StatusBar.setBackgroundColor(theme.colors.background);
    } else {
      setBackClick(0); //only full style cares about backClick
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    }
    return function cleanup() {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    };
  }, [visible, full]);
  //for react-native-paper Modal
  useBackHandler(() => {
    if (visible) {
      return true;
    }
    return false;
  });
  //for react-native Modal
  const [backClick, setBackClick] = useState(0);
  const [animOpacity] = useState(new Animated.Value(0));
  const _onBackHandle = () => {
    if (!visible || !full) {
      return false;
    }
    if (backClick < 1) {
      setBackClick(backClick + 1);
      animateFadeInOut(animOpacity, 500, () => setBackClick(0));
    } else {
      secondaryConfig.onClick();
    }
    return true;
  };
  const _getIconByStatus = () => {
    if (iconView) {
      return iconView;
    }
    if (type === TYPE_SUCCESS) {
      return (
        <Image
          source={require('../assets/image/ic_notify_successful.png')}
          style={Styles.resultModalIcon}
        />
      );
    } else {
      return (
        <Image
          source={require('../assets/image/ic_notify_failed.png')}
          style={Styles.resultModalIcon}
        />
      );
    }
  };
  const bgOvalSize = size * SHADOW_SCALE;
  const _getFullContentByStatus = () => {
    if (type === TYPE_CONFIRM && detail) {
      return (
        <React.Fragment>
          <ScrollView
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: theme.colors.background,
            }}>
            <Text style={[Styles.secLabel, Theme.fonts.default.regular]}>
              {detail.isFungible
                ? I18n.t('token_id')
                : I18n.t('transfer_amount')}
            </Text>
            {!hasValue(detail.exchangeAmount) ? (
              <View style={Styles.bottomBoarderContainer}>
                <Text
                  selectable
                  style={[Styles.secContent, Theme.fonts.default.regular]}>
                  {`${detail.amount}`}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  Styles.bottomBoarderContainer,
                  { flexDirection: 'column', alignItems: 'flex-start' },
                ]}>
                <Text selectable style={Styles.secContent}>
                  {`${detail.amount}  ${detail.currency}`}
                </Text>

                <Text
                  selectable
                  style={[
                    Styles.convertedNumText,
                    Theme.fonts.default.regular,
                    { marginTop: 5, fontSize: 12 },
                  ]}>
                  {`≈ ${detail.exchangeCurrency} \$${detail.exchangeAmount}`}
                </Text>
              </View>
            )}

            {detail.platformFee && (
              <Text style={Styles.secLabel}>{I18n.t('platform_fee')}</Text>
            )}
            {detail.platformFee && (
              <View
                style={[
                  Styles.bottomBoarderContainer,
                  { flexDirection: 'column', alignItems: 'flex-start' },
                ]}>
                <Text
                  selectable
                  style={[Styles.secContent, Theme.fonts.default.regular]}>
                  {detail.platformFee}
                </Text>
                <Text
                  selectable
                  style={[
                    Styles.convertedNumText,
                    Theme.fonts.default.regular,
                    { marginTop: 5, fontSize: 12 },
                  ]}>
                  {detail.exchangePlatformFee}
                </Text>
              </View>
            )}
            {detail.blockchainFee && (
              <Text style={Styles.secLabel}>{I18n.t('blockchain_fee')}</Text>
            )}
            {detail.blockchainFee && (
              <View
                style={[
                  Styles.bottomBoarderContainer,
                  { flexDirection: 'column', alignItems: 'flex-start' },
                ]}>
                <Text
                  selectable
                  style={[Styles.secContent, Theme.fonts.default.regular]}>
                  {detail.blockchainFee}
                </Text>
                <Text
                  selectable
                  style={[
                    Styles.convertedNumText,
                    Theme.fonts.default.regular,
                    { marginTop: 5, fontSize: 12 },
                  ]}>
                  {detail.exchangeBlockchainFee}
                </Text>
              </View>
            )}

            <Text style={Styles.secLabel}>{I18n.t('from')}</Text>
            <View style={Styles.bottomBoarderContainer}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {detail.from}
              </Text>
            </View>
            <Text style={Styles.secLabel}>{I18n.t('to')}</Text>
            <View style={Styles.bottomBoarderContainer}>
              <Text
                selectable
                style={[Styles.secContent, Theme.fonts.default.regular]}>
                {detail.to}
              </Text>
            </View>
            {hasValue(detail.description) && (
              <Text style={Styles.secLabel}>{I18n.t('description')}</Text>
            )}
            {hasValue(detail.description) && (
              <View style={Styles.bottomBoarderContainer}>
                <Text
                  selectable
                  style={[Styles.secContent, Theme.fonts.default.regular]}>
                  {detail.description}
                </Text>
              </View>
            )}
            {hasValue(detail.memo) && (
              <Text style={Styles.secLabel}>{I18n.t('memo')}</Text>
            )}
            {hasValue(detail.memo) && (
              <View style={Styles.bottomBoarderContainer}>
                <Text
                  selectable
                  style={[Styles.secContent, Theme.fonts.default.regular]}>
                  {detail.memo}
                </Text>
              </View>
            )}
          </ScrollView>
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={Styles.bottomButton}
            labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
            onPress={onButtonClick}>
            {type === TYPE_FAIL ? failButtonText : successButtonText}
          </RoundButton2>
        </React.Fragment>
      );
    }
    return <View />;
  };
  const _getContentByStatus = () => {
    let style1 = {};
    let style2 = styles.message;
    let detailTitle = [styles.detailTitle, Theme.fonts.default.heavyBold];
    switch (type) {
      case TYPE_SUCCESS:
        style1 = [
          Theme.fonts.default.heavy,
          styles.title,
          { color: theme.colors.success },
        ];
        break;
      case TYPE_CONFIRM:
        style1 = [
          Theme.fonts.default.heavy,
          styles.title,
          { color: theme.colors.gunmetal },
        ];
        break;
      default:
        style1 = [
          Theme.fonts.default.heavy,
          styles.title,
          { color: theme.colors.error },
        ];
        break;
    }

    return (
      <>
        <Text style={style1}>{title}</Text>
        {errorMsg && (
          <Text
            style={{
              backgroundColor: theme.colors.errorBg,
              color: theme.colors.error,
              width: '100%',
              padding: 10,
              borderRadius: 6,
              overflow: 'hidden',
            }}>
            {errorMsg}
          </Text>
        )}

        {detail && (
          <ScrollView style={{ height: height * 0.3, width: '100%' }}>
            <Text style={detailTitle}>
              {detail.isFungible
                ? I18n.t('token_id')
                : I18n.t('transfer_amount')}
            </Text>
            <Text style={styles.detailContent}>
              {detail.isFungible
                ? `${detail.amount}`
                : `${detail.amount} ${detail.currency}`}
            </Text>
            {detail.platformFee && (
              <Text style={detailTitle}>{I18n.t('platform_fee')}</Text>
            )}
            {detail.platformFee && (
              <Text style={styles.detailContent}>{detail.platformFee}</Text>
            )}
            {detail.blockchainFee && (
              <Text style={detailTitle}>{I18n.t('blockchain_fee')}</Text>
            )}
            {detail.blockchainFee && (
              <Text style={styles.detailContent}>{detail.blockchainFee}</Text>
            )}
            <Text style={detailTitle}>{I18n.t('from')}</Text>
            <Text style={styles.detailContent}>{detail.from}</Text>
            <Text style={detailTitle}>{I18n.t('to')}</Text>
            <Text style={styles.detailContent}>{detail.to}</Text>
            {hasValue(detail.memo) && (
              <Text style={detailTitle}>{I18n.t('memo')}</Text>
            )}
            {hasValue(detail.memo) && (
              <Text style={styles.detailContent}>{detail.memo}</Text>
            )}
            {hasValue(detail.description) && (
              <Text style={detailTitle}>{I18n.t('description')}</Text>
            )}
            {hasValue(detail.description) && (
              <Text style={styles.detailContent}>{detail.description}</Text>
            )}
            {detail.time && (
              <Text style={detailTitle}>{I18n.t('transfer_time')}</Text>
            )}
            {detail.time && (
              <Text style={styles.detailContent}>{detail.time}</Text>
            )}
          </ScrollView>
        )}
        {message && (
          <Text
            style={[style2, messageStyle]}
            numberOfLines={5}
            ellipsizeMode="tail">
            {message}
          </Text>
        )}
      </>
    );
  };
  return full ? (
    <RNModal
      visible={visible}
      transparent={true}
      style={Styles.container}
      onRequestClose={_onBackHandle}
      animationType={'none'}>
      <Container style={Styles.bottomContainer}>
        <Headerbar
          backIcon={require('../assets/image/ic_cancel.png')}
          transparent
          title={title}
          onBack={secondaryConfig.onClick}
          Parent={View}
        />
        {_getFullContentByStatus()}
        {backClick > 0 && (
          <Animated.View
            style={{
              opacity: animOpacity,
              backgroundColor: 'black',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: 2,
            }}>
            <Text
              style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 16 }}>
              {I18n.t('click_again_to_cancel')}
            </Text>
          </Animated.View>
        )}
      </Container>
    </RNModal>
  ) : (
    <Portal>
      <Modal
        dismissable={false}
        visible={visible}
        transparent={true}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.surface },
        ]}>
        {type !== TYPE_CONFIRM && (
          <View style={styles.iconContainer}>
            <ImageBackground
              source={require('../assets/image/bg_oval.png')}
              style={{
                width: bgOvalSize,
                height: bgOvalSize,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {_getIconByStatus()}
            </ImageBackground>
          </View>
        )}
        {_getContentByStatus()}
        {secondaryConfig && (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
              height: ROUND_BUTTON_HEIGHT,
              marginTop: 40,
              alignSelf: 'stretch',
            }}
            onPress={secondaryConfig.onClick}>
            <Text
              style={
                Platform.OS === 'ios'
                  ? [
                      //this style looks wired on Android
                      Theme.fonts.default.medium,
                      {
                        color: secondaryConfig.color,
                        fontSize: 16,
                        fontWeight: '700',
                      },
                    ]
                  : { color: secondaryConfig.color, fontSize: 14 }
              }>
              {secondaryConfig.text}
            </Text>
          </TouchableOpacity>
        )}
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.primary}
          outlined={true}
          labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
          onPress={onButtonClick}>
          {type === TYPE_FAIL ? failButtonText : successButtonText}
        </RoundButton2>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    width: '83%',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderRadius: 12,
    justifyContent: 'flex-start',
  },
  iconContainer: {
    // margin: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -30,
    // backgroundColor: 'red',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '900',
  },
  detailTitle: {
    // textAlign: 'center',
    fontSize: 12,
    color: Theme.colors.resultTitle,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  detailContent: {
    // textAlign: 'center',
    fontSize: 12,
    color: Theme.colors.resultContent,
    alignSelf: 'flex-start',
    marginTop: 0,
  },
  message: {
    fontSize: 12,
    marginVertical: 16,
    color: Theme.colors.resultContent,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});

export default withTheme(ResultModal);
