import appleAuth, {
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthCredentialState,
  AppleAuthError,
} from '@invertase/react-native-apple-authentication';
import { getFullName } from '../../../../Helpers';
import I18n from '../../../../i18n/i18n';

export default {
  async signIn() {
    try {
      console.log('Apple.signIn...');

      // performs login request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.EMAIL,
          AppleAuthRequestScope.FULL_NAME,
        ],
      });

      // get current authentication state for user
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );

      // use credentialState response to ensure the user is authenticated
      if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
        //this is only for demo. In production app, please do this by locale
        let fullName = getFullName(
          appleAuthRequestResponse.fullName.givenName || '',
          appleAuthRequestResponse.fullName.familyName || ''
        );
        // user is authenticated
        return {
          idToken: appleAuthRequestResponse.identityToken,
          name: fullName,
          email: appleAuthRequestResponse.email,
          avatar: '',
        };
      }
    } catch (error) {
      console.log('AppleAuth sign in failed', error);
      switch (error.code) {
        case AppleAuthError.CANCELED:
          throw new Error(I18n.t('apple_signin_cancelled'));
        default:
          throw error;
      }
    }
  },
  async signOut() {
    console.log('Apple.signOut...');
  },
};
