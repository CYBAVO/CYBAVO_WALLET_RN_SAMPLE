// import { PushNotification } from '@cybavo/react-native-auth-service';
import RNPushNotification from 'react-native-push-notification';
import iid from '@react-native-firebase/iid';
import messaging from '@react-native-firebase/messaging';
import { Toast } from 'native-base';
import { store } from './store';
import { fetchTransaction, onReceivePush } from './store/actions';
import { FileLogger } from 'react-native-file-logger';
let initPush;
export async function initPushNotification() {
  if (!initPush) {
    initPush = new Promise((resolve, reject) => {
      console.log('+PushNotification.configure...');
      messaging()
        .requestPermission()
        .then(authorizationStatus => {
          console.log('Permission settings:', authorizationStatus);
        });
      messaging().onMessage(remoteMessage => {
        store.dispatch(onReceivePush(remoteMessage, true));
        if (!remoteMessage) {
          FileLogger.debug('onMessage: empty');
          Toast.show({
            text: 'onMessage: is null',
            type: 'warning',
            duration: 3000,
          });
          console.log('2Notification is null:');
          return;
        } else {
          FileLogger.debug(`onMessage:${JSON.stringify(remoteMessage)}`);
        }
        console.log('2Notification caused app to open from background state:');
      });
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        if (remoteMessage) {
          FileLogger.debug(`onMessage_bg:${JSON.stringify(remoteMessage)}`);
        } else {
          FileLogger.debug('onMessage_bg: empty');
        }
        console.log('Message handled in the background!', remoteMessage);
        store.dispatch(onReceivePush(remoteMessage, false));
      });
      iid()
        .getToken()
        .then(token => {
          resolve(token);
        });
    });
  }
  return initPush;
}
export function showLocalPush(title, body, devices) {
  FileLogger.debug(`onMessage_showLocalPush:${title} | ${body}`);
  RNPushNotification.localNotification({
    title,
    message: body,
    smallIcon: 'ic_notification', // R.mipmap.ic_notification
    largeIcon: 'ic_launcher', // R.mipmap.ic_launcher
  });
}
