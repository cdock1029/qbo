'use strict';

import { Actions } from 'flummox';
import { getCustomersPromise } from './Data';

const CustomerActions = {
  
  async getCustomers(query) {
    console.log('CustomerActions getCustomers(..)');
    try {
      return await getCustomersPromise(query); 
    } catch (err) {
      throw err.responseText;
    }
  }
  
   
};

const AlertActions = {
  
  addAlert(message) {
    return message;
  },
  
  removeAlert(index) {
    return index;
  }
  
};


let actions = {};

actions.CustomerActions = CustomerActions;
actions.AlertActions = AlertActions;

module.exports = actions;