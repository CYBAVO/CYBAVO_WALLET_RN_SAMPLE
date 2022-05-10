import React from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { Icon } from 'native-base';
import AssetScreen from './screens/AssetScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddAssetScreen from './screens/AddAssetScreen';
import ScanScreen from './screens/ScanScreen';
import WalletDetailScreen from './screens/WalletDetailScreen';
import InitializeScreen from './screens/InitializeScreen';
import SignInScreen from './screens/SignInScreen';
import { Theme } from './styles/MainTheme';
import TransactionDetailScreen from './screens/TransactionDetailScreen';
import WithdrawScreen from './screens/WithdrawScreen';
import SetupSecurityQuestionScreen from './screens/SetupSecurityQuestionScreen';
import VerifySecurityQuestionScreen from './screens/VerifySecurityQuestionScreen';
import ForgotPinCodeScreen from './screens/ForgotPinCodeScreen';
import { Image, View } from 'react-native';
import DepositScreen from './screens/DepositScreen';
import EosResourceScreen from './screens/EosResourceScreen';
import SetupPinScreen from './screens/SetupPinScreen';
import { checkCameraPermission } from './Helpers';
import LoadingScreen from './screens/LoadingScreen';
import NavigationService from './NavigationService';
import RequestScreen from './screens/RequestScreen';
import ConnectingScreen from './screens/ConnectingScreen';
import ConnectionListScreen from './screens/ConnectionListScreen';
import ApiHistoryDetailScreen from './screens/ApiHistoryDetailScreen';
import I18n from 'react-native-i18n';
import SetLocaleScreen from './screens/SetLocaleScreen';
import VerifyOtpScreen from './screens/VerifyOtpScreen';
import EnterPhoneScreen from './screens/EnterPhoneScreen';
import SelectCountryScreen from './screens/SelectCountryScreen';
import RegisterSuccessScreen from './screens/RegisterSuccessScreen';
import SetBioScreen from './screens/SetBioScreen';
import InputPinSmsScreen from './screens/InputPinSmsScreen';
import AddContractCurrencyScreen from './screens/AddContractCurrencyScreen';
import WalletNftDetailScreen from './screens/WalletNftDetailScreen';
import WarningScreen from './screens/WarningScreen';
import GlobalModalScreen from './screens/GlobalModalScreen';
import KycTestScreen from './screens/KycTestScreen';

const MainTab = createBottomTabNavigator(
  {
    Assets: {
      screen: AssetScreen,
      navigationOptions: ({ navigation }) => ({
        tabBarLabel: I18n.t('assets'),
        tabBarIcon: ({ focused, horizontal, tintColor }) => (
          <Image
            source={
              focused
                ? require('./assets/image/ic_tab_asset_activated.png')
                : require('./assets/image/ic_tab_asset.png')
            }
            // style={{ tintColor: tintColor }}
          />
        ),
      }),
    },
    Scan: {
      screen: () => null,
      navigationOptions: ({ navigation }) => ({
        tabBarLabel: () => null,
        tabBarIcon: ({ focused, horizontal, tintColor }) => (
          <View
            style={{
              width: 48,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 5,
            }}>
            <Image
              source={require('./assets/image/ic_tab_scan.png')}
              style={{ tintColor: tintColor, width: 40, height: 40 }}
            />
          </View>
        ),
        tabBarOnPress: async ({ defaultHandler }) => {
          if (await checkCameraPermission()) {
            NavigationService.navigate('scanModal', { modal: true });
          }
        },
        tabBarOnLongPress: async ({ defaultHandler }) => {
          // for Android, tabBarOnLongPress will be called first, if only override tabBarOnPress, only work on iOS
          if (await checkCameraPermission()) {
            NavigationService.navigate('scanModal', { modal: true });
          }
        },
      }),
    },
    Settings: {
      screen: SettingsScreen,
      navigationOptions: ({ navigation }) => ({
        tabBarLabel: I18n.t('settings'),
        tabBarIcon: ({ focused, horizontal, tintColor }) => (
          <Image
            source={
              focused
                ? require('./assets/image/ic_tab_setting_activated.png')
                : require('./assets/image/ic_tab_setting.png')
            }
            // style={{ tintColor: tintColor }}
          />
        ),
      }),
    },
  },
  {
    tabBarOptions: {
      activeTintColor: Theme.colors.primary,
      inactiveTintColor: Theme.colors.text,
      style: {
        backgroundColor: Theme.colors.background,
        borderTopWidth: 0,
        paddingVertical: 6,
        height: 56,
      },
    },
  }
);
const MainScanStack = createStackNavigator(
  {
    Home: { screen: MainTab },
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      header: null,
    },
  }
);
const AuthStack = createStackNavigator(
  { SignIn: SignInScreen },
  {
    defaultNavigationOptions: {
      header: null,
    },
  }
);
const MainStack = createStackNavigator(
  {
    MainScanStack: MainScanStack,
    AddAsset: AddAssetScreen,
    AddContractCurrency: AddContractCurrencyScreen,
    WalletDetail: WalletDetailScreen,
    WalletNftDetail: WalletNftDetailScreen,
    TransactionDetail: TransactionDetailScreen,
    Scan2: ScanScreen,
    Withdraw: WithdrawScreen,
    EosResource: EosResourceScreen,
    Deposit: DepositScreen,
    SetupSecurityQuestion: SetupSecurityQuestionScreen,
    VerifySecurityQuestion: VerifySecurityQuestionScreen,
    ForgotPinCode: ForgotPinCodeScreen,
    SetLocale: SetLocaleScreen,
    KycTest: KycTestScreen,
    ConnectionList: { screen: ConnectionListScreen },
    ApiHistoryDetail: { screen: ApiHistoryDetailScreen },
    SetBio: SetBioScreen,
  },
  {
    defaultNavigationOptions: {
      header: null,
    },
  }
);

const LoadingStack = createStackNavigator(
  {
    Top: { screen: MainStack },
    Loading: { screen: LoadingScreen },
    GlobalModal: { screen: GlobalModalScreen },
    scanModal: { screen: ScanScreen },
    Connecting: { screen: ConnectingScreen },
    Request: { screen: RequestScreen },
    // CurrencyPick: { screen: CurrencyPickScreen },
    InputPinSms: { screen: InputPinSmsScreen },
    Warning: { screen: WarningScreen },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    transparentCard: true,
    cardStyle: {
      backgroundColor: 'transparent',
      opacity: 1,
    },
    transitionConfig: () => ({
      containerStyle: {
        backgroundColor: 'transparent',
      },
    }),
  }
);
export default createAppContainer(
  createSwitchNavigator(
    {
      Init: InitializeScreen,
      Main: LoadingStack,
      Auth: AuthStack,
      VerifyOtp: VerifyOtpScreen,
      RegisterSuccess: RegisterSuccessScreen,
      EnterPhone: EnterPhoneScreen,
      SelectCountry: SelectCountryScreen,
      SetupPin: SetupPinScreen,
      ScanOut: { screen: ScanScreen },
    },
    {
      initialRouteName: 'Init',
    }
  )
);
