# CYBAVO Wallet APP SDK for React Native - Sample

> Sample app for integrating Cybavo Wallet App SDK, <https://www.cybavo.com/wallet-app-sdk/>

## Institutional-grade security for your customers

Protect your customers' wallets with the same robust technology we use to protect the most important cryptocurrency exchanges. CYBAVO Wallet App SDK allows you to develop your own cryptocurrency wallet, backed by CYBAVO private key protection technology.

- Mobile SDK

    Use CYBAVO Wallet App SDK to easily develop secure wallets for your users without having to code any cryptography on your side. Our SDK allows you to perform the most common operations, such as creating a wallet, querying balances and executing cryptocurrency payments.

- Secure key management system

    Key management is the most critical part of cryptocurrency storage. CYBAVO Wallet App SDK makes our robust private key storage system available to all of your users. Our unique encryption scheme and a shared responsibility model offers top notch protection for your customer's keys.

- CYBAVO Security Cloud

    Cryptocurrency transactions performed by wallets developed with CYBAVO Wallet App SDK will be shielded by our Security Cloud, ensuring their integrity.

## Complete solution for cryptocurrency wallets

- Cost saving

    Leverage your in-house developing team and develop mobile cryptocurrency apps without compromising on security.

- Fast development

    Quickly and easily develop cryptocurrency applications using mobile native languages, without having to worry about cryptographic code.

- Full Node maintenance

    Leverage CYBAVO Wallet App SDK infrastructure and avoid maintaining a full node for your application.

---

# CYBAVO

A group of cybersecurity experts making crypto-currency wallets secure and usable for your daily business operation.

We provide VAULT, wallet, ledger service for cryptocurrency. Trusted by many exchanges and stable-coin ico teams, please feel free to contact us when your company or business needs any help in cryptocurrency operation.

# SDK Features

- Sign in / Sign up with 3rd-party account services
- Wallet Creation / Editing
- Wallet Deposit / Withdrawal
- Transaction History query
- PIN Code configuration: Setup / Change / Recovery
- Secure PIN code input view - NumericPinCodeInputView
- Push Notification - receive push notification of deposit / withdrawal
- Private chain, NFT and WalletConnect supported

# Run the demo app

1. Clone the source code from GitHub
2. Install the dependencies
   ```
   yarn install
   ```
3. Polyfill NodeJS modules for React-Native  
   ```
   yarn add rn-nodeify
   rn-nodeify --install --hack
   ```
4. Unmark `require('crypto')` in `shim.js`
5. Edit `BuildConfig.json` ➜ `MAIN_ENDPOINT` to point to your Wallet Service endpoint.  
    - Test environment:
        - On-Premises: set `MAIN_ENDPOINT` = https://mvault.sandbox.cybavo.com/v1/mw/
        - SaaS: set `MAIN_ENDPOINT` = https://mvault.sandbox.cybavo.com/v1/mw/
    - Production environment:
        - On-Premises: set `MAIN_ENDPOINT` = https://`<Your management portal URL>`/v1/mw/
        - SaaS: set `MAIN_ENDPOINT` = https://appvault.cybavo.com/v1/mw/ 
