'use strict';

import React from 'react/addons';
import classnames from 'classnames';
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
      pageSize: React.PropTypes.number.isRequired,
      payments: React.PropTypes.object,
      previous: React.PropTypes.string,
      totalCount: React.PropTypes.number
    },

    componentDidMount() {
      this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: this.props.pageSize, offset: 1, count: true});
    },

    _submitPayments() {//will have customerRef,List of amount / inv Ids
      //const customerStore = this.props.flux.getStore('customers');
      //const payments = customerStore.getPayments();
      this.props.flux.getActions('customers').submitPayments(this.props.payments);
    },

    _toggleExpanded() {
      this.props.flux.getActions('customers').toggleExpanded();
    },

    _navigate(offset) {
      console.log('_navigate', offset);
      this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: this.props.pageSize, offset, count: false});
    },

    render() {
        console.log('CustomerS render');
        const pageSize = this.props.pageSize;
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
        let pages = null;
        if (this.props.totalCount) {
            const numPages = Math.floor(this.props.totalCount / pageSize) + (this.props.totalCount % pageSize > 0 ? 1 : 0);
            let pageElements = _(numPages).times(function(i) {

              let offset = i * pageSize + 1;
              let classes;
              if (this.props.previous && this.props.next) {
                classes = classnames({
                  active: (this.props.previous < offset && offset < this.props.next),
                  disabled: this.props.loading
                });
              } else if (this.props.previous) {
                classes = classnames({
                  active: i === (numPages - 1)
                });
              } else {
                classes = classnames({
                  active: i === 0
                });
              }

              return <li className={classes} key={i}><a href={'#' + offset} onClick={this._navigate.bind(null, offset)}>{i + 1}</a></li>;
            }, this);
            const nextClass = classnames({ disabled: !this.props.next || this.props.loading });
            const prevClass = classnames({ disabled: !this.props.previous || this.props.loading });
            pageElements.unshift(
                 <li className={prevClass} key={'prev'}><a href={'#' + this.props.previous} onClick={this.props.previous && !this.props.loading ? this._navigate.bind(null, this.props.previous) : null}>&larr; Previous</a></li>
            );
            pageElements.push(
                 <li className={nextClass} key={'next'}><a href={'#' + this.props.next} onClick={this.props.next && !this.props.loading ? this._navigate.bind(null, this.props.next) : null}>Next &rarr;</a></li>
            );
            pages = (
              <nav>
                <ul className="pagination">
                  {pageElements}
                </ul>
              </nav>);
        }
        return (
            <div className="col-lg-9">
            <div className="row">
                <div className="col-md-6 col-md-offset-6">
                    <ButtonToolbar>
                        <Button bsStyle="primary" disabled={this.props.payments.size < 1} onClick={this._deselectAll}>Deselect All</Button>
                        <Button bsStyle="info" onClick={this._toggleExpanded}>Collapse/Expand</Button>
                        <Button bsStyle="success" disabled={this.props.payments.size < 1} onClick={this._submitPayments}>Pay Selected</Button>
                        {spinner}
                    </ButtonToolbar>
                </div>
            </div>
            <Row>
                <Col md={6} mdOffset={6}>
                    {pages}
                </Col>
            </Row>
            <div className="row">

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
            </div>
            </div>
        );
    }
});

module.exports = Customers;
