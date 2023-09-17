import { createSlice } from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  allcustomers: [],
  customersLoading: false,
  customersHasErrors: false,
};

const customersSlice = createSlice({
  name: 'allcustomers',
  initialState,
  reducers: {
    allCustomer: state => {
      state.customersLoading = true;
    },
    allCustomerSuccess: (state, { payload }) => {
      state.allcustomers = payload.data;
      state.customersLoading = false;
      state.customersHasErrors = false;
    },
    allCustomerFailure: (state, { payload }) => {
      state.customersLoading = false;
      state.customersHasErrors = true;
    },
  },
});

export const { allCustomer, allCustomerSuccess, allCustomerFailure } =
  customersSlice.actions;

export const customersSelector = state => state.allcustomers;

export default customersSlice.reducer;

export function getCustomerMethod() {
  return async dispatch => {
    dispatch(allCustomer());
    try {
      const response = await fetch(`${url}/getcustomers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const res = await response.json();

      if (res.status) {
        dispatch(allCustomerSuccess(res));
      } else {
        dispatch(allCustomerFailure());
      }
    } catch (error) {
      dispatch(allCustomerFailure(error));
    }
  };
}
