'use strict';

import { Store } from 'flummox';
import Immutable from 'immutable';
import { PAGE_SIZE } from './Constants';

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
    this.FLUX = flux; 
    const customerActionIds = flux.getActionIds('customers');
    this.registerAsync(customerActionIds.getCustomers, this.setLoading, this.handleCustomers, this.handleJqueryError);
    this.state = {
      pageSize: PAGE_SIZE,
      customers: Immutable.List(),
      invoices: Immutable.Map(),
      payments: Immutable.Map(),
      expanded: true,
      isSubmitting: false,
      loading: false,
      errors: []
    };
  }
  
  setLoading() {
    this.setState({ loading: true });  
  }
  
  handleJqueryError(error) {
    console.log('handleJqueryError: ' + error);
    //this.FLUX.getActions('alerts').addAlert(error);
    this.setState({ errors: this.state.errors.concat(error) });
  }
  
  getErrors() {
    return this.state.errors;
  }
   
  setAlert(message) {
    //TODO
    console.log(message);
  }
  
  handleCustomers(result) {
    if (result.crumb) {
      window.crumb(result.crumb);
    }
    const data = result.QueryResponse;
    console.log('store handleCustomers: ' + data);
    this.setState({
      totalCount: data.totalCount || data.totalCount === 0 ? data.totalCount : this.state.totalCount,
      loading: false,
      customers: Immutable.List(data.Customer), 
      invoices: Immutable.Map(data.Invoice),
      next: data.maxResults === PAGE_SIZE ? data.startPosition + data.maxResults : null,
      previous: data.startPosition === 1 ? null : ( data.startPosition - data.maxResults >= 1 ? data.startPosition - data.maxResults  : 1)
    });
  }
  
}

let stores = {};

stores.CustomerStore = CustomerStore;
stores.AlertStore = AlertStore;

module.exports = stores;