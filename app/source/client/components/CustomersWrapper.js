'use strict';

import React from 'react/addons';
import FluxComponent from 'flummox/component';
import Customers from './Customers';

const CustomersWrapper = React.createClass({

  propTypes: {
    flux: React.PropTypes.object
  },

  render() {
    console.log('render .CustomerWrapper');
    return (
      <FluxComponent connectToStores={{
        customers: store => ({
          customers: store.getCustomers(),
          loading: store.getLoading()
        })
      }}>
        <Customers />
      </FluxComponent>
    );
  }

});

module.exports = CustomersWrapper;
