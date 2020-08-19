/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import { GoogleSignin, statusCodes } from 'react-native-google-signin';

export default {
  async signIn() {
    try {
      console.log('hasPlayServices...');
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('hasPlayServices... Done');
      console.log('GoogleSignin.isSignedIn...');
      let account = null;
      const isSignedIn = await GoogleSignin.isSignedIn();
      console.log('GoogleSignin.isSignedIn...' + isSignedIn);
      if (isSignedIn) {
        console.log('GoogleSignin.getCurrentUser...');
        account = await GoogleSignin.getCurrentUser();
        console.log('GoogleSignin.getCurrentUser...', account);
        if (!account) {
          await GoogleSignin.clearCachedToken();
        }
      }
      if (!account) {
        console.log('GoogleSignin.signIn...');
        account = await GoogleSignin.signIn();
        console.log('GoogleSignin.signIn... Done', account);
      }
      const {
        idToken,
        user: { email, name, photo: avatar },
      } = account;
      return { idToken, name, email, avatar };
    } catch (error) {
      console.log('GoogleSignin.signIn failed', error);
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new Error('Google sign in has been cancelled');
        case statusCodes.IN_PROGRESS:
          throw new Error('Google sign in is in progress');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Google play service is not available');
        default:
          throw error;
      }
    }
  },
  async signOut() {
    console.log('GoogleSignin.signOut...');
    const resp = await GoogleSignin.signOut();
    console.log('GoogleSignin.signOut... Done', resp);
    return resp;
  },
};
