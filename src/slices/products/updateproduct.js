import { createSlice } from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  product: {},
  loading: false,
  hasErrors: false,
  success: false,
};

// A slice for login with our three reducers
const addProductSlice = createSlice({
  name: 'addproduct',
  initialState,
  reducers: {
    addProduct: state => {
      state.loading = true;
    },

    addProductSuccess: (state, { payload }) => {
      state.product = payload;
      state.loading = false;
      state.hasErrors = false;
      state.success = true;
      state.success = true;
    },

    addProductFailure: state => {
      state.loading = false;
      state.hasErrors = true;
    },
  },
});

export const { addProduct, addProductSuccess, addProductFailure } =
  addProductSlice.actions;

// A selector
export const addProductSelector = state => state.addproduct;

// The reducer
export default addProductSlice.reducer;

// Asynchronous thunk action
export function addProductMethod(data) {
  return async dispatch => {
    dispatch(addProduct());
    try {
      const response = await fetch(`${url}/addproducts`, {
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
        dispatch(addProductSuccess(res.data));
      } else {
        dispatch(addProductFailure());
      }
    } catch (error) {
      console.log(error);
      dispatch(addProductFailure());
    }
  };
}
