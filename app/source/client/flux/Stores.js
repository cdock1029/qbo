'use strict';

import { Store } from 'flummox';
import Immutable from 'immutable';
import {removeSubmitted} from '../utils/dataTransforms';

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
      customers: Immutable.List(),
      invoices: Immutable.Map(),
      payments: Immutable.Map(),
      expanded: true,
      loading: false,
      alerts: Immutable.List.of({message: 'Data loaded Yes!', type: 'info'})
    };

  }

  static getPageSize() {
    return 6;
  }

  getPageCount() {
    return this.state.pageCount;
  }

  getCustomers() {
    //console.log('getCustomers');
    return this.state.customers;
  }

  getNext() {
    //console.log('getNext');
    return this.state.next;
  }

  getPrevious() {
    //console.log('getPrevious');
    return this.state.previous;
  }

  getTotalCount() {
    //console.log('getTotalCount');
    return this.state.totalCount;
  }

  getLoading() {
    //console.log('getLoading');
    return this.state.loading;
  }

  getPayments() {
    //console.log('getPayments');
    return this.state.payments;
  }

  getExpanded() {
    //console.log('getExpanded');
    return this.state.expanded;
  }

  getIsSelected(customerId) {
    //console.log('getIsSelected');
    return this.state.payments.has(customerId);
  }

  getInvoices(customerId) {
    //console.log('getInvoices');
    return this.state.invoices.get(customerId);
  }

  setLoading() {
    //console.log('setLoading');
    this.setState(state => ({
      loading: true
    }));
  }

  toggleExpanded() {
    //console.log('toggleExpanded');
    this.setState(state => ({
      expanded: !state.expanded
    }));
  }

  updatePayments({customerId, invoices}) {
    //console.log('updatePayments');
    let payments = this.state.payments;

    this.setState(state => ({
      payments: invoices ? payments.set(customerId, Immutable.Map({customerId, invoices})) : payments.delete(customerId)
    }));
  }

  handleJqueryError(error) {
    //console.log('handleJqueryError: ' + error);
    //this.FLUX.getActions('alerts').addAlert(error);
    this.setState(state => ({
      alerts: state.alerts.unshift({message: error, style: 'danger'})
    }));
  }

  getAlerts() {
    //console.log('store getAlerts()');
    return this.state.alerts;
  }

  addAlert(alert) {
    //console.log('addAlert');
    this.setState(state => ({
      alerts: state.alerts.unshift(alert)
    }));
  }

  handleSubmitPayments(batchItemResponse) {

    this.setState(state => {
      const newState = removeSubmitted(state.customers.toJS(), state.invoices.toJS(), batchItemResponse);
      return {
        alerts: state.alerts.unshift({
          type: 'positive',
          message: 'Payments applied'
        }),
        customers: Immutable.fromJS(newState.customers),
        invoices: Immutable.fromJS(newState.invoices),
        loading: false,
        payments: state.payments.clear()
      };
    });
  }

  handleCustomers(result) {
    if (result.crumb) {
      window.crumb(result.crumb);
    }
    const data = result.QueryResponse;
    //console.log('handleCustomers', data);
    let next = null;
    if (this.state.totalCount) {
      next = data.maxResults + data.startPosition - 1 === this.state.totalCount ? null : data.startPosition + data.maxResults;
    } else if (data.totalCount) {
      next = data.maxResults + data.startPosition - 1 === data.totalCount ? null : data.startPosition + data.maxResults;
    } else {
      next = data.maxResults === CustomerStore.getPageSize() ? data.startPosition + data.maxResults : null;
    }
    this.setState(state => ({
      totalCount: data.totalCount || data.totalCount === 0 ? data.totalCount : state.totalCount,
      pageCount: Math.ceil(data.totalCount / CustomerStore.getPageSize()),
      loading: false,
      customers: Immutable.fromJS(data.Customer),
      invoices: Immutable.fromJS(data.Invoice),
      next: next,
      previous: data.startPosition === 1 ? null : ( data.startPosition - CustomerStore.getPageSize() >= 1 ? data.startPosition - CustomerStore.getPageSize() : 1)
    }));
  }

  handleRemoveAlert(index) {
    console.log('store handleRemoveAlert(%d)', index);
    console.log('previous alerts state: ', this.state.alerts);

    this.setState(state => ({
      alerts: state.alerts.delete(index)
    }));
  }

}

let stores = {};

stores.CustomerStore = CustomerStore;

module.exports = stores;
