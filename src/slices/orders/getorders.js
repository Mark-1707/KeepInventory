import { createSlice } from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  orders: [],
  getOrdersloading: false,
  getOrdershasErrors: false,
  getOrdersmessage: null,
};

const getOrdersSlice = createSlice({
  name: 'getorders',
  initialState,
  reducers: {
    getOrders: state => {
      state.getOrdersloading = true;
    },
    getOrdersSuccess: (state, { payload }) => {
      state.orders = payload.data;
      state.getOrdersloading = false;
      state.getOrdershasErrors = false;
      state.getOrdersmessage = payload.message;
    },
    getOrdersFailure: (state, { payload }) => {
      state.getOrdersloading = false;
      state.getOrdershasErrors = true;
      state.getOrdersmessage = payload.message;
    },
  },
});

export const { getOrders, getOrdersSuccess, getOrdersFailure } =
  getOrdersSlice.actions;

export const getOrdersSelector = state => state.getorders;

export default getOrdersSlice.reducer;

export function getOrdersMethod() {
  return async dispatch => {
    dispatch(getOrders());

    try {
      const response = await fetch(`${url}/getorders`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      console.log('res', res)
      if (res.status) {
        dispatch(getOrdersSuccess(res));
      } else {
        dispatch(getOrdersFailure(res));
      }
    } catch (error) {
      dispatch(getOrdersFailure(error));
    }
  };
}
