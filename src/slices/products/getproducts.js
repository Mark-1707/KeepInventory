import {createSlice} from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  products: [],
  productLoading: false,
  productHasErrors: false,
  productSuccess: false,
  errorMessage: null,
};

// A slice for login with our three reducers
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    getProducts: state => {
      state.productLoading = true;
    },

    getProductsSuccess: (state, {payload}) => {
      state.products = payload.data;
      state.productLoading = false;
      state.productHasErrors = false;
      state.productSuccess = true;
    },

    getProductsFailure: (state, {payload}) => {
      state.productLoading = false;
      state.productHasErrors = true;
      state.errorMessage = payload;
    },
  },
});

export const {getProducts, getProductsFailure, getProductsSuccess} =
  productsSlice.actions;

// A selector
export const productSelector = state => state.products;

// The reducer
export default productsSlice.reducer;

// Asynchronous thunk action
export function getProductMethod(
  data,
  add = false,
  editingProduct = null,
  update = false,
) {
  return async dispatch => {
    dispatch(getProducts());

    if (update) {
      console.log('For Update', editingProduct);
      let newData = data.map(item => {
        if (item.id === editingProduct.id) {
          return editingProduct;
        }
        return item;
      });
      dispatch(getProductsSuccess(newData));
    } else if (add) {
      let newData = [...data, editingProduct];
      dispatch(getProductsSuccess(newData));
    } else {
      try {
        console.log(data);
        const response = await fetch(`${url}/getproducts`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const res = await response.json();
        console.log('Response', res);
        if (res.status) {
          dispatch(getProductsSuccess(res));
        } else {
          dispatch(getProductsFailure(res.data));
        }
      } catch (error) {
        console.log(error);
        dispatch(getProductsFailure(error));
      }
    }
  };
}
