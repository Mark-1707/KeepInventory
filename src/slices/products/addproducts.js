import {createSlice} from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  product: null,
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

    addProductSuccess: (state, {payload}) => {
      state.product = payload.data;
      state.loading = false;
      state.hasErrors = false;
      state.success = true;
    },

    addProductFailure: state => {
      state.loading = false;
      state.hasErrors = true;
      state.success = false;
    },
  },
});

export const {addProduct, addProductSuccess, addProductFailure} =
  addProductSlice.actions;

// A selector
export const addProductSelector = state => state.addproduct;

// The reducer
export default addProductSlice.reducer;

// Asynchronous thunk action
export function addProductMethod(data, update = false, editingProduct = null) {
  return async dispatch => {
    dispatch(addProduct());
    if (update) {
      try {
        const response = await fetch(`${url}/updateproducts`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingProduct),
        });
        const res = await response.json();
        console.log(res);
        if (res.status) {
          dispatch(addProductSuccess(res));
        } else {
          dispatch(addProductFailure());
        }
      } catch (error) {
        console.log(error);
        dispatch(addProductFailure());
      }
    } else {
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
          dispatch(addProductSuccess(res));
        } else {
          dispatch(addProductFailure());
        }
      } catch (error) {
        console.log(error);
        dispatch(addProductFailure());
      }
    }
  };
}
