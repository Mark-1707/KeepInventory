import { combineReducers } from '@reduxjs/toolkit';

import login from './login';
import addproduct from './products/addproducts';
import products from './products/getproducts';
import addsaleman from './salesmen/addsalesman';
import salesmen from './salesmen/getsalesmen';
import addcustomer from './customers/addcustomer';
import allcustomers from './customers/getcutomers';
import createorder from './orders/createorder';
import getorders from './orders/getorders';
import addunit from './units/addunits';

const rootReducer = combineReducers({
  login: login,
  addproduct: addproduct,
  products: products,
  addsaleman: addsaleman,
  salesmen: salesmen,
  addcustomer: addcustomer,
  allcustomers: allcustomers,
  createorder: createorder,
  getorders: getorders,
  addunit: addunit,
});

export default rootReducer;
