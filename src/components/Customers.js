'use strict';

import React from 'react/addons';
import Customer from './Customer';
import FluxComponent from 'flummox/component';
import {Table, Row, Col} from 'react-bootstrap';
import _ from 'underscore';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

const Customers = React.createClass({

    propTypes: {
      customers: React.PropTypes.array,
      flux: React.PropTypes.object
    },


    render() {
        console.log('CustomerS render');
        const custs = this.props.customers.map((c, index) => {
            console.log('mapping customers:', index);
            return (
              <FluxComponent connectToStores={{
                customers: store => ({
                  expanded: store.getExpanded(),
                  invoices: store.getInvoices(this.props.customers.get(index) && this.props.customers.get(index).Id),
                  selected: store.getIsSelected(this.props.customers.get(index) && this.props.customers.get(index).Id)
                })
              }} key={index}>
                <Customer
                  count={index + 1}
                  customer={c} />
              </FluxComponent>);

        });

        return (
          <Col lg={10} lgOffset={1}>
              <Row>
                <Table condensed responsive>
                  <thead>
                    <tr>
                     {_.map(['Address', 'Customer', 'Invoices', 'Open Balance', 'Id'], (h, i) => {
                       return <th key={i}>{h}</th>;
                     })}
                    </tr>
                  </thead>
                  <ReactCSSTransitionGroup component="tbody" transitionName="tenants">
                    {custs}
                  </ReactCSSTransitionGroup>
                </Table>
              </Row>
          </Col>
        );
    }
});

module.exports = Customers;
