'use strict';

import React from 'react/addons';
import FluxComponent from 'flummox/component';
import Customers from './Customers';
import { PAGE_SIZE } from '../flux/Constants';

const CustomersWrapper = React.createClass({

  propTypes: {
    flux: React.PropTypes.object
  },

  componentDidMount() {
    //this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: PAGE_SIZE, offset: 1, count: true});
  },

  render() {
    return (
      <FluxComponent connectToStores={{
        customers: store => ({
          customers: store.getCustomers(),
          next: store.getNext(),
          previous: store.getPrevious(),
          payments: store.getPayments(),
          loading: store.getLoading(),
          totalCount: store.getTotalCount()
        })
      }}>
        <Customers pageSize={PAGE_SIZE} />
      </FluxComponent>
    );
  }

});

module.exports = CustomersWrapper;
