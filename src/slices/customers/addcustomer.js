import { createSlice } from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  customer: null,
  loading: false,
  hasErrors: false,
  message: null,
};

const addCustomerSlice = createSlice({
  name: 'addcustomer',
  initialState,
  reducers: {
    addCustomer: state => {
      state.loading = true;
    },
    addCustomerSuccess: (state, { payload }) => {
      state.customer = payload.data;
      state.loading = false;
      state.hasErrors = false;
      state.message = payload.message;
    },
    addCustomerFailure: (state, { payload }) => {
      state.loading = false;
      state.hasErrors = true;
      state.message = payload.message;
    },
  },
});

export const { addCustomer, addCustomerSuccess, addCustomerFailure } =
  addCustomerSlice.actions;

export const addCustomerSelector = state => state.addcustomer;

export default addCustomerSlice.reducer;

export function addCustomerMethod(
  customer,
  update = false,
  editingCustomer = null,
) {
  return async dispatch => {
    dispatch(addCustomer());

    if (update) {
      try {
        const response = await fetch(`${url}/updatecustomer`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingCustomer),
        });

        const res = await response.json();
        console.log(res)
        if (res.status) {
          dispatch(addCustomerSuccess(res));
        } else {
          dispatch(addCustomerFailure(res));
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const response = await fetch(`${url}/addcustomer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customer),
        });

        const res = await response.json();
        console.log(res)

        if (res.status) {
          dispatch(addCustomerSuccess(res));
        } else {
          dispatch(addCustomerFailure(res));
        }
      } catch (error) {
        dispatch(addCustomerFailure(error));
      }
    }
  };
}
