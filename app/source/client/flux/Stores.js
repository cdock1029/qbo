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
    this.register(actions.changeCachedPage, this.changeCachedPage);

    this.state = {
      currentPage: 0,
      customers: Immutable.List(),
      invoices: Immutable.Map(),
      payments: Immutable.Map(),
      expanded: true,
      loading: false,
      alerts: Immutable.List.of({message: 'Data loaded Yes!', type: 'info'})
    };

  }

  /**
   * @returns {number} the fixed size of each page of data.
   */
  static getPageSize() {
    return 5;
  }

  static getLoadLimit() {
    return 10;
  }

  /**
   * Check if a page number is loaded in the store.
   * @param pageNumber {number} desired page number to load.
   * @returns {boolean} if the store had this page loaded.
   */
  isPageLoaded(pageNumber) {
    return pageNumber < this.state.customers.size / CustomerStore.getPageSize();
  }

  changeCachedPage(pageNumber) {
    //set prev, next accordingly
    this.setState({
      currentPage: pageNumber,
      previous: pageNumber !== 0 ? pageNumber - 1 : null,
      next: pageNumber !== this.state.pageCount - 1 ? pageNumber + 1 : null
    });
  }

  /**
   * @returns {number} the current page of data to be shown in the table.
   */
  getCurrentPage() {
    return this.state.currentPage;
  }

  getPageCount() {
    return this.state.pageCount;
  }

  getCustomers() {
    //console.log('getCustomers');
    const start = this.state.currentPage * CustomerStore.getPageSize();
    const end = start + CustomerStore.getPageSize();

    return this.state.customers.slice(start, end);
  }

  getNext() {
    //console.log('getNext');
    return this.state.next;
  }

  getPrevious() {
    //console.log('getPrevious');
    return this.state.previous;
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

  handleCustomers({result, pageNumber}) {
    if (result.crumb) {
      window.crumb(result.crumb);
    }
    const data = result.QueryResponse;
    this.setState(state => {
      const pageCount = (data.totalCount || data.totalCount === 0) ? Math.ceil(data.totalCount / CustomerStore.getPageSize()) : state.pageCount;
      return {
        currentPage: pageNumber,
        pageCount: pageCount,
        loading: false,
        customers: state.customers.concat(Immutable.fromJS(data.Customer)),
        invoices: state.invoices.merge(Immutable.fromJS(data.Invoice)),
        next: pageNumber < pageCount - 1 ? pageNumber + 1 : null,
        previous: pageNumber > 0 ? pageNumber - 1 : null//data.startPosition === 1 ? null : ( data.startPosition - CustomerStore.getPageSize() >= 1 ? data.startPosition - CustomerStore.getPageSize() : 1)
      };
    });
  }

  handleRemoveAlert(index) {
    console.log('store handleRemoveAlert(%d)', index);
    console.log('previous alerts state: ', this.state.alerts);

    this.setState(state => ({
      alerts: state.alerts.delete(index)
    }));
  }

}

const stores = {};

stores.CustomerStore = CustomerStore;

module.exports = stores;
