/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */

import { NativeModules } from 'react-native';

const { RNTwitterSignIn } = NativeModules;
import {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
} from '../../../../BuildConfig.json';

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
      if (
        error.message == 'The user has denied the approval' ||
        error.message == 'Line login canceled by user'
      ) {
        throw new Error('Twitter sign in has been cancelled');
      }
      throw error;
    }
  },
  async signOut() {
    console.log('Twitter.signOut...');
  },
};
