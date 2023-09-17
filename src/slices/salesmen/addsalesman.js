import { createSlice } from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  salesman: null,
  loading: false,
  hasErrors: false,
  success: false,
  message: '',
};

// A slice for login with our three reducers
const addSalesmanSlice = createSlice({
  name: 'addsaleman',
  initialState,
  reducers: {
    addSalesman: state => {
      state.loading = true;
    },

    addSalesmanSuccess: (state, { payload }) => {
      state.salesman = payload.data;
      state.loading = false;
      state.hasErrors = false;
      state.success = true;
      state.message = payload.message;
    },

    addSalemanFailure: (state, { payload }) => {
      state.loading = false;
      state.hasErrors = true;
      state.success = false;
      state.message = payload.message;
    },
  },
});

export const { addSalesman, addSalesmanSuccess, addSalemanFailure } =
  addSalesmanSlice.actions;

// A selector
export const addSalesmanSelector = state => state.addsaleman;

// The reducer
export default addSalesmanSlice.reducer;

// Asynchronous thunk action
export function addSalesmanMethod(
  data,
  update = false,
  editingSalesman = null,
) {
  return async dispatch => {
    dispatch(addSalesman());
    if (update) {
      try {
        const response = await fetch(`${url}/updatesalesman`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingSalesman),
        });
        const res = await response.json();
        console.log(res);
        if (res.status) {
          dispatch(addSalesmanSuccess(res));
        } else {
          dispatch(addSalemanFailure(res));
        }
      } catch (error) {
        console.log(error);
        dispatch(addSalemanFailure(error));
      }
    } else {
      try {
        console.log(data);
        const response = await fetch(`${url}/signupsalesman`, {
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
          dispatch(addSalesmanSuccess(res));
        } else {
          dispatch(addSalemanFailure(res));
        }
      } catch (error) {
        console.log(error);
        dispatch(addSalemanFailure(error));
      }
    }
  };
}