6. Edit `BuildConfig.json` ➜ `WC_PROJECT_ID` to your [WalletConnect Clout project ID](docs/wallet_connect_v2.md#prequest).  
## Android

1. Edit or create `android/local.properties` to config Maven repository URL / credentials provided by CYBAVO

   ```
   cybavo.maven.url=$MAVEN_REPO_URL
   cybavo.maven.username=$MAVEN_REPO_USRENAME
   cybavo.maven.password=$MAVEN_REPO_PASSWORD
   ```
2. Perform below command to fix build issues:
    ```
    cp patch/playStore.js node_modules/react-native-version-check/src/providers/playStore.js
    cp patch/FABGroup.txt node_modules/react-native-paper/src/components/FAB/FABGroup.tsx
    cp patch/default-encoding.js node_modules/parse-asn1/node_modules/pbkdf2/lib/default-encoding.js 
    cp patch/browser-base64.js node_modules/@ethersproject/base64/lib/browser-base64.js
    sed -i "" '/minSdkVersion/d' node_modules/react-native-i18n/android/src/main/AndroidManifest.xml
    ./appcenter-pre-build.sh
    sed -i "" 's/compileSdkVersion .*/compileSdkVersion 29/g' node_modules/react-native-twitter-signin/android/build.gradle
    sed -i "" 's/buildToolsVersion .*/buildToolsVersion "28.0.3"/g' node_modules/react-native-twitter-signin/android/build.gradle
    sed -i "" 's/minSdkVersion .*/minSdkVersion 19/g' node_modules/react-native-twitter-signin/android/build.gradle
    sed -i "" 's/targetSdkVersion .*/targetSdkVersion 29/g' node_modules/react-native-twitter-signin/android/build.gradle
    ```
3. Register your app on CYBAVO WALLET MANAGEMENT system web ➜ Administration ➜ System settings, input `package name` and `Signature keystore SHA1 fingerprint`, follow the instruction to retrieve an `API Code`.  
Please refer to "How to Create an Application" section in CYBAVO Wallet SDK Admin Panel User Manual
4. Edit `BuildConfig.json` ➜ `MAIN_API_CODE_ANDROID` to fill in your `API Code` 
5. Place your `google-services.json` file downloaded from Firebase to `android/app` [(LearnMore)](https://github.com/react-native-community/react-native-google-signin/blob/master/docs/get-config-file.md)
6. Edit `BuildConfig.json` ➜ `MY_GOOGLE_SIGN_IN_WEB_CLI_ID` to your `Google sign-in client ID`.  
Please refer to "Google Login - Setup with Firebase" section in CYBAVO Wallet SDK Admin Panel User Manual.
7. **_Skip this if not using Twitter sign-in_**  
Edit `BuildConfig.json` ➜ `MY_TWITTER_CONSUMER_KEY` to your `Twitter APP ID`.  
Edit `BuildConfig.json` ➜ `My_TWITTER_CONSUMER_SECRET` to your `Twitter consumer key`.  
Please refer to "Twitter Login Setup" section in CYBAVO Wallet SDK Admin Panel User Manual.
8. **_Skip this if not using Facebook sign-in_**  
Edit `android/app/src/main/res/values/strings.xml` ➜ `MY_FACEBOOK_APP_ID` to fill in your `Facebook app id`.  
Please refer to "Facebook Login Setup" section in CYBAVO Wallet SDK Admin Panel User Manual.
9. **_Skip this if not using Line sign-in_**  
Edit `android/app/src/main/res/values/strings.xml` ➜ `MY_LINE_CHANNEL_ID` to fill in your `LINE channel scheme`.  
Please refer to "Line Login Setup" section in CYBAVO Wallet SDK Admin Panel User Manual.  
    
> You can get more Single Sign-on (SSO) settings in CYBAVO Wallet SDK Admin Panel User Manual. 
## iOS
1. In ~/.ssh/ create a file called config with contents based on this:

    ```default
    Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/{{your private SSH key}}
    ```

    > How to setup an SSH key?  See [this](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

2. Perform below command to fix build issues:
    ```
    sed -i "" 's/s.dependency "TwitterKit", "~> 3.3"/s.dependency "TwitterKit5"/g' node_modules/react-native-twitter-signin/react-native-twitter-signin.podspec
    cp patch/RCTUIImageViewAnimated.m node_modules/react-native/Libraries/Image/RCTUIImageViewAnimated.m
    cp patch/FABGroup.txt node_modules/react-native-paper/src/components/FAB/FABGroup.tsx
    cp patch/scan_index.txt node_modules/react-native-qrcode-scanner/index.js
    cp patch/RCTCxxBridge.mm node_modules/react-native/React/CxxBridge/RCTCxxBridge.mm 
    cp patch/RCTTurboModuleManager.mm node_modules/react-native/ReactCommon/turbomodule/core/platform/ios/RCTTurboModuleManager.mm
    cp patch/default-encoding.js node_modules/parse-asn1/node_modules/pbkdf2/lib/default-encoding.js 
    cp patch/browser-base64.js node_modules/@ethersproject/base64/lib/browser-base64.js
    ```
2. Register your app on CYBAVO WALLET MANAGEMENT system web ➜ Administration ➜ System settings, input `bundle id`, follow the instruction to retrieve an `API Code`.  
Please refer to "Setup in iOS" section in CYBAVO Wallet SDK Admin Panel User Manual.
3. Edit `BuildConfig.json` ➜ `MAIN_API_CODE_IOS` to fill in your `API Code` 
4. Place your `GoogleService-Info.plist` file downloaded from Firebase to `ios/` [(LearnMore)](https://github.com/react-native-community/react-native-google-signin/blob/master/docs/get-config-file.md)
5. Edit `BuildConfig.json` ➜ `GOOGLE_SIGN_IN_WEB_CLI_ID` to your `Google sign-in client ID`.  
Please refer to "Google Login - Setup with Firebase" section in CYBAVO Wallet SDK Admin Panel User Manual.
6. Open your project configuration: double-click the project name in the left tree view. Select your app from the TARGETS section, then select the Info tab, and expand the URL Types section. Replace `Identifier` and `URL Schemes` with `CLIENT_ID` and `REVERSED_CLIENT_ID` in your `GoogleService-Info.plist`. [(LearnMore)](https://developers.google.com/identity/sign-in/ios/start-integrating)
7. Replace `MY_GOOGLE_SIGN_IN_WEB_CLI_ID` with your `Google sign-in client ID`.
8. **_Skip this if not using Twitter sign-in_**  
Edit `BuildConfig.json` ➜ `MY_TWITTER_CONSUMER_KEY` to your `Twitter APP ID`.  
Edit `BuildConfig.json` ➜ `My_TWITTER_CONSUMER_SECRET` to your `Twitter consumer key`.  
Please refer to "Twitter Login Setup" section in CYBAVO Wallet SDK Admin Panel User Manual.
8. **_Skip this if not using Facebook sign-in_**   
Replace `MY_FACEBOOK_APP_ID` with your `Facebook app id`.  
Please refer to "Facebook Login Setup" section in CYBAVO Wallet SDK Admin Panel User Manual.
9. **_Skip this if not using Line sign-in_**   
Replace `MY_LINE_CHANNEL_ID` with your `LINE channel scheme`.  
Please refer to "Line Login Setup" section in CYBAVO Wallet SDK Admin Panel User Manual.   
    
> You can get more Single Sign-on (SSO) settings in CYBAVO Wallet SDK Admin Panel User Manual. 

## Push notification
- If you want to provide push notification features, setup project to integrate [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) (FCM) service, refer to [official document](https://firebase.google.com/docs/cloud-messaging/android/client) for details.  
Please refer to "Google Firebase" section in CYBAVO Wallet SDK Admin Panel User Manual.
# More Details

See this : [**SDK Guideline**](docs/sdk_guideline.md)