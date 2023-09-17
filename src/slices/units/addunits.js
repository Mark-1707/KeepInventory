import {createSlice} from '@reduxjs/toolkit';
import url from '../../../utils/url';

export const initialState = {
  unit: null,
  unitsArray: [],
  loading: false,
  hasErrors: false,
};

const addUnitSlice = createSlice({
  name: 'addunit',
  initialState,
  reducers: {
    addUnit: state => {
      state.loading = true;
    },
    addUnitSuccess: (state, {payload}) => {
      state.unit = payload.data;
      state.loading = false;
      state.hasErrors = false;
    },
    addUnitFailure: state => {
      state.loading = false;
      state.hasErrors = true;
    },
    reset: state => {
      state.unit = null;
      state.loading = false;
      state.hasErrors = false;
    },
    getAllUnits: (state, {payload}) => {
      state.unitsArray = payload.data;
      state.loading = false;
      state.hasErrors = false;
    },
  },
});

export const {addUnit, addUnitSuccess, addUnitFailure, reset, getAllUnits} =
  addUnitSlice.actions;

export const addUnitSelector = state => state.addunit;

export default addUnitSlice.reducer;

export const addUnitMethod = data => {
  return async dispatch => {
    dispatch(addUnit());
    try {
      const response = await fetch(`${url}/addunit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (res.status) {
        dispatch(addUnitSuccess(res));
        dispatch(reset());
      } else {
        dispatch(addUnitFailure());
      }
    } catch (error) {
      dispatch(addUnitFailure());
    }
  };
};

export const getUnitsMethod = () => {
  return async dispatch => {
    dispatch(addUnit());
    try {
      const response = await fetch(`${url}/getunits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const res = await response.json();
      console.log('res', res);
      if (res.status) {
        dispatch(getAllUnits(res));
      } else {
        dispatch(addUnitFailure());
      }
    } catch (error) {
      dispatch(addUnitFailure());
    }
  };
};

// update
export const updateUnitMethod = data => {
  return async dispatch => {
    dispatch(addUnit());
    try {
      const response = await fetch(`${url}/updateunit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (res.status) {
        console.log('res check', res);
        dispatch(addUnitSuccess(res));
        dispatch(reset());
      } else {
        dispatch(addUnitFailure());
      }
    } catch (error) {
      dispatch(addUnitFailure());
    }
  };
};
