'use strict';

import React from 'react/addons';
import connectToStores from 'flummox/connect';
import accounting from 'accounting';
import Invoices from './Invoices';
import {Button} from 'react-bootstrap';

class Customer extends React.Component {

  _handleChange(event) {
    console.log('_handleChange', arguments);
    const update = this.context.flux.getActions('customers').updatePayments;

    if (this.props.selected) {
      update(this.props.customer.get('Id'), null);
    } else {
      update(this.props.customer.get('Id'), this.props.invoices);//this.state.invoices);
    }

  }

  render() {
    const customer = this.props.customer;
    console.log('Customer render:', customer.get('Id'));
    const cells = [
      {content: customer.get('CompanyName')},
      {content: <p>{customer.get('DisplayName')}</p>},
      {content: <Invoices expanded={this.props.expanded} invoices={this.props.invoices} />},
      {content: <Button bsSize="large" bsStyle={this.props.selected ? 'success' : 'default'} onClick={this._handleChange.bind(this)}>{accounting.formatMoney(customer.get('Balance'))}</Button>},
      {content: <h5>{customer.get('Id')}</h5>}
    ];
    return (
      <tr>
        {cells.map( (c, index) => {
          return <td key={index} onClick={c.onClick}>{c.content}</td>;
        })}
      </tr>
    );
  }
}
Customer.propTypes = {
  customer: React.PropTypes.object,
  expanded: React.PropTypes.bool,
  invoices: React.PropTypes.object,
  selected: React.PropTypes.bool
};

Customer.contextTypes = {
  flux: React.PropTypes.object
};

Customer = connectToStores(Customer, {
  customers: (store, props) => ({
    expanded: store.getExpanded(),
    invoices: store.getInvoices(props.customer.get('Id')),
    selected: store.getIsSelected(props.customer.get('Id'))
  })
});

export default Customer;
