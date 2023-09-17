/**
 * @format
 */
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';

import rootReducer from './src/slices';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

const store = configureStore({reducer: rootReducer});

const RNRedux = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => RNRedux);
