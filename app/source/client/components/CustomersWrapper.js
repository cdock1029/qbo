'use strict';

import React from '../../../../node_modules/react/addons';
import FluxComponent from '../../../../node_modules/flummox/component';
import Customers from './Customers';
import { CustomerStore } from '../flux/Stores';

const CustomersWrapper = React.createClass({

  propTypes: {
    flux: React.PropTypes.object
  },

  componentDidMount() {
    this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: CustomerStore.getPageSize(), offset: 1, count: true, fields: ['CompanyName', 'DisplayName', 'Balance']});
  },

  render() {
    return (
      <FluxComponent connectToStores={{
        customers: store => ({
          customers: store.getCustomers()
        })
      }}>
        <Customers />
      </FluxComponent>
    );
  }

});

module.exports = CustomersWrapper;
