'use strict';

import React from 'react/addons';
import Customer from './Customer';
import FluxComponent from 'flummox/component';
import Spinner from 'react-spinkit';
import {Table, ButtonToolbar, Button, Row, Col} from 'react-bootstrap';
import _ from 'underscore';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

const Customers = React.createClass({

    propTypes: {
      customers: React.PropTypes.array,
      flux: React.PropTypes.object,
      loading: React.PropTypes.bool,
      next: React.PropTypes.string,
      payments: React.PropTypes.object,
      previous: React.PropTypes.string,
      totalCount: React.PropTypes.number
    },

    _submitPayments() {//will have customerRef,List of amount / inv Ids
      //const customerStore = this.props.flux.getStore('customers');
      //const payments = customerStore.getPayments();
      this.props.flux.getActions('customers').submitPayments(this.props.payments);
    },

    render() {
        console.log('CustomerS render');
        const custs = this.props.customers.map((c, index) => {
            return (
              <FluxComponent connectToStores={{
                customers: store => ({
                  expanded: store.getExpanded(),
                  invoices: store.getInvoices(this.props.customers[index] && this.props.customers[index].Id),
                  selected: store.getIsSelected(this.props.customers[index] && this.props.customers[index].Id)
                })
              }} key={index}>
                <Customer
                  count={index + 1}
                  customer={c} />
              </FluxComponent>);

        });
        const spinner = (
          <Button disabled style={{display: this.props.loading ? 'inline-block' : 'none'}}>
            <Spinner noFadeIn spinnerName='three-bounce'/>
          </Button>);
        return (
          <Col lg={9}>
              <Row>
                <div className="col-md-6 col-md-offset-6">
                  <ButtonToolbar>
                    <Button bsStyle="primary" disabled={this.props.payments.size < 1} onClick={this._deselectAll}>Deselect All</Button>
                    <Button bsStyle="info" onClick={this._toggleExpanded}>Collapse/Expand</Button>
                    <Button bsStyle="success" disabled={this.props.payments.size < 1} onClick={this._submitPayments}>Pay Selected</Button>
                    {spinner}
                  </ButtonToolbar>
                </div>
              </Row>

              <Row>
                <Table condensed>
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
