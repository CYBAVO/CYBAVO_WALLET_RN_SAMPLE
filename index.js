import { AppRegistry } from 'react-native';
import AppWrapper from './AppWrapper';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';
import './PushNotification';

AppRegistry.registerComponent(appName, () => AppWrapper);
