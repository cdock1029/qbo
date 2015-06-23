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
      nextProps.selected !== this.props.selected ||

      /* input state */
      nextState.showInput !== this.state.showInput ||
      nextState.inputValue !== this.state.inputValue;
  }

  constructor(props) {
    super(props);
    this.state = {showInput: false, inputValue: 0};
  }

  _handleSelectFullBalance(event) {
    const update = this.context.flux.getActions('customers').updatePayments;

    if (this.props.selected) {
      update(this.props.customer.get('Id'), null);
    } else {
      update(this.props.customer.get('Id'), this.props.invoices);//this.state.invoices);
    }

  }

  _handleInputChange(e) {
    this.setState({inputValue: e.target.value});
  }

  _handleHideInput(e) {
    this.setState({inputValue: 0, showInput: false});
  }

  _handleShowInput(e) {
    this.setState({showInput: true});
  }

  render() {
    const customer = this.props.customer;
    console.log('render ...Customer -', customer.get('Id'));

    const paymentCell = this.state.showInput ?
      (<div className="ui big action input">
        <input min="0" onChange={this._handleInputChange.bind(this)} placeholder="Enter amount" type="number" value={this.state.inputValue || null}/>
        <button className="ui purple basic icon button" onClick={this._handleHideInput.bind(this)}>
          <i className="remove icon"></i>
        </button>
      </div>) :
      (<div className={cx(this.props.selected ? '' : 'ui buttons')}>
        <button className={cx('large', 'ui', this.props.selected ? 'green' : 'left attached green basic', 'button')} onClick={this._handleSelectFullBalance.bind(this)}>{accounting.formatMoney(customer.get('Balance'))}</button>
        {this.props.selected ? <noscript /> : <button className="large right attached ui purple basic icon button" onClick={this._handleShowInput.bind(this)}><i className="edit icon"/></button>}
      </div>);
    const cells = [
      {content: <h5>{customer.get('Id')}</h5>},
      {content: <h5>{customer.get('CompanyName')}</h5>},
      {content: <p>{customer.get('DisplayName')}</p>},
      {content: <Invoices expanded={this.props.expanded} invoices={this.props.invoices} />},
      {content: paymentCell}
    ];
    return (
      <tr>
        {cells.map( (c, index) => {
          return <td key={index}>{c.content}</td>;
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
