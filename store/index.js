import { applyMiddleware, createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@react-native-community/async-storage';
import ReduxThunk from 'redux-thunk';
import logger from 'redux-logger';
import reducers from './reducers';
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  timeout: 10000,
};
let MIDDLEWARES = [ReduxThunk];
if (__DEV__) {
  MIDDLEWARES = [...MIDDLEWARES, logger];
}
const persistedReducer = persistReducer(persistConfig, reducers);
export const store = createStore(
  persistedReducer,
  applyMiddleware(...MIDDLEWARES)
);

export const persistor = persistStore(store);
export default { store, persistor };
