import {
  COMMON_UPDATE_VERSION_CHECK,
  COMMON_UPDATE_VERSION_CHECK_ERROR,
  COMMON_UPDATE_VERSION_CHECK_LOADING,
} from '../actions';

/**
needUpdate{
  isNeeded: semver.gt(latestVersionWithDepth, currentVersionWithDepth),
  storeUrl: providerStoreUrl,
  currentVersion,
  latestVersion,
}
*/

export default function actions(
  state = {
    version: {
      loading: false,
      needUpdate: null,
      error: null,
    },
  },
  action
) {
  switch (action.type) {
    case COMMON_UPDATE_VERSION_CHECK:
      return {
        ...state,
        version: {
          needUpdate: action.needUpdate,
          loading: false,
          error: null,
        },
      };
    case COMMON_UPDATE_VERSION_CHECK_LOADING:
      return {
        ...state,
        version: {
          ...state.version,
          loading: action.loading,
        },
      };
    case COMMON_UPDATE_VERSION_CHECK_ERROR:
      return {
        ...state,
        version: {
          ...state.version,
          loading: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}
