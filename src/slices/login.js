import {createSlice} from '@reduxjs/toolkit';
import url from '../../utils/url';
import cache from '../../utils/cache';

export const initialState = {
  login: {status: false},
  loading: false,
  hasErrors: false,
  success: false,
};

// A slice for login with our three reducers
const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    getLogin: state => {
      state.loading = true;
    },

    getLoginSuccess: (state, {payload}) => {
      state.login = payload;
      state.loading = false;
      state.hasErrors = false;
      state.success = true;
    },

    getLoginFailure: state => {
      state.loading = false;
      state.hasErrors = true;
    },
    reset: state => {
      state.loading = false;
      state.hasErrors = false;
      state.success = false;
      state.login = {status: false};
    },
  },
});

export const {getLogin, getLoginSuccess, getLoginFailure, reset} =
  loginSlice.actions;

// A selector
export const loginSelector = state => state.login;

// The reducer
export default loginSlice.reducer;

export function saveFromCache() {
  return async dispatch => {
    const role = await cache.get('user_role');
    const status = await cache.get('login_status');
    console.log('Hello', role, status);
    const id = await cache.get('user_id');
    if (status) {
      dispatch(getLoginSuccess({role: role, id: id}));
    }
  };
}

export function resetMethod() {
  return async dispatch => {
    dispatch(reset());
  };
}

// Asynchronous thunk action
export function loginMethod(data) {
  return async dispatch => {
    dispatch(getLogin());
    try {
      console.log(url);
      const response = await fetch(`${url}/signin`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const res = await response.json();
      console.log(res);
      if (res.status) {
        await cache.set('user_role', res.data.role);
        await cache.set('user_id', res.data.id);
        await cache.set('login_status', true);
        dispatch(getLoginSuccess(res.data));
      } else {
        console.log('Error', res);
        dispatch(getLoginFailure());
      }
    } catch (error) {
      console.log(error);
      dispatch(getLoginFailure());
    }
  };
}
