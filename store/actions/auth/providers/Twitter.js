/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */

import { NativeModules } from 'react-native';

const { RNTwitterSignIn } = NativeModules;
import I18n from '../../../../i18n/i18n';

export default {
  async signIn() {
    try {
      console.log('Twitter.signIn...');
      let loginData = await RNTwitterSignIn.logIn();
      console.log('Twitter.signIn authToken', loginData.authToken);
      console.log('Twitter.signIn authTokenSecret', loginData.authTokenSecret);
      console.log('Twitter.signIn userName', loginData.userName);
      console.log('Twitter.signIn userID', loginData.userID);
      return {
        idToken: loginData.authToken,
        name: loginData.userName,
        secret: loginData.authTokenSecret,
      };
    } catch (error) {
      console.log('Twitter.signIn failed', error, error.message);
      if (error.message == 'Twitter signin error') {
        throw new Error(I18n.t('twitter_signin_cancelled'));
      }
      throw error;
    }
  },
  async signOut() {
    console.log('Twitter.signOut...');
  },
};
