'use strict';

import React from 'react/addons';
import classnames from 'classnames';
import Customer from './Customer';
import Spinner from 'react-spinkit';
import {Table, ButtonToolbar, Button, Row, Col} from 'react-bootstrap';
import _ from 'underscore';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

const Customers = React.createClass({

    propTypes: {
      customers: React.PropTypes.array.isRequired,
      expanded: React.PropTypes.bool.isRequired,
      flux: React.PropTypes.func.isRequired,
      invoices: React.PropTypes.object.isRequired,
      loading: React.PropTypes.bool.isRequired,
      next: React.PropTypes.string,
      pageSize: React.PropTypes.number.isRequired,
      payments: React.PropTypes.object.isRequired,
      previous: React.PropTypes.string,
      totalCount: React.PropTypes.number
    },

    getInitialState() {
      return {};
    },

    componentDidMount() {
      this.customerActions = this.props.flux.getActions('customers');
    },

    shouldComponentUpdate(nextProps, nextState) {
      return true;
      /* (
            ! Immutable.is(this.props.customers, nextProps.customers) ||
            ! Immutable.is(this.props.payments, nextProps.payments) ||
            ! Immutable.is(this.props.invoices, nextProps.invoices) ||
            nextProps.expanded !== this.props.expanded ||
            nextProps.isSubmitting !== this.props.isSubmitting ||
            nextProps.loading !== this.props.loading ||
            nextProps.previous !== this.props.previous ||
            nextProps.next !== this.props.next ||
            nextProps.totalCount !== this.props.totalCount
        );*/
    },

    _updatePayments(customerId, invoices) {
      this.customerActions.updatePayments(customerId, invoices);
    },

    _submitPayments() {//will have customerRef,List of amount / inv Ids

    },

    _toggleExpanded() {
      this.customerActions.toggleExpanded();
    },

    _navigate(offset) {
      this.customerActions.getCustomers({asc: 'CompanyName', limit: this.props.pageSize, offset, count: false});
    },

    render() {
        const pageSize = this.props.pageSize;
        const custs = this.props.customers.map((c, index) => {
            let selected = this.props.payments.has(c.Id);
            return (<Customer
                    callback={this._updatePayments}
                    count={index + 1}
                    customer={c}
                    expanded={this.props.expanded}
                    invoices={this.props.invoices.get(c.Id)}
                    isSubmitting={false/*selected && this.state.loading*/}
                    key={index}
                    selected={selected} />);

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
                       {_.map(['Address', 'Customer', 'Invoices', 'Open Balance'], (h, i) => {
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
