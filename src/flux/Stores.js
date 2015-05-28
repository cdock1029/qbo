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
    this.register(customerActionIds.updatePayments, this.updatePayments);
    this.register(customerActionIds.toggleExpanded, this.toggleExpanded);

    this.state = {
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

  toggleExpanded() {
    this.setState({ expanded: !this.state.expanded });
  }

  updatePayments({customerId, invoices}) {

    let paymentsMap = this.state.payments;
    let updatedMap;
 
    if (invoices){//customerObject) {
        updatedMap = paymentsMap.set(customerId, {customerId: customerId, invoices: invoices});
    } else {
        updatedMap = paymentsMap.delete(customerId);//, {customerId: customerId, invoices: invoices});
    }
    //console.log('Customers _updatePayments  Map.get:', updatedMap.get(customerId));
    this.setState({ payments: updatedMap });
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

  submitPayments() {
    this.setState({loading: true});
    let payments = this.state.payments.toObject(); 
    Data.submitPayments(payments, function(err, batchItemResponse) {
        if (err) {
            this.setState({loading: false});
        } else {
            console.log(batchItemResponse); 
            this.setState({ 
                alert: { 
                    type: 'alert-success', 
                    message: 'Payments applied', 
                    strong: 'Success! '
                },
                payments: this.state.payments.clear() 
            });
            this._getCustomerData(1, true); 
        }
    }.bind(this));   
  } 
  
  handleCustomers(result) {
    if (result.crumb) {
      window.crumb(result.crumb);
    }
    const data = result.QueryResponse;
    console.log('store handleCustomers: ' + data);
    
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
      customers: Immutable.List(data.Customer), 
      invoices: Immutable.Map(data.Invoice),
      next: next,
      previous: data.startPosition === 1 ? null : ( data.startPosition - data.maxResults >= 1 ? data.startPosition - data.maxResults  : 1)
    });
  }
  
}

let stores = {};

stores.CustomerStore = CustomerStore;
stores.AlertStore = AlertStore;

module.exports = stores;