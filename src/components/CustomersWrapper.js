import React from 'react/addons';
import FluxComponent from 'flummox/component';
import Customers from './Customers';
import { PAGE_SIZE } from '../flux/Constants';

class CustomersWrapper extends React.Component {
  
  render() {
    return (
      <FluxComponent connectToStores={'customers'}>
        <Customers pageSize={PAGE_SIZE} /> 
      </FluxComponent>       
    );
  } 
  
  componentDidMount() {
    console.log('CustomersWrapper componentDidMount');
    this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: PAGE_SIZE, offset: 1, count: true});  
  }
  
}

module.exports = CustomersWrapper;