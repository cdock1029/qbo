'use strict';

import { getCustomersPromise, submitPaymentsPromise } from './Data';

const CustomerActions = {

  async getCustomers(query, pageNumber = 0) {
    try {
      const result = await getCustomersPromise(query);
      return {result, pageNumber};
    } catch (err) {
      throw err.responseText;
    }
  },

  changeCachedPage(pageNumber) {
    return pageNumber;
  },

  updatePayments(customerId, invoices) {
    return { customerId, invoices };
  },

  async submitPayments(payments) {
    console.log('actions submitPayments:', payments);
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
  }

};

let actions = {};

actions.CustomerActions = CustomerActions;

module.exports = actions;
