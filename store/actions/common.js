/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import VersionCheck from 'react-native-version-check';
export const COMMON_RESET = 'COMMON_RESET';
export const COMMON_UPDATE_VERSION_CHECK = 'COMMON_UPDATE_VERSION_CHECK';
export const COMMON_UPDATE_VERSION_CHECK_LOADING =
  'COMMON_UPDATE_VERSION_CHECK_LOADING';
export const COMMON_UPDATE_VERSION_CHECK_ERROR =
  'COMMON_UPDATE_VERSION_CHECK_ERROR';

function shouldCheck(state) {
  console.log(
    `shouldCheck:${state.common.version.needUpdate == null}, ${!state.common
      .version.loading}`
  );
  return (
    state.common.version.needUpdate == null && !state.common.version.loading
  ); // no currency and not loading
}
export function checkVersion() {
  return async (dispatch, getState) => {
    let s = getState();
    if (shouldCheck(getState())) {
      dispatch({
        type: COMMON_UPDATE_VERSION_CHECK_LOADING,
        loading: true,
      });
      VersionCheck.needUpdate()
        .then(res => {
          if (res) {
            console.log(`needUpdate:${JSON.stringify(res)}`);
            dispatch({
              type: COMMON_UPDATE_VERSION_CHECK,
              needUpdate: res,
            });
          } else {
            dispatch({
              type: COMMON_UPDATE_VERSION_CHECK_ERROR,
              error: '(No result)',
            });
          }
        })
        .catch(error => {
          console.log(`needUpdate error:${error}`);
          dispatch({
            type: COMMON_UPDATE_VERSION_CHECK_ERROR,
            error: error,
          });
        });
    }
  };
}
