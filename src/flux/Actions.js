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
    return true;
  }

  removeAlert(index) {
    return index;
  }

  clearAllPayments() {
    return true;
  }
}

let actions = {};

actions.CustomerActions = CustomerActions;

module.exports = actions;
