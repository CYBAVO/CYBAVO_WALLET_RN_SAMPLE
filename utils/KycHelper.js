import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import { Auth } from '@cybavo/react-native-wallet-service';
import { SERVICE_EMAIL, SERVICE_EMAIL_KYC } from '../Constants';
import { FileLogger } from 'react-native-file-logger';
import I18n, { Country, getLanguage, LanguageIndexMap } from '../i18n/i18n';
import { alpha2ToAlpha3 } from './i18niso';
import { updateKycUserExist } from '../store/actions';
import { TYPE_FAIL } from '../components/ResultModal';
import { toast } from '../Helpers';

export const KycHelper = {
  getLanguageAndStartKyc(
    kycUserExist = false,
    setLoading = loading => {},
    dispatch,
    setResult = result => {},
    setLanguageIndex = index => {}
  ) {
    setLoading(true);
    getLanguage()
      .then(lan => {
        if (!lan) {
          lan = 'en';
        }
        setLanguageIndex(LanguageIndexMap[lan]);
        this.startKyc(
          LanguageIndexMap[lan],
          kycUserExist,
          setLoading,
          dispatch,
          setResult
        );
      })
      .catch(error => {
        this.startKyc(
          LanguageIndexMap.en,
          kycUserExist,
          setLoading,
          dispatch,
          setResult
        );
      });
  },
  startKyc(
    languageIndexParam = 0,
    kycUserExist = false,
    setLoading = loading => {},
    dispatch,
    setResult = result => {}
  ) {
    setLoading(true);
    if (kycUserExist) {
      FileLogger.debug('>>EEE_kycUserExist_getKycAccessToken');
      console.log('EEE_kycUserExist_getKycAccessToken');
      this.getKycAccessToken(
        true,
        languageIndexParam,
        setLoading,
        dispatch,
        setResult
      );
      return;
    }
    let a3 = alpha2ToAlpha3(Country, 'TWN');
    FileLogger.debug(`>>createKyc: ${Country}, ${a3}`);
    Auth.createKyc(a3)
      .then(r => {
        dispatch(updateKycUserExist(true));
        FileLogger.debug('>>EEE_createKyc_getKycAccessToken');
        console.log('EEE_createKyc_getKycAccessToken');
        this.getKycAccessToken(
          false,
          languageIndexParam,
          setLoading,
          dispatch,
          setResult
        );
      })
      .catch(error => {
        dispatch(updateKycUserExist(true));
        FileLogger.debug('>>EEE_createKycFailed_getKycAccessToken');
        console.log('EEE_createKycFailed_getKycAccessToken');
        this.getKycAccessToken(
          true,
          languageIndexParam,
          setLoading,
          dispatch,
          setResult
        );
      });
  },
  getKycAccessToken(
    createKycFail,
    languageIndexParam,
    setLoading = loading => {},
    dispatch,
    setResult = result => {}
  ) {
    Auth.getKycAccessToken()
      .then(r => {
        console.log(`getKycAccessToken:${r.apiUrl}, ${r.token} ${r.flowName}`);
        let localArr = ['en', 'zh-tw', 'zh'];
        this.launchSNSMobileSDK(
          r.apiUrl,
          r.token,
          r.flowName,
          log => {},
          localArr[languageIndexParam]
        );
        setLoading(false);
      })
      .catch(error => {
        if (createKycFail) {
          FileLogger.debug('>>EEE_getKycAccessTokenFailed_resetKycUserExist');
          console.log('EEE_getKycAccessTokenFailed_resetKycUserExist');
          dispatch(updateKycUserExist(false));
        }
        FileLogger.debug(`>>_startKyc failed: ${error.message}`);
        console.log('_startKyc failed', error);
        setResult({
          type: TYPE_FAIL,
          error: I18n.t(`error_msg_${error.code}`, {
            defaultValue: error.message,
          }),
          title: I18n.t('error_msg_703'),
          buttonClick: () => {
            setResult(null);
          },
        });
        setLoading(false);
      });
  },
  launchSNSMobileSDK(
    apiUrl,
    accessToken,
    flowName,
    onLog = v => {},
    local = 'en'
  ) {
    FileLogger.debug(
      `>> launchSNSMobileSDK_apiUrl: ${apiUrl}, accessToken: ${accessToken}, flowName: ${flowName}, local: ${local}`
    );
    let snsMobileSDK = SNSMobileSDK.init(accessToken, () => {
      // this is a token expiration handler, will be called if the provided token is invalid or got expired
      // call your backend to fetch a new access token (this is just an example)
      FileLogger.debug('>>>expiration');
      return Auth.getKycAccessToken().then(r => {
        // return a fresh token from here
        FileLogger.debug(`>>>>getKycAccessToken: ${r.token}`);
        return r.token;
      });
    })
      .withHandlers({
        // Optional callbacks you can use to get notified of the corresponding events
        onStatusChanged: event => {
          let log = `onStatusChanged: [${event.prevStatus}] => [${event.newStatus}]`;
          FileLogger.debug(log);
          console.log(log);
        },
        onLog: event => {
          let log = `onLog: [Idensic] ${event.message}`;
          FileLogger.debug(log);
          console.log(log);
          onLog(log);
        },
      })
      .withDebug(true)
      .withLocale(local)
      .withSupportEmail(SERVICE_EMAIL_KYC)
      .build();

    snsMobileSDK
      .launch()
      .then(result => {
        let log = `SumSub SDK State: ${JSON.stringify(result)}`;
        FileLogger.debug(log);
        console.log(log);
      })
      .catch(err => {
        let errStr = err
          ? err.message
            ? '\n' + err.message
            : '\n' + JSON.stringify(err)
          : '';
        let log = `SumSub SDK Error: ${errStr}`;
        toast(`${I18n.t('start_kyc_failed_hint')}${errStr}`);
        FileLogger.debug(log);
        console.log(log);
        onLog(log);
        if (snsMobileSDK) {
          snsMobileSDK.cleanup();
        }
      });
    return snsMobileSDK;
  },
};
