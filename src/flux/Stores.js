'use strict';

import { Store } from 'flummox';
import Immutable from 'immutable';

class AlertStore extends Store {

  constructor(flux) {
    super();
    const alertActionIds = flux.getActionIds('alerts');

    this.register(alertActionIds.addAlert, this.handleNewAlert);
    this.register(alertActionIds.removeAlert, this.handleRemoveAlert);
    this.state = {
      alerts: []
    };
  }

  handleNewAlert(message) {
    this.setState({
      alerts: this.state.alerts.concat(message)
    });
  }

  handleRemoveAlert(index) {
    this.setState({
      alerts: this.state.alerts.splice(index, 1)
    });
  }
}

class CustomerStore extends Store {

  constructor(flux) {
    super();
    const actions = flux.getActionIds('customers');

    this.registerAsync(actions.getCustomers, this.setLoading, this.handleCustomers, this.handleJqueryError);
    this.register(actions.updatePayments, this.updatePayments);
    this.register(actions.toggleExpanded, this.toggleExpanded);
    this.registerAsync(actions.submitPayments, this.setLoading, this.handleSubmitPayments, this.handleJqueryError);
    this.register(actions.removeAlert, this.handleRemoveAlert);

    this.state = {
      customers: [],
      invoices: {},
      payments: {},
      expanded: true,
      loading: false,
      alerts: []
    };
    window.STATE = function() {
      return this.state;
    }.bind(this);
  }

  static getPageSize() {
    return 2;
  }

  getCustomers() {
    return this.state.customers;
  }

  getNext() {
    return this.state.next;
  }

  getPrevious() {
    return this.state.previous;
  }

  getTotalCount() {
    return this.state.totalCount;
  }

  getLoading() {
    return this.state.loading;
  }

  getPayments() {
    return this.state.payments;
  }

  getExpanded() {
    return this.state.expanded;
  }

  getIsSelected(customerId) {
    return this.state.payments.hasOwnProperty(customerId);
  }

  getInvoices(customerId) {
    return this.state.invoices[customerId];
  }

  setLoading() {
    this.setState({ loading: true });
  }

  toggleExpanded() {
    this.setState({ expanded: !this.state.expanded });
  }

  updatePayments({customerId, invoices}) {
    let payments = this.state.payments;

    if (invoices){
        payments[customerId] = {customerId, invoices};
    } else {
        delete payments[customerId];
    }
    this.setState({ payments });
  }

  handleJqueryError(error) {
    console.log('handleJqueryError: ' + error);
    //this.FLUX.getActions('alerts').addAlert(error);
    this.setState({ alerts: this.state.alerts.concat({message: error, style: 'danger'}) });
  }

  getAlerts() {
    console.log('store getAlerts(): ', this.state.alerts);
    return this.state.alerts;
  }

  addAlert(alert) {
    this.setState({ alerts: this.state.alerts.concat(alert) });
  }

  handleSubmitPayments(batchItemResponse) {
    console.log(batchItemResponse);
    this.setState({
      alerts: this.state.alerts.concat({
        type: 'success',
        message: 'Payments applied'
      }),
      loading: false,
      payments: {}
    });
    //this._getCustomerData(1, true);
  }

  handleCustomers(result) {
    if (result.crumb) {
      window.crumb(result.crumb);
    }
    const data = result.QueryResponse;
    console.log('handleCustomers', data);

    let next = null;
    if (this.state.totalCount) {
      next = data.maxResults + data.startPosition - 1 === this.state.totalCount ? null : data.startPosition + data.maxResults;
    } else if (data.totalCount) {
      next = data.maxResults + data.startPosition - 1 === data.totalCount ? null : data.startPosition + data.maxResults;
    } else {
      next = data.maxResults === PAGE_SIZE ? data.startPosition + data.maxResults : null;
    }
    this.setState({
      totalCount: data.totalCount || data.totalCount === 0 ? data.totalCount : this.state.totalCount,
      loading: false,
      customers: data.Customer,
      invoices: data.Invoice,
      next: next,
      previous: data.startPosition === 1 ? null : ( data.startPosition - data.maxResults >= 1 ? data.startPosition - data.maxResults : 1)
    });
  }

  handleRemoveAlert(index) {
    console.log('store handleRemoveAlert(%d)', index);
    console.log('previous alerts state: ', this.state.alerts);
    let a = this.state.alerts;
    a.splice(index, 1);//returns removed portion
    this.setState({
      alerts: a
    });
  }

}

let stores = {};

stores.CustomerStore = CustomerStore;
stores.AlertStore = AlertStore;

module.exports = stores;