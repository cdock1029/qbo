'use strict';

import { getCustomersPromise, submitPaymentsPromise } from './Data';
import { Actions } from 'flummox';

class CustomerActions extends Actions {

  constructor() {
    super();
  }

  async getCustomers(query) {
    console.log('CustomerActions getCustomers(..)');

    try {
      return await getCustomersPromise(query);
    } catch (err) {
      throw err.responseText;
    }
  }

  updatePayments(customerId, invoices) {
    return { customerId, invoices };
  }

  async submitPayments(payments) {
    console.log('actions submitPayments');
    try {
      return await submitPaymentsPromise(payments);
    } catch (err) {
      throw err.responseText;
    }
  }

  toggleExpanded() {
    console.log('actions toggleExpanded');
    return true;
  }
}

const AlertActions = {

  addAlert(alert) {
    return alert;
  },

  removeAlert(index) {
    return index;
  }

};


let actions = {};

actions.CustomerActions = CustomerActions;
actions.AlertActions = AlertActions;

module.exports = actions;
