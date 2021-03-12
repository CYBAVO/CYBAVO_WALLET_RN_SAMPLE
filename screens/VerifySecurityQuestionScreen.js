import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Container, Content } from 'native-base';
const { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { ROUND_BUTTON_HEIGHT } from '../Constants';
import { Auth } from '@cybavo/react-native-wallet-service';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import SecurityQuestionPicker from '../components/SecurityQuestionPicker';
import InputPinCodeModal from './InputPinCodeModal';
import {
  TextInput,
  withTheme,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import RoundButton2 from '../components/RoundButton2';
import { focusInput, focusNext, hasValue } from '../Helpers';
import CompoundTextInput from '../components/CompoundTextInput';
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
const VerifySecurityQuestionScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const [loading, setLoading] = useState(false);
  const questions = useNavigationParam('questions');
  const [answers, setAnswers] = useState(['', '', '']);
  const [inputPinCode, setInputPinCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');
  const [answersError, setAnswersError] = useState([null, null, null]);
  const [result, setResult] = useState(null);
  const refs = [useRef(), useRef(), useRef()];

  useEffect(() => {
    focusInput(refs, 0);
  }, []);

  const _inputAnswer = (index, answer) => {
    setAnswers(answers.map((ans, i) => (i === index ? answer : ans)));
    if (answersError[index]) {
      _checkAnswer(index, answer);
    }
  };

  const _checkAnswer = (index, answer) => {
    let newArr = [...answersError];
    if (hasValue(answer)) {
      newArr[index] = null;
      setAnswersError(newArr);
      return true;
    } else {
      newArr[index] = I18n.t('error_input_empty', { label: I18n.t('answer') });
      setAnswersError(newArr);
      return false;
    }
  };
  const _checkAnswerAll = () => {
    let result = true;
    setAnswersError(
      answersError.map((err, i) => {
        // if (i === index) {
        if (hasValue(answers[i])) {
          return null;
        } else {
          result = false;
          return I18n.t('error_input_empty', { label: I18n.t('answer') });
        }
        // }
      })
    );
    return result;
  };
  const _restorePinCode = async pinSecret => {
    setLoading(true);
    try {
      await Auth.restorePinCode(
        pinSecret,
        {
          question: questions[0],
          answer: answers[0],
        },
        {
          question: questions[1],
          answer: answers[1],
        },
        {
          question: questions[2],
          answer: answers[2],
        }
      );
      setInputPinCode(false);
      setResult({
        type: TYPE_SUCCESS,
        title: I18n.t('restored_successfully'),
        message: I18n.t('restored_pin_success_desc'),
        buttonClick: () => {
          setResult(null);
          goBack();
        },
      });
    } catch (error) {
      console.log('_changePinCode failed', error);
      // setPinErrorMsg(error.message);
      setResult({
        type: TYPE_FAIL,
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
        title: I18n.t('restored_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    setLoading(false);
  };

  const _submit = () => {
    setErrorMsg('');
    let result = _checkAnswerAll();
    if (!result) {
      return false;
    }
    _verifyRestoreQuestions();
  };
  const _verifyRestoreQuestions = async () => {
    setLoading(true);
    try {
      await Auth.verifyRestoreQuestions(
        {
          question: questions[0],
          answer: answers[0],
        },
        {
          question: questions[1],
          answer: answers[1],
        },
        {
          question: questions[2],
          answer: answers[2],
        }
      );
      _goRestorePinCode(questions, answers);
    } catch (error) {
      console.log('_fetchSecurityQuestions failed', error);
      setErrorMsg(
        error.code ? I18n.t(`error_msg_${error.code}`) : error.message
      );
    }
    setLoading(false);
  };
  const _goRestorePinCode = () => {
    setInputPinCode(true);
  };
  const _goForgotPinCode = () => {
    navigate('ForgotPinCode');
  };
  return (
    <>
      <Container
        style={[Styles.bottomContainer, { justifyContent: 'space-between' }]}>
        <Headerbar
          transparent
          title={I18n.t('forgot_pin_code_title')}
          onBack={() => goBack()}
        />
        <ScrollView keyboardShouldPersistTap="handle">
          <View style={styles.contentContainer}>
            <Text style={Styles.secLabelInputDesc}>
              {I18n.t('setup_security_questions_desc')}
            </Text>
            {[0, 1, 2].map(i => (
              <React.Fragment key={i}>
                <SecurityQuestionPicker
                  rawData={questions}
                  initSelected={questions[i]}
                  clickItem={q => {}}
                  badgeText={i + 1}
                  width={width}
                  pickable={false}
                  getMainText={item => I18n.t(item)}
                />
                <CompoundTextInput
                  ref={refs[i]}
                  onSubmitEditing={
                    i == 2
                      ? null
                      : () => {
                          focusNext(refs, i);
                        }
                  }
                  style={Styles.compoundInput}
                  value={answers[i]}
                  onClear={() => {
                    _inputAnswer(i, '');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  underlineColor={Theme.colors.normalUnderline}
                  hasError={hasValue(answersError[i])}
                  onChangeText={a => _inputAnswer(i, a)}
                  // onBlur={() => _checkAnswerAll()}
                  errorMsg={answersError[i]}
                  placeholder={I18n.t('your_answer_hint')}
                />
              </React.Fragment>
            ))}

            {errorMsg != '' && (
              <Text
                uppercase={false}
                style={[Styles.bottomErrorMsg, { marginTop: 16 }]}>
                {errorMsg}
              </Text>
            )}
          </View>
        </ScrollView>
        <View>
          <TouchableOpacity
            style={{
              // marginTop: 16,
              // flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => navigate('ForgotPinCode')}>
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 16,
              }}>
              {I18n.t('i_dont_remember_my_answers')}
            </Text>
          </TouchableOpacity>
          <RoundButton2
            height={ROUND_BUTTON_HEIGHT}
            style={Styles.bottomButton}
            labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
            onPress={_submit}>
            {I18n.t('submit')}
          </RoundButton2>
        </View>
      </Container>

      <InputPinCodeModal
        isVisible={!!inputPinCode}
        onCancel={() => setInputPinCode(false)}
        loading={loading}
        onInputPinCode={_restorePinCode}
        title={I18n.t('set_pin_code')}
        message1={I18n.t('enter_a_new_pin_code')}
        errorMsg={pinErrorMsg}
      />

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
          message={result.message}
          errorMsg={result.error}
          type={result.type}
          onButtonClick={result.buttonClick}
        />
      )}
    </>
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
    padding: 10,
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
  image: {
    width: 36,
    height: 36,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 0, // need to make a distance from bottom, to fix abnormal move while focus next TextInput on iOS
  },
});

export default withTheme(VerifySecurityQuestionScreen);
