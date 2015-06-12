'use strict';

import React from 'react/addons';
import classnames from 'classnames';
import FluxComponent from 'flummox/component';
import CustomersWrapper from './CustomersWrapper';
import {ButtonToolbar, Button, Row, Col, Alert, Navbar} from 'react-bootstrap';
import _ from 'underscore';
import Spinner from 'react-spinkit';
const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

const App = React.createClass({

    propTypes: {
      alerts: React.PropTypes.array,
      flux: React.PropTypes.object,
      loading: React.PropTypes.bool,
      next: React.PropTypes.string,
      pageSize: React.PropTypes.number,
      payments: React.PropTypes.object,
      previous: React.PropTypes.string,
      totalCount: React.PropTypes.number
    },

    _submitPayments() {
      //const payments = this.props.flux.getStore('customers').getPayments();

      if (!_.isEmpty(this.props.payments)) {
        this.props.flux.getActions('customers').submitPayments(this.props.payments);
      }
    },

    _dismissAlert(index) {
      console.log('_dismissAlert: ' + index);
      this.props.flux.getActions('customers').removeAlert(index);
    },

    _toggleExpanded() {
      this.props.flux.getActions('customers').toggleExpanded();
    },

    _navigate(offset) {
      console.log('_navigate', offset);
      this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: this.props.pageSize, offset, count: false});
    },

    _deselectAll() {
      this.props.flux.getActions('customers').clearAllPayments();
    },

    render() {
        const alerts = this.props.alerts.map((alert, index) => {
          return (<Alert bsStyle={alert.style} key={index} onDismiss={this._dismissAlert.bind(null, index)}>
            {alert.message}
          </Alert>);
        });

      let pages = null;
      const pageSize = this.props.pageSize;
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
        console.log('PageElements: ', pageElements);
        const nextClass = classnames({ disabled: !this.props.next || this.props.loading });
        const prevClass = classnames({ disabled: !this.props.previous || this.props.loading });
        pageElements.unshift(
          <li className={prevClass} key={'prev'}><a href={'#' + this.props.previous} onClick={this.props.previous && !this.props.loading ? this._navigate.bind(null, this.props.previous) : null}>&larr; Previous</a></li>
        );
        pageElements.push(
          <li className={nextClass} key={'next'}><a href={'#' + this.props.next} onClick={this.props.next && !this.props.loading ? this._navigate.bind(null, this.props.next) : null}>Next &rarr;</a></li>
        );
        pages = (
          <nav className="text-center">
            <ul className="pagination">
              {pageElements}
            </ul>
          </nav>);
      }
      const spinner = (
        <Button className="navbar-btn" disabled style={{display: this.props.loading ? 'inline-block' : 'none'}}>
          <Spinner noFadeIn spinnerName='three-bounce'/>
        </Button>);
        return (
          <div>
            <Navbar className="subNavbar" fixedTop>
              <div className="container-fluid">
                <nav className="text-center">
                  <ButtonToolbar>
                    {/*<Button bsStyle="primary" className="navbar-btn" disabled={_.isEmpty(this.props.payments)} onClick={this._deselectAll}>Deselect All</Button>
                    <Button bsStyle="info" className="navbar-btn" onClick={this._toggleExpanded}>Collapse/Expand</Button>*/}
                    <Button bsStyle="info" className="navbar-btn" disabled={this.props.payments.size < 1} onClick={this._submitPayments}>Pay Selected</Button>
                    {spinner}
                  </ButtonToolbar>
                </nav>
              </div>
            </Navbar>
            <Row>
              <Col md={8} mdOffset={2}>
                <ReactCSSTransitionGroup transitionName="alerts">
                  {alerts}
                </ReactCSSTransitionGroup>
              </Col>
            </Row>
            <Row>
              <FluxComponent>
                <CustomersWrapper />
              </FluxComponent>
            </Row>

            <Navbar fixedBottom inverse>
              <div className="container-fluid">
                {pages}
              </div>
            </Navbar>
          </div>
        );
    }
});

export default App;
