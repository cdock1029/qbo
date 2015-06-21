'use strict';

import React from 'react/addons';
import Customer from './Customer';

const Customers = React.createClass({

    propTypes: {
      customers: React.PropTypes.object,
      flux: React.PropTypes.object,
      loading: React.PropTypes.bool
    },

    shouldComponentUpdate(nextProps, nextState) {
      return nextProps.customers !== this.props.customers ||
        nextProps.loading !== this.props.loading;
    },

    render() {
        console.log('render ..Customer(S)');
        const custs = this.props.customers.map((c, index) => {
            return <Customer customer={c} key={index} />;
        });//TODO refactor when immutable object can be rendered correctly in Bootstrap
        const loader = this.props.loading ?
          (<div className="ui active inverted dimmer">
            <div className="ui text loader">Loading</div>
          </div>) : null;
        return (
              <div className="row">
                {loader}
                <table className="ui teal small very compact table">
                  <thead>
                    <tr>
                     {['Address', 'Customer', 'Invoices', 'Open Balance', 'Id', 'Partial Payment'].map((h, i) => {
                       return <th key={i}>{h}</th>;
                     })}
                    </tr>
                  </thead>
                  <tbody>
                    {custs}
                  </tbody>
                </table>
              </div>
        );
    }
});

module.exports = Customers;
