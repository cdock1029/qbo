'use strict';

import React from 'react/addons';
import Customer from './Customer';
import {Table, Row, Col} from 'react-bootstrap';

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
        }).toJS();//TODO refactor when immutable object can be rendered correctly in Bootstrap

        return (
          <div className="column">
              <div className="row">
                <Table condensed responsive>
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
                </Table>
              </div>
          </div>
        );
    }
});

module.exports = Customers;
