'use strict';

import React from 'react/addons';
import classnames from 'classnames';

module.exports = React.createClass({

  propTypes: {
    flux: React.PropTypes.object,
    payments: React.PropTypes.object
  },

  _submitPayments() {

    if (this.props.payments && !this.props.payments.isEmpty()) {
      this.props.flux.getActions('customers').submitPayments(this.props.payments.toJS());
    }
  },

  render() {
    return <button className={classnames({ui: true, primary: true, button: true, disabled: !this.props.payments || this.props.payments.size < 1})} onClick={this._submitPayments}>Pay Selected</button>;
  }
});
