import { NavigationActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  console.log('NavigationService.navigate', routeName);
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

function getBottomTabIndex() {
  try {
    return _navigator.state.nav.routes[1].routes[0].routes[0].routes[0].index;
  } catch (error) {
    return null;
  }
}

export default {
  navigate,
  setTopLevelNavigator,
  getBottomTabIndex,
};
