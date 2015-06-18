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
      previous: React.PropTypes.string,
      totalCount: React.PropTypes.number
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

    render() {
        const alerts = this.props.alerts.map((alert, index) => {
          return (<Alert bsStyle={alert.style} key={index} onDismiss={this._dismissAlert.bind(null, index)}>
            {alert.message}
          </Alert>);
        }).toJS();//TODO refactor when immutable object can be rendered correctly in Bootstrap

      let pages = null;
      const pageSize = this.props.pageSize;
      if (this.props.totalCount) {
        const numPages = Math.floor(this.props.totalCount / pageSize) + (this.props.totalCount % pageSize > 0 ? 1 : 0);
        let pageElements = _(numPages).times(function(i) {

          let offset = i * pageSize + 1;
          let classes;
          let el, test;
          if (this.props.previous && this.props.next) {
            test = this.props.previous < offset && offset < this.props.next;
            el = test ? React.DOM.div : React.DOM.a;
            classes = classnames({
              active: test,
              disabled: this.props.loading || test,
              item: true
            });
          } else if (this.props.previous) {
            test = i === (numPages - 1);
            el = test ? React.DOM.div : React.DOM.a;
            classes = classnames({
              active: test,
              disabled: test,
              item: true
            });
          } else {
            test = i === 0;
            el = test ? React.DOM.div : React.DOM.a;
            classes = classnames({
              active: test,
              disabled: test,
              item: true
            });
          }
          return el({className: classes, key: i, onClick: test ? null : this._navigate.bind(null, offset)}, i + 1);
        }, this);

        let nextTest = !this.props.next || this.props.loading, prevTest = !this.props.previous || this.props.loading;
        let nextEl = nextTest ? React.DOM.div : React.DOM.a, prevEl = prevTest ? React.DOM.div : React.DOM.a;

        const nextClass = classnames({ disabled: nextTest, icon: true, item: true });
        const prevClass = classnames({ disabled: prevTest, icon: true, item: true });
        pageElements.unshift(
          prevEl({className: prevClass, key: 'prev', onClick: this.props.previous && !this.props.loading ? this._navigate.bind(null, this.props.previous) : null}, <i className="left arrow icon"></i>)
        );
        pageElements.push(
          nextEl({className: nextClass, key: 'next', onClick: this.props.next && !this.props.loading ? this._navigate.bind(null, this.props.next) : null}, <i className="right arrow icon"></i>)
        );
        pages = (
          <div className="ui pagination menu">
            {pageElements}
          </div>
        );
      }
      const loader = this.props.loading ? (
        <div className="ui active dimmer">
          <div className="ui large text loader">Loading</div>
        </div>
      ) : null;
        return (
          <div className="ui centered grid">
            {loader}

            <div className="row">
              <div className="column">
                <ReactCSSTransitionGroup transitionName="alerts">
                  {alerts}
                </ReactCSSTransitionGroup>
              </div>
            </div>
            <div className="row">
              <FluxComponent>
                <CustomersWrapper />
              </FluxComponent>
            </div>

            <div className="ui bottom fixed menu centered">
              {pages}
            </div>
          </div>
        );
    }
});

export default App;
