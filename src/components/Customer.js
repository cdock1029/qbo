'use strict';

import React from 'react/addons';
import accounting from 'accounting';
import _ from 'underscore';
import Invoices from './Invoices';
import {Button} from 'react-bootstrap';

module.exports = React.createClass({

  propTypes: {
    customer: React.PropTypes.object,
    expanded: React.PropTypes.bool,
    flux: React.PropTypes.object,
    invoices: React.PropTypes.array,
    selected: React.PropTypes.bool
  },

  //mixins: [React.addons.PureRenderMixin],

  _handleChange(event) {
    console.log('_handleChange', arguments);
    const update = this.props.flux.getActions('customers').updatePayments;

    if (this.props.selected) {
      update(this.props.customer.Id, null);
    } else {
      update(this.props.customer.Id, this.props.invoices);//this.state.invoices);
    }

  },

  render() {
    const customer = this.props.customer;
    console.log('Customer render:', customer.Id);
    const cells = [
      {content: customer.CompanyName},
      {content: <p>{customer.DisplayName}</p>},
      {content: <Invoices expanded={this.props.expanded} invoices={this.props.invoices} />},
      {content: <Button bsSize="large" bsStyle={this.props.selected ? 'success' : 'default'} onClick={this._handleChange}>{accounting.formatMoney(customer.Balance)}</Button>},
      {content: <h5>{customer.Id}</h5>}
    ];
    return (
      <tr>
        {_.map(cells, (c, index) => {
          return <td key={index} onClick={c.onClick}>{c.content}</td>;
        })}
      </tr>
    );
  }

});
