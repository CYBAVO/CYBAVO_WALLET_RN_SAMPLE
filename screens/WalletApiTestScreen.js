import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SectionList,
  FlatList,
  Platform,
  Keyboard,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { Container, Content, Toast } from 'native-base';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { WalletSdk, Wallets } from '@cybavo/react-native-wallet-service';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n, {
  getLanguage,
  IndexLanguageMap,
  LanguageIndexMap,
  setLanguage,
} from '../i18n/i18n';
import { withTheme, Text, ActivityIndicator } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import ResultModal, {
  TYPE_CONFIRM,
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import {
  CHECK_ICON,
  Coin,
  FULL_WIDTH_WITH_PADDING,
  LIST_ICON_SIMPLE_SIZE,
  LOCALES,
  ROUND_BUTTON_FONT_SIZE,
  ROUND_BUTTON_HEIGHT,
  ROUND_BUTTON_ICON_SIZE,
} from '../Constants';
import RoundButton2 from '../components/RoundButton2';
import { signIn } from '../store/actions';
import {
  checkCameraPermission,
  explorer,
  isETHForkChain,
  sleep,
  toast,
  toastError,
} from '../Helpers';
import { KycHelper } from '../utils/KycHelper';
import CompoundTextInput from '../components/CompoundTextInput';
import NavigationService from '../NavigationService';
import InputMessageModal from '../components/InputMessageModal';
import BottomActionMenu from '../components/BottomActionMenu';
import { useClipboard } from '@react-native-community/hooks';
import CheckBox from '../components/CheckBox';
const WalletApiTestScreen: () => React$Node = ({ theme }) => {
  const w = useNavigationParam('wallet');
  const config = useSelector(state => {
    return state.auth.config;
  });
  const [_, setClipboard] = useClipboard();
  const [respStr, setRespStr] = useState('');
  const [showInputModal, setShowInputModal] = useState(false);
  const [result, setResult] = useState(null);
  const [box1Checked, setBox1Checked] = useState(false);
  const [extra, setExtra] = useState({});
  const [loading, setLoading] = useState(false);
  const [input1, setInput1] = useState('');
  const [option1, setOption1] = useState(0);
  const [option2, setOption2] = useState(0);
  const [option3, setOption3] = useState(0);
  const [showMenu1, setShowMenu1] = useState(false);
  const [showMenu2, setShowMenu2] = useState(false);
  const [showMenu3, setShowMenu3] = useState(false);
  const OPTION_1 = [I18n.t('pinsecret'), I18n.t('pincode')];
  const OPTION_2 = [I18n.t('normal'), I18n.t('sms'), I18n.t('bio')];
  const refs = [useRef()];
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const _goScan = async () => {
    if (await checkCameraPermission()) {
      NavigationService.navigate('scanModal', {
        onResult: value => {
          setInput1(value);
        },
        modal: true,
      });
    }
  };
  const _onPin = (pinSecret, extraParam) => {
    APIs[option3].func[option2](pinSecret, extraParam);
  };
  const _openUrl = () => {
    if (!respStr) {
      toast(I18n.t('no_result'));
      return;
    }
    explorer(w.currency, '', respStr, config);
    _copy();
  };
  const _copy = async () => {
    if (!respStr) {
      toast(I18n.t('no_result'));
      return;
    }
    setClipboard(respStr);
    toast(I18n.t('copied'));
  };
  const _commonSignRawTx = async pinSecret => {
    let theApi = APIs[option3].api[option2];
    refs[0].current.blur();
    setLoading(true);
    setRespStr('');
    try {
      let r = await theApi(w.walletId, input1, pinSecret);
      setRespStr(APIs[option3].getRes(r));
      toast(I18n.t('success'));
    } catch (error) {
      console.log(`${APIs[option3].name} failed`, error);
      setResult({
        type: TYPE_FAIL,
        error: _getErrMsg(error),
        title: I18n.t('sign_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const _commonSignRawTxSms = pinSecret => {
    let theApi = APIs[option3].api[option2];
    refs[0].current.blur();
    setLoading(true);
    setRespStr('');
    theApi('actionToken', 'code', w.walletId, input1, pinSecret)
      .then(r => {
        setRespStr(APIs[option3].getRes(r));
        toast(I18n.t('success'));
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        setRespStr('');
        console.log(`${APIs[option3].name} failed`, error);
        setResult({
          type: TYPE_FAIL,
          error: _getErrMsg(error),
          title: I18n.t('sign_failed'),
          buttonClick: () => {
            setResult(null);
          },
        });
      });
  };
  const _getErrMsg = error => {
    if (error.userInfo) {
      return `${error.code} | ${error.message} | ${error.userInfo.detailMessage}`;
    }
    return I18n.t(`error_msg_${error.code}`, {
      defaultValue: error.message,
    });
  };
  const _commonSignRawTxBio = async pinSecret => {
    let theApi = APIs[option3].api[option2];
    refs[0].current.blur();
    setLoading(true);
    setRespStr('');
    try {
      let r = await theApi(
        I18n.t('bio_prompt_for_template', APIs[option3]),
        I18n.t('cancel'),
        w.walletId,
        input1,
        pinSecret
      );
      setRespStr(APIs[option3].getRes(r));
      toast(I18n.t('success'));
    } catch (error) {
      setRespStr('');
      console.log(`${APIs[option3].name} failed`, error);
      setResult({
        type: TYPE_FAIL,
        error: _getErrMsg(error),
        title: I18n.t('sign_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const _signApiWithExtra = async (pinSecret, extraParam) => {
    let theApi = APIs[option3].api[option2];
    refs[0].current.blur();
    setLoading(true);
    setRespStr('');
    try {
      let r = await theApi(
        w.walletId,
        _getMessageToSign(input1),
        pinSecret,
        extraParam
      );
      setRespStr(APIs[option3].getRes(r));
      toast(I18n.t('success'));
    } catch (error) {
      console.log(`${APIs[option3].name} failed`, error);
      setResult({
        type: TYPE_FAIL,
        error: _getErrMsg(error),
        title: I18n.t('sign_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const _getMessageToSign = () => input1;
  const _isHex = str => {
    let reg = /[0-9A-Fa-f]{6}/g;
    return reg.test(str);
  };
  const _getSignMessageActionToken = () => {
    setLoading(true);
    Wallets.getSignMessageActionToken(_getMessageToSign())
      .then(r => {
        setExtra({
          confirmed_action_token: r.actionToken,
          legacy: box1Checked,
          is_hex: _isHex(_getMessageToSign()),
        });
        setLoading(false);
        _showPinDialog({
          confirmed_action_token: r.actionToken,
          legacy: box1Checked,
          is_hex: _isHex(_getMessageToSign()),
        });
      })
      .catch(error => {
        setLoading(false);
        setRespStr('');
        console.log(`${APIs[option3].name} failed`, error);
        setResult({
          type: TYPE_FAIL,
          error: _getErrMsg(error),
          title: I18n.t('sign_failed'),
          buttonClick: () => {
            setResult(null);
          },
        });
      });
  };
  const _signApiWithExtraSms = (pinSecret, extraParam) => {
    let theApi = APIs[option3].api[option2];
    refs[0].current.blur();
    setLoading(true);
    setRespStr('');
    theApi(
      'actionToken',
      'code',
      w.walletId,
      _getMessageToSign(input1),
      pinSecret,
      extraParam
    )
      .then(r => {
        setRespStr(APIs[option3].getRes(r));
        toast(I18n.t('success'));
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        setRespStr('');
        console.log(`${APIs[option3].name} failed`, error);
        setResult({
          type: TYPE_FAIL,
          error: _getErrMsg(error),
          title: I18n.t('sign_failed'),
          buttonClick: () => {
            setResult(null);
          },
        });
      });
  };
  const _signApiWithExtraBio = async (pinSecret, extraParam) => {
    let theApi = APIs[option3].api[option2];
    refs[0].current.blur();
    setLoading(true);
    setRespStr('');
    try {
      let r = await theApi(
        I18n.t('bio_prompt_for_template', APIs[option3]),
        I18n.t('cancel'),
        w.walletId,
        _getMessageToSign(input1),
        pinSecret,
        extraParam
      );
      setRespStr(APIs[option3].getRes(r));
      toast(I18n.t('success'));
    } catch (error) {
      setRespStr('');
      console.log(`${APIs[option3].name} failed`, error);
      setResult({
        type: TYPE_FAIL,
        error: _getErrMsg(error),
        title: I18n.t('sign_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };

  const _setSolTokenAccountTransaction = async pinSecret => {
    let theApi = APIs[option3].api[option2];
    setLoading(true);
    setRespStr('');
    try {
      let { txid } = await theApi(w.walletId, pinSecret);
      setRespStr(txid);
      toast(I18n.t('success'));
    } catch (error) {
      console.log('setSolTokenAccountTransaction failed', error);
      setResult({
        type: TYPE_FAIL,
        error: _getErrMsg(error),
        title: I18n.t('failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const _setSolTokenAccountTransactionSms = pinSecret => {
    let theApi = APIs[option3].api[option2];
    setLoading(true);
    setRespStr('');
    theApi('actionToken', 'code', w.walletId, pinSecret)
      .then(r => {
        setRespStr(r.txid);
        toast(I18n.t('success'));
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        setRespStr('');
        console.log('setSolTokenAccountTransactionSms failed', error);
        setResult({
          type: TYPE_FAIL,
          error: _getErrMsg(error),
          title: I18n.t('failed'),
          buttonClick: () => {
            setResult(null);
          },
        });
      });
  };
  const _setSolTokenAccountTransactionBio = async pinSecret => {
    let theApi = APIs[option3].api[option2];
    setLoading(true);
    setRespStr('');
    try {
      let { txid } = await theApi(
        I18n.t('bio_prompt_for_template', APIs[option3]),
        I18n.t('cancel'),
        w.walletId,
        pinSecret
      );
      setRespStr(txid);
      toast(I18n.t('success'));
      setLoading(false);
    } catch (error) {
      setRespStr('');
      console.log('setSolTokenAccountTransactionBio failed', error);
      setResult({
        type: TYPE_FAIL,
        error: _getErrMsg(error),
        title: I18n.t('failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };
  const APIsAll = [
    {
      name: 'setSolTokenAccountTransaction',
      isSupport: (currency, tokenAddress) =>
        Coin.SOL === currency && tokenAddress,
      input1Title: null,
      respTitle: I18n.t('txid'),
      func: [
        _setSolTokenAccountTransaction,
        _setSolTokenAccountTransactionSms,
        _setSolTokenAccountTransactionBio,
      ],
      api: [
        Wallets.setSolTokenAccountTransaction,
        Wallets.setSolTokenAccountTransactionSms,
        Wallets.setSolTokenAccountTransactionBio,
      ],
      onRespClick: _openUrl,
    },
    {
      name: 'commonSignRawTx',
      isSupport: (currency, tokenAddress) => true,
      defaultInput1:
        'AQABAwyCAr5VdHeUAnkE4QWRcZkydElFuRdJjv0XzCuGc3Eo3VPHPeJKnsEx3jg8sPNbrNsLwPUrvq5FqU37ggw3LcjkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGk8oryJXXMi816sdh6C8eNwRW4FymffGLrvEb0dgn4UAQICAAEMAgAAAKCGAQAAAAAA',
      input1Title: I18n.t('raw_tx'),
      input1PlaceHolder: I18n.t('raw_tx_placeholder'),
      respTitle: I18n.t('signed_tx'),
      func: [_commonSignRawTx, _commonSignRawTxSms, _commonSignRawTxBio],
      api: [
        Wallets.commonSignRawTx,
        Wallets.commonSignRawTxSms,
        Wallets.commonSignRawTxBio,
      ],
      getRes: r => r.signedTx,
      onRespClick: _copy,
    },
    {
      name: 'signRawTx',
      isSupport: (currency, tokenAddress) => true,
      input1Title: I18n.t('raw_tx'),
      input1PlaceHolder: I18n.t('raw_tx_placeholder'),
      respTitle: I18n.t('signed_tx'),
      func: [_commonSignRawTx, _commonSignRawTxSms, _commonSignRawTxBio],
      api: [Wallets.signRawTx, Wallets.signRawTxSms, Wallets.signRawTxBio],
      getRes: r => r.signedTx,
      onRespClick: _copy,
    },
    {
      name: 'signMessage',
      isSupport: (currency, tokenAddress) => Coin.SOL !== currency,
      getCheckbox1Title: (currency, tokenAddress) =>
        isETHForkChain(currency) ? I18n.t('legacy_sign_title') : null,
      defaultInput1:
        '0x1c6bf846872351d03529ca26e238efdf231d6f252a0e3baac6f0ef9807408b71',
      input1Title: I18n.t('message'),
      input1PlaceHolder: I18n.t('message_placeholder'),
      respTitle: I18n.t('signed_message'),
      func: [_signApiWithExtra, _signApiWithExtraSms, _signApiWithExtraBio],
      api: [
        Wallets.signMessage,
        Wallets.signMessageSms,
        Wallets.signMessageBio,
      ],
      getRes: r => r.signedMessage,
      onRespClick: _copy,
      onSubmitClick: option => {
        if (!option) {
          _showPinDialog({});
          return;
        }
        setResult({
          type: TYPE_CONFIRM,
          title: I18n.t('warning'),
          message: I18n.t('confirm_legacy_sign_message_desc'),
          buttonClick: () => {
            setResult(null);
            _getSignMessageActionToken();
          },
          secondaryConfig: {
            color: theme.colors.primary,
            text: I18n.t('cancel'),
            onClick: () => {
              setResult(null);
            },
          },
        });
      },
    },
    {
      name: 'signMessage',
      isSupport: (currency, tokenAddress) => Coin.SOL === currency,
      input1Title: I18n.t('message'),
      input1PlaceHolder: I18n.t('message_placeholder'),
      respTitle: I18n.t('signed_message'),
      func: [_signApiWithExtra, _signApiWithExtraSms, _signApiWithExtraBio],
      api: [
        Wallets.signMessage,
        Wallets.signMessageSms,
        Wallets.signMessageBio,
      ],
      getRes: r => r.signedMessage,
      onRespClick: _copy,
      onSubmitClick: () => {
        setResult({
          type: TYPE_CONFIRM,
          title: I18n.t('warning'),
          message: I18n.t('confirm_sol_sign_message_desc'),
          buttonClick: () => {
            setResult(null);
            _getSignMessageActionToken();
          },
          secondaryConfig: {
            color: theme.colors.primary,
            text: I18n.t('cancel'),
            onClick: () => {
              setResult(null);
            },
          },
        });
      },
    },
    {
      name: 'walletConnectSignMessage',
      isSupport: (currency, tokenAddress) => true,
      getCheckbox1Title: (currency, tokenAddress) =>
        isETHForkChain(currency) ? I18n.t('legacy_sign_title') : null,
      input1Title: I18n.t('message'),
      input1PlaceHolder: I18n.t('message_placeholder'),
      respTitle: I18n.t('signed_message'),
      func: [_signApiWithExtra, _signApiWithExtraSms, _signApiWithExtraBio],
      api: [
        Wallets.walletConnectSignMessage,
        Wallets.walletConnectSignMessageSms,
        Wallets.walletConnectSignMessageBio,
      ],
      getRes: r => r.signedMessage,
      onRespClick: _copy,
      onSubmitClick: option => {
        if (!option) {
          _showPinDialog({});
          return;
        }
        setResult({
          type: TYPE_CONFIRM,
          title: I18n.t('warning'),
          message: I18n.t('confirm_legacy_sign_message_desc'),
          buttonClick: () => {
            setResult(null);
            _getSignMessageActionToken();
          },
          secondaryConfig: {
            color: theme.colors.primary,
            text: I18n.t('cancel'),
            onClick: () => {
              setResult(null);
            },
          },
        });
      },
    },
    {
      name: 'walletConnectSignTypedData',
      isSupport: (currency, tokenAddress) => true,
      input1Title: 'Typed Data',
      input1PlaceHolder: I18n.t('message_placeholder'),
      respTitle: I18n.t('signed_tx'),
      func: [_commonSignRawTx, _commonSignRawTxSms, _commonSignRawTxBio],
      api: [
        Wallets.walletConnectSignTransaction,
        Wallets.walletConnectSignTypedDataSms,
        Wallets.walletConnectSignTypedDataBio,
      ],
      getRes: r => r.signedTx,
      onRespClick: _copy,
    },
  ];
  const APIs = APIsAll.filter(a => a.isSupport(w.currency, w.tokenAddress));
  const APIs1 =
    Coin.SOL === w.currency && w.tokenAddress
      ? APIsAll
      : APIsAll.slice(1, APIsAll.length);
  const _setInput1 = () => {
    let o3 = APIs[option3];
    if (o3.defaultInput1) {
      setInput1(o3.defaultInput1);
    }
  };
  const _setOption1 = index => {
    setOption1(index);
    setShowMenu1(false);
  };
  const _setOption2 = index => {
    setOption2(index);
    setShowMenu2(false);
  };
  const _setOption3 = index => {
    setOption3(index);
    setShowMenu3(false);
  };
  const _showPinDialog = extraParam => {
    switch (option1) {
      case 0: //PinSecret pass extra directly
        NavigationService.navigate('InputPinSms', {
          modal: true,
          from: 'WalletApiTest',
          isSms: false,
          callback: (pinSecret, type, actionToken, code) => {
            _onPin(pinSecret, extraParam);
          },
        });
        break;
      case 1: // PinCode use setExtra
        setExtra(extraParam);
        setShowInputModal(true);
        break;
    }
  };
  const _getCheckBox1Ui = () => {
    let o3 = APIs[option3];
    if (!o3.getCheckbox1Title || typeof o3.getCheckbox1Title !== 'function') {
      return;
    }
    let title = o3.getCheckbox1Title(w.currency, w.tokenAddress);
    if (!title) {
      return;
    }
    return (
      <>
        <CheckBox
          style={{ marginTop: 8 }}
          text={I18n.t('legacy_sign_title')}
          selected={box1Checked}
          onPress={() => {
            setBox1Checked(!box1Checked);
          }}
        />
      </>
    );
  };
  const _getInputUi = () => {
    let o3 = APIs[option3];
    if (o3.input1Title) {
      return (
        <>
          <TouchableOpacity
            style={{
              marginTop: 25,
              width: FULL_WIDTH_WITH_PADDING,
              flexDirection: 'column',
            }}
            onPress={_setInput1}>
            <Text
              style={{
                color: Theme.colors.text,
                fontSize: 14,
                opacity: 0.35,
              }}>
              {o3.input1Title}
            </Text>
          </TouchableOpacity>
          <CompoundTextInput
            ref={refs[0]}
            style={Styles.compoundInput}
            value={input1}
            autoCapitalize="none"
            underlineColor={Theme.colors.normalUnderline}
            hasError={false}
            onChangeText={v => setInput1(v)}
            placeholder={o3.input1PlaceHolder}
            onClear={() => {
              setInput1('');
            }}
            onRightIconClick={_goScan}
            onSubmitEditing={() => {
              refs[0].current.blur();
            }}
          />
        </>
      );
    }
  };

  return (
    <Container style={[Styles.container]}>
      <Headerbar
        transparent
        title={I18n.t('wallet_api_test_title')}
        onBack={() => goBack()}
      />

      <ScrollView
        style={{
          flexDirection: 'column',
          paddingHorizontal: 16,
          backgroundColor: theme.colors.background,
        }}>
        <Text style={Styles.labelBlock}>
          {'Info: WalletId | Currency | Name'}
        </Text>
        <Text
          style={[
            styles.value,
            { marginHorizontal: 0 },
          ]}>{`${w.walletId} | ${w.currency} | ${w.name}`}</Text>
        {_getInputUi()}
        {_getCheckBox1Ui()}
        <View style={Styles.filterContainer}>
          <BottomActionMenu
            visible={showMenu1}
            currentSelect={option1}
            title={I18n.t('api_variant')}
            data={OPTION_1}
            onClick={() => {
              setShowMenu1(true);
            }}
            onCancel={() => {
              setShowMenu1(false);
            }}
            onChange={_setOption1}
            containerStyle={{
              margin: 8,
              backgroundColor: theme.colors.filterBgColor,
            }}
          />
          <BottomActionMenu
            visible={showMenu2}
            currentSelect={option2}
            title={I18n.t('api_variant')}
            data={OPTION_2}
            onClick={() => {
              setShowMenu2(true);
            }}
            onCancel={() => {
              setShowMenu2(false);
            }}
            onChange={_setOption2}
            containerStyle={{
              margin: 8,
              backgroundColor: theme.colors.filterBgColor,
            }}
          />
        </View>
        <BottomActionMenu
          visible={showMenu3}
          currentSelect={option3}
          getValue={item => item.name}
          title={I18n.t('api_variant')}
          data={APIs}
          scrollEnabled={true}
          maxHeight={false}
          onClick={() => {
            setShowMenu3(true);
          }}
          onCancel={() => {
            setShowMenu3(false);
          }}
          onChange={_setOption3}
          containerStyle={{
            margin: 8,
            backgroundColor: theme.colors.filterBgColor,
          }}
        />
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[{ marginTop: 16, backgroundColor: theme.colors.primary }]}
          disabledStyle={{ backgroundColor: theme.colors.primaryDisabled }}
          disabled={loading}
          labelStyle={[
            { color: theme.colors.text, fontSize: ROUND_BUTTON_FONT_SIZE },
          ]}
          onPress={() => {
            Keyboard.dismiss();
            if (
              APIs[option3].onSubmitClick &&
              typeof APIs[option3].onSubmitClick === 'function'
            ) {
              APIs[option3].onSubmitClick(box1Checked);
            } else {
              _showPinDialog({});
            }
          }}>
          {I18n.t('submit')}
        </RoundButton2>

        <TouchableOpacity
          style={{
            marginTop: 25,
            width: FULL_WIDTH_WITH_PADDING,
            flexDirection: 'column',
          }}
          onPress={APIs[option3].onRespClick}>
          <Text
            style={{
              color: Theme.colors.text,
              fontSize: 14,
              opacity: 0.35,
            }}>
            {APIs[option3].respTitle}
          </Text>
        </TouchableOpacity>
        <Text style={styles.value}>{respStr}</Text>
      </ScrollView>
      {showInputModal && (
        <InputMessageModal
          title={I18n.t('input_pin')}
          visible={showInputModal}
          loading={false}
          maxLength={6}
          keyboardType={'number-pad'}
          value={''}
          onConfirm={pinCode => {
            _onPin(pinCode, extra);
            setShowInputModal(false);
          }}
          onCancel={() => {
            setShowInputModal(false);
          }}
        />
      )}
      {loading && (
        <ActivityIndicator
          color={theme.colors.primary}
          size="large"
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: height / 2,
          }}
        />
      )}
      {result && (
        <ResultModal
          visible={!!result}
          title={result.title}
          successButtonText={result.successButtonText}
          type={result.type}
          message={result.message}
          errorMsg={result.error}
          onButtonClick={result.buttonClick}
          secondaryConfig={result.secondaryConfig}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  listItem: {
    minHeight: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  listItemVertical: {
    minHeight: 60,
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
  },
  listItemHorizontal: {
    minHeight: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Theme.colors.divider,
    borderBottomWidth: 1,
    padding: 10,
    paddingRight: 0,
  },
  image: {
    width: 36,
    height: 36,
  },
  listContainer: {
    marginHorizontal: 16,
    flex: 1,
  },
  value: {
    fontSize: 16,
    marginHorizontal: 24,
    color: '#ffffff',
  },
});

export default withTheme(WalletApiTestScreen);
