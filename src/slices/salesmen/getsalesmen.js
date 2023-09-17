import {createSlice} from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  salesmen: [],
  salesmenLoading: false,
  salesmenHasErrors: false,
  salesmenSuccess: false,
};

// A slice for login with our three reducers
const salesmenSlice = createSlice({
  name: 'salesmen',
  initialState,
  reducers: {
    getSalesmen: state => {
      state.salesmenLoading = true;
    },

    getSalesmenSuccess: (state, {payload}) => {
      state.salesmen = payload;
      state.salesmenLoading = false;
      state.salesmenHasErrors = false;
      state.salesmenSuccess = true;
    },

    getSalesmenFailure: state => {
      state.salesmenLoading = false;
      state.salesmenHasErrors = true;
    },
  },
});

export const {getSalesmen, getSalesmenFailure, getSalesmenSuccess} =
  salesmenSlice.actions;

// A selector
export const salesmenSelector = state => state.salesmen;

// The reducer
export default salesmenSlice.reducer;

// Asynchronous thunk action
export function getSalesmenMethod({
  data,
  add = false,
  editingSalesmen = null,
  update = false,
  body = null,
}) {
  return async dispatch => {
    dispatch(getSalesmen());

    if (update) {
      let newData = data.map(item => {
        if (item.id === editingSalesmen.id) {
          return editingSalesmen;
        }
        return item;
      });
      dispatch(getSalesmenSuccess(newData));
    } else if (add) {
      let newData = [...data, editingSalesmen];
      dispatch(getSalesmenSuccess(newData));
    } else {
      try {
        const response = await fetch(`${url}/getallsalesmen`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const res = await response.json();
        if (res.status) {
          dispatch(getSalesmenSuccess(res.data));
        } else {
          dispatch(getSalesmenFailure());
        }
      } catch (error) {
        console.log(error);
        dispatch(getSalesmenFailure());
      }
    }
  };
}
