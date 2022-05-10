import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import { Auth } from '@cybavo/react-native-wallet-service';
import { SERVICE_EMAIL } from '../Constants';
import { FileLogger } from 'react-native-file-logger';

export function launchSNSMobileSDK(
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
    .withSupportEmail(SERVICE_EMAIL)
    .build();

  snsMobileSDK
    .launch()
    .then(result => {
      let log = `SumSub SDK State: ${JSON.stringify(result)}`;
      FileLogger.debug(log);
      console.log(log);
    })
    .catch(err => {
      let log = `SumSub SDK Error: ${JSON.stringify(err)}`;
      FileLogger.debug(log);
      console.log(log);
      onLog(log);
    });
}
