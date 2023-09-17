import {createSlice} from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  order: null,
  loading: false,
  hasErrors: false,
  message: null,
  success: false,
};

const createOrderSlice = createSlice({
  name: 'createorder',
  initialState,
  reducers: {
    createOrder: state => {
      state.loading = true;
    },
    createOrderSuccess: (state, {payload}) => {
      state.order = payload.data;
      state.loading = false;
      state.hasErrors = false;
      state.message = payload.message;
      state.success = true;
    },
    createOrderFailure: (state, {payload}) => {
      state.message = payload;
      state.loading = false;
      state.hasErrors = true;
      state.message = payload.message;
      state.success = false;
    },
    reset: state => {
      state.loading = false;
      state.hasErrors = false;
      state.message = null;
      state.success = false;
    },
  },
});

export const {createOrder, createOrderSuccess, createOrderFailure, reset} =
  createOrderSlice.actions;

export const createOrderSelector = state => state.createorder;

export default createOrderSlice.reducer;

export const resetMethod = () => async dispatch => {
  dispatch(reset());
};

export function createOrderMethod(order) {
  return async dispatch => {
    dispatch(createOrder());

    try {
      const response = await fetch(`${url}/bookorder`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(order),
      });

      const res = await response.json();
      console.log('res', res);

      if (res.status) {
        dispatch(createOrderSuccess(res));
      } else {
        dispatch(createOrderFailure(res.message));
      }
    } catch (error) {
      console.log('error', error);
      dispatch(createOrderFailure(error));
    }
  };
}
