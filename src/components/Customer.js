'use strict';

import React from 'react/addons';
import accounting from 'accounting';
import _ from 'underscore';
import Invoices from './Invoices';
import {Button} from 'react-bootstrap';

module.exports = React.createClass({

  propTypes: {
    callback: React.PropTypes.func,
    customer: React.PropTypes.object,
    expanded: React.PropTypes.bool,
    invoices: React.PropTypes.array,
    selected: React.PropTypes.bool
  },

  mixins: [React.addons.PureRenderMixin],

  _handleChange(event) {

    //console.log('handleChange in Customer selected?', this.props.selected);
    const customerId = this.props.customer.Id;

    if (this.props.selected) {
      this.props.callback(customerId, null);
    } else {
      this.props.callback(customerId, this.props.invoices);//this.state.invoices);
    }

  },

  render() {
    const customer = this.props.customer;
    const cells = [
      {content: customer.CompanyName},
      {content: <p>{customer.DisplayName}</p>},
      {content: <Invoices expanded={this.props.expanded} invoices={this.props.invoices} />},
      {content: <Button bsSize="large" bsStyle={this.props.selected ? 'success' : 'default'} onClick={this._handleChange}>{accounting.formatMoney(customer.Balance)}</Button>}
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
