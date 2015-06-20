'use strict';

import React from 'react/addons';
import connectToStores from 'flummox/connect';
import accounting from 'accounting';
import Invoices from './Invoices';
import cx from 'classnames';

class Customer extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.customer !== this.props.customer ||
      nextProps.expanded !== this.props.expanded ||
      nextProps.invoices !== this.props.invoices ||
      nextProps.selected !== this.props.selected;
  }

  _handleChange(event) {
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
      {content: <button className={cx('large', 'ui', 'button', this.props.selected ? 'green' : 'basic')} onClick={this._handleChange.bind(this)}>{accounting.formatMoney(customer.get('Balance'))}</button>},
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
