/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
// import * as WeChat from 'react-native-wechat';

export default {
  async signIn() {
    return {
      idToken: '',
      name: 'WeChat user',
      email: 'user@wechat.com',
      avatar: '',
    };
  },
  async signOut() {
    console.log('WeChat.signOut...');
    // no signout
  },
};
