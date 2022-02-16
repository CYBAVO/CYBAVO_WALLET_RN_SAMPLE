// import { PushNotification } from '@cybavo/react-native-auth-service';
import RNPushNotification from 'react-native-push-notification';
import iid from '@react-native-firebase/iid';
import messaging from '@react-native-firebase/messaging';
import { Toast } from 'native-base';
import { store } from './store';
import { fetchTransaction, onReceivePush } from './store/actions';
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
          Toast.show({
            text: 'onMessage: is null',
            type: 'warning',
            duration: 3000,
          });
          console.log('2Notification is null:');
          return;
        }
        console.log('2Notification caused app to open from background state:');
      });
      messaging().setBackgroundMessageHandler(async remoteMessage => {
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
  RNPushNotification.localNotification({
    title,
    message: body,
    smallIcon: 'ic_notification', // R.mipmap.ic_notification
    largeIcon: 'ic_launcher', // R.mipmap.ic_launcher
  });
}
