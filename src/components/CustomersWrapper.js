'use strict';

import React from 'react/addons';
import FluxComponent from 'flummox/component';
import Customers from './Customers';
import { PAGE_SIZE } from '../flux/Constants';

const CustomersWrapper = React.createClass({

  propTypes: {
    flux: React.PropTypes.object.isRequired
  },

  componentDidMount() {
    this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: PAGE_SIZE, offset: 1, count: true});
  },

  render() {
    return (
      <FluxComponent connectToStores={'customers'}>
        <Customers pageSize={PAGE_SIZE} />
      </FluxComponent>
    );
  }

});

module.exports = CustomersWrapper;
