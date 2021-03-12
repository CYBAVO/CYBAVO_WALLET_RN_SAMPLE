import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Container, Content } from 'native-base';
const { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { ROUND_BUTTON_HEIGHT } from '../Constants';
import { Auth, WalletSdk } from '@cybavo/react-native-wallet-service';
import { fetchUserState, signOut } from '../store/actions';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import I18n from '../i18n/i18n';
import SecurityQuestionPicker from '../components/SecurityQuestionPicker';
import InputPinCodeModal from './InputPinCodeModal';
import { TextInput, withTheme, Text } from 'react-native-paper';
import Headerbar from '../components/Headerbar';
import RoundButton2 from '../components/RoundButton2';
import ResultModal, {
  TYPE_FAIL,
  TYPE_SUCCESS,
} from '../components/ResultModal';
import { focusInput, focusNext, hasValue } from '../Helpers';
import CompoundTextInput from '../components/CompoundTextInput';
const QUESTIONS = [
  'What was your childhood nickname?',
  'What is the name of your favorite childhood friend?',
  'In what city or town did your mother and father meet?',
  'What is the middle name of your oldest child?',
  'What is your favorite team?',
  'What is your favorite movie?',
  'What was your favorite sport in high school?',
  'What was your favorite food as a child?',
  'What is the first name of the boy or girl that you first kissed?',
  'What was the make and model of your first car?',
  'What was the name of the hospital where you were born?',
  'Who is your childhood sports hero?',
  'What school did you attend for sixth grade?',
  'What was the last name of your third grade teacher?',
  'In what town was your first job?',
  'What was the name of the company where you had your first job?',
];
const SetupSecurityQuestionScreen: () => React$Node = ({ theme }) => {
  const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([
    QUESTIONS[0],
    QUESTIONS[1],
    QUESTIONS[2],
  ]);
  const refs = [useRef(), useRef(), useRef()];
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState(['', '', '']);
  const [answersError, setAnswersError] = useState([null, null, null]);
  const [inputPinCode, setInputPinCode] = useState(false);
  const fromRestorePin = useNavigationParam('fromRestorePin');

  useEffect(() => {
    focusInput(refs, 0);
  }, []);

  const _getAvailableQuestions = index => {
    const others = questions.filter((_, i) => i !== index);
    return QUESTIONS.filter(q => !others.includes(q));
  };
  const _setQuestion = (index, question) => {
    setQuestions(questions.map((q, i) => (i === index ? question : q)));
  };
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

  const _submit = () => {
    let result = _checkAnswerAll();
    if (!result) {
      return false;
    }
    _inputPinCode();
  };
  const _finishInputPinCode = () => {
    setInputPinCode(false);
  };
  const _inputPinCode = () => {
    setInputPinCode(true);
  };
  const _setupSecurityQuestions = async pinSecret => {
    setLoading(true);
    try {
      await Auth.setupBackupChallenge(
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
        title: I18n.t('setup_successfully'),
        message: I18n.t('setup_security_question_success_desc'),
        buttonClick: () => {
          setResult(null);
          navigate('Settings');
        },
      });
    } catch (error) {
      console.warn('_setupSecurityQuestions failed', error);
      setInputPinCode(false);
      setResult({
        type: TYPE_FAIL,
        error: error.code ? I18n.t(`error_msg_${error.code}`) : error.message,
        title: I18n.t('setup_failed'),
        buttonClick: () => {
          setResult(null);
        },
      });
    }
    await fetchUserState();
    setLoading(false);
  };
  const title = fromRestorePin
    ? I18n.t('forgot_pin_code_title')
    : I18n.t('setup_security_questions_up');
  return (
    <>
      <Container
        style={[Styles.bottomContainer, { justifyContent: 'space-between' }]}>
        <Headerbar
          transparent
          title={title}
          onBack={() => navigate('Settings')}
        />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.contentContainer}>
            <Text
              style={[Styles.secLabelInputDesc, Theme.fonts.default.regular]}>
              {I18n.t('setup_security_questions_desc')}
            </Text>
            {[0, 1, 2].map(i => (
              <React.Fragment key={i}>
                <SecurityQuestionPicker
                  rawData={_getAvailableQuestions(i)}
                  initSelected={questions[i]}
                  clickItem={q => _setQuestion(i, q)}
                  badgeText={i + 1}
                  width={width}
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
          </View>
        </ScrollView>
        <RoundButton2
          height={ROUND_BUTTON_HEIGHT}
          style={[Styles.bottomButton, { marginTop: 16 }]}
          labelStyle={[{ color: theme.colors.text, fontSize: 14 }]}
          disabled={loading}
          onPress={_submit}>
          {I18n.t('submit')}
        </RoundButton2>
      </Container>
      <InputPinCodeModal
        title={title}
        isVisible={!!inputPinCode}
        onCancel={() => setInputPinCode(false)}
        loading={loading}
        onInputPinCode={_setupSecurityQuestions}
      />
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

export default withTheme(SetupSecurityQuestionScreen);
