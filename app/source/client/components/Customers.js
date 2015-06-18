'use strict';

import React from 'react/addons';
import Customer from './Customer';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

const Customers = React.createClass({

    propTypes: {
      customers: React.PropTypes.object,
      flux: React.PropTypes.object
    },


    render() {
        console.log('CustomerS render');
        const custs = this.props.customers.map((c, index) => {
            console.log('mapping customers:', index);
            return <Customer customer={c} key={index} />;
        });//TODO refactor when immutable object can be rendered correctly in Bootstrap
        const loader = this.props.loading ?
          (<div className="ui active inverted dimmer">
            <div className="ui text loader">Loading</div>
          </div>) : null;
        return (
              <div className="row">
                {loader}
                <table className="ui table">
                  <thead>
                    <tr>
                     {['Address', 'Customer', 'Invoices', 'Open Balance', 'Id'].map((h, i) => {
                       return <th key={i}>{h}</th>;
                     })}
                    </tr>
                  </thead>
                  <ReactCSSTransitionGroup component="tbody" transitionName="tenants">
                    {custs}
                  </ReactCSSTransitionGroup>
                </table>
              </div>
        );
    }
});

module.exports = Customers;
