/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */

import { NativeModules } from 'react-native';

const { LineLoginManager } = NativeModules;
import I18n from '../../../../i18n/i18n';

export default {
  async signIn() {
    try {
      console.log('LINE.signIn...');

      let user = await LineLoginManager.loginWithPermissions([
        'email',
        'profile',
        'openid',
      ]);
      console.log(
        'LINE.signIn currentAccessToken',
        await LineLoginManager.currentAccessToken()
      );
      console.log('LINE.signIn user', user);
      console.log('LINE.signIn name', user.profile.displayName);
      const {
        accessToken: { accessToken: idToken },
        profile: { displayName: name, pictureURL: avatar },
      } = user;
      console.log('LINE.signIn obj', { idToken, name, avatar });
      return { idToken, name, avatar };
    } catch (error) {
      console.log('LINE.signIn failed', error, error.message);
      if (error.message == 'Cancel authentication') {
        throw new Error(I18n.t('line_signin_cancelled'));
      }
      throw error;
    }
  },
  async signOut() {
    console.log('LINE.signOut...');
  },
};
