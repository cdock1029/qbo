'use strict';

import { getCustomersPromise, submitPaymentsPromise } from './Data';

const CustomerActions = {

  async getCustomers(query) {
    try {
      return await getCustomersPromise(query);
    } catch (err) {
      throw err.responseText;
    }
  },

  updatePayments(customerId, invoices) {
    return { customerId, invoices };
  },

  async submitPayments(payments) {
    console.log('actions submitPayments');
    try {
      return await submitPaymentsPromise(payments);
    } catch (err) {
      throw err.responseText;
    }
  },

  toggleExpanded() {
    return true;
  },

  removeAlert(index) {
    return index;
  },

  clearAllPayments() {
    return true;
  }
};

let actions = {};

actions.CustomerActions = CustomerActions;

module.exports = actions;
