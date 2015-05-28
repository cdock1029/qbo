'use strict';

import { getCustomersPromise } from './Data';

const CustomerActions = {

    /* jshint ignore:start */async/* jshint ignore:end */
    getCustomers(query) {
    console.log('CustomerActions getCustomers(..)');
    try {
      return/* jshint ignore:start */ await /* jshint ignore:end */getCustomersPromise(query);
    } catch (err) {
      throw err.responseText;
    }
  },

  updatePayments(customerId, invoices) {
    return {
      customerId: customerId,
      invoices: invoices
    };
  },

  submitPayments() {
    console.log('actions submitPayments');
    return true;
  },

  toggleExpanded() {
    console.log('actions toggleExpanded');
    return true;
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
