import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Modal as RNModal,
  StatusBar,
  Animated,
  Platform,
  Image,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { withTheme, Text } from 'react-native-paper';
import {
  Coin,
  ROUND_BUTTON_HEIGHT,
  sliderInnerWidth,
  sliderOuterWidth,
} from '../Constants';
import { Theme } from '../styles/MainTheme';
import RoundButton2 from './RoundButton2';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
import { Container } from 'native-base';
import Headerbar from './Headerbar';
import {
  animateFadeInOut,
  getAvailableBalance,
  getWalletKey,
  getWalletKeyByWallet,
  hasValue,
  isErc20,
} from '../Helpers';
import { useBackHandler } from '@react-native-community/hooks';
import DegreeSlider from './DegreeSlider';
import { BigNumber } from 'bignumber.js';
import DegreeSelecter from './DegreeSelecter';

export const TYPE_CANCEL = 'cancel';
export const TYPE_ACCELERATE = 'accelerate';
export const titleKeys = {
  [TYPE_CANCEL]: 'cancel_transaction_title',
  [TYPE_ACCELERATE]: 'accelerate_transaction_title',
};
const messageKeys = {
  [TYPE_CANCEL]: 'select_cancel_gas_fee_desc',
  [TYPE_ACCELERATE]: 'select_accelerate_gas_fee_desc',
};
const ReplaceTransactionModal: () => React$Node = ({
                                                     visible = true,
                                                     theme,
                                                     fee,
                                                     onButtonClick = () => {},
                                                     onCancel = () => {},
                                                     type = TYPE_CANCEL,
                                                     feeNote,
                                                     onSelectFee = select => {},
                                                   }) => {
  const feeUnit = 'ETH';
  const balanceItem = useSelector(state => {
    let balances = state.balance.balances || {};
    return balances[getWalletKeyByWallet(state.wallets.ethWallet)];
  });
  const [selectedFee, setSelectedFee] = useState('high');
  const [feeError, setFeeError] = useState(null);
  useEffect(() => {
    if (visible) {
      StatusBar.setBackgroundColor(theme.colors.background);
    } else {
      setBackClick(0); //only full style cares about backClick
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    }
    return function cleanup() {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    };
  }, [visible]);
  useEffect(() => {
    if (onSelectFee) {
      onSelectFee({ level: selectedFee, amount: fee[selectedFee].amount });
    }
  }, [selectedFee]);
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
    if (!visible) {
      return false;
    }
    if (backClick < 1) {
      setBackClick(backClick + 1);
      animateFadeInOut(animOpacity, 500, () => setBackClick(0));
    } else {
      onCancel();
    }
    return true;
  };
  const _getInitValue = () => {
    let last = 0;
    return last;
  };
  const _checkFee = selected => {
    if (fee[selected].lessThenMin) {
      setFeeError(`${I18n.t('error_replace_gas_too_little')}: ${fee.min}`);
      return;
    }
    let balance = getAvailableBalance(balanceItem);
    if (balance) {
      let balanceNum = Number(balance);
      let b = new BigNumber(balanceNum);
      let f = BigNumber(fee[selected].amountUi);
      if (b.isZero() || b.isLessThan(f)) {
        setFeeError(
            I18n.t('error_insufficient_template', {
              name: feeUnit,
              balance: b.toFixed(b.decimalPlaces()),
            })
        );
        return;
      }
    }
    setFeeError(null);
  };
  return (
      <RNModal
          visible={visible}
          transparent={true}
          style={Styles.container}
          onRequestClose={_onBackHandle}
          animationType={'none'}>
        <Container
            style={[Styles.bottomContainer, { justifyContent: 'space-between' }]}>
          <Headerbar
              backIcon={require('../assets/image/ic_cancel.png')}
              transparent
              title={I18n.t(titleKeys[type])}
              onBack={onCancel}
              Parent={View}
          />

          <ScrollView>
            <View
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: theme.colors.background,
                }}>
              <Text style={Styles.secLabel}>{I18n.t(messageKeys[type])}</Text>
              <DegreeSelecter
                  itemStyle={Styles.block}
                  valueObj={fee}
                  getValue={item => `${item.amountUi} ${feeUnit}${feeNote}`}
                  outerWidth={sliderOuterWidth[Platform.OS || 'android']}
                  innerWidth={sliderInnerWidth[Platform.OS || 'android']}
                  style={{
                    marginTop: 16,
                  }}
                  labels={[I18n.t('slow'), I18n.t('medium'), I18n.t('fast')]}
                  hasAlert={key => fee[key].lessThenMin}
                  initValue={_getInitValue()}
                  onSelect={value => {
                    setSelectedFee(value);
                    _checkFee(value);
                  }}
              />
            </View>
          </ScrollView>
          <>
            {type === TYPE_CANCEL && (
                <View style={Styles.infoBackground}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                        style={{ marginTop: 3 }}
                        source={require('../assets/image/ic_Info.png')}
                    />
                  </View>
                  <Text
                      style={[
                        styles.text,
                        Theme.fonts.default.regular,
                        {
                          textAlign: 'left',
                          marginLeft: 5,
                          marginBottom: 0,
                          marginTop: 8,
                        },
                      ]}>
                    {I18n.t('cancel_transaction_hint')}
                  </Text>
                </View>
            )}
            <RoundButton2
                height={ROUND_BUTTON_HEIGHT}
                style={[Styles.bottomButton]}
                disabled={feeError != null}
                labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
                onPress={() => {
                  onButtonClick(fee[selectedFee].amount);
                }}>
              {I18n.t('submit')}
            </RoundButton2>
          </>
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
  );
};

const styles = StyleSheet.create({
  roundButtonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  text: {
    width: '90%',
    color: Theme.colors.text,
    marginRight: 10,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -30,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '900',
  },
  detailTitle: {
    fontSize: 12,
    color: Theme.colors.resultTitle,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  detailContent: {
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

export default withTheme(ReplaceTransactionModal);
