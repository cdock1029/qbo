'use strict';

import React from 'react/addons';
import classnames from 'classnames';
import FluxComponent from 'flummox/component';
import CustomersWrapper from './CustomersWrapper';
import _ from 'underscore';
const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

const App = React.createClass({

    propTypes: {
      alerts: React.PropTypes.array,
      currentPage: React.PropTypes.number,
      flux: React.PropTypes.object,
      loading: React.PropTypes.bool,
      next: React.PropTypes.string,
      pageCount: React.PropTypes.number,
      pageSize: React.PropTypes.number,
      previous: React.PropTypes.string
    },

    componentDidMount() {
      this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: 10, offset: 1, count: true, fields: ['CompanyName', 'DisplayName', 'Balance']});
    },

    shouldComponentUpdate(nP, nS) {
      return nP.alerts !== this.props.alerts ||
          nP.loading !== this.props.loading ||
          nP.next !== this.props.next ||
          nP.previous !== this.props.previous ||
          nP.pageCount !== this.props.pageCount ||
          nP.currentPage !== this.props.currentPage ||
          nP.pageSize !== this.props.pageSize;
    },

    _dismissAlert(index, e) {
      this.props.flux.getActions('customers').removeAlert(index);
    },

    _navigate(pageNumber) {
      console.log('_navigate', pageNumber);
      const isPageLoaded = this.props.flux.getStore('customers').isPageLoaded(pageNumber);
      if (isPageLoaded) {
       // change to page in store
        this.props.flux.getActions('customers').changeCachedPage(pageNumber);
      } else {
        // load more data from server
        const offset = pageNumber * this.props.pageSize + 1;//0 indexed pageNumber
        this.props.flux.getActions('customers').getCustomers({asc: 'CompanyName', limit: this.props.pageSize, offset, count: false}, pageNumber);
      }

    },

    render() {
      console.log('render APP');
      const alerts = this.props.alerts.map((alert, index) => {
        return (
          <div className={classnames({ui: true, message: true}, alert.type)} key={index}>
            <i className="close icon" onClick={this._dismissAlert.bind(null, index)}></i>
            <div className="header">
              {alert.message}
            </div>
          </div>
        );
      }).toJS();//TODO refactor when immutable object can be rendered correctly in Bootstrap

      let pages = null;
      if (this.props.pageCount) {
        let pageElements = _(this.props.pageCount).times(function(i) {

          let classes;
          let test = i === this.props.currentPage;
          let el = test ? React.DOM.div : React.DOM.a;

          classes = classnames({
            active: test,
            disabled: this.props.loading,
            item: true
          });

          return el({className: classes, href: '#' + i, key: i, onClick: test ? null : this._navigate.bind(null, i)}, i + 1);
        }, this);

        const nextTest = !this.props.next || this.props.loading;
        const prevTest = !this.props.previous && this.props.previous !== 0 || this.props.loading; // ! 0 is falsy
        const nextEl = nextTest ? React.DOM.div : React.DOM.a;
        const prevEl = prevTest ? React.DOM.div : React.DOM.a;

        const nextClass = classnames({ disabled: nextTest, icon: true, item: true });
        const prevClass = classnames({ disabled: prevTest, icon: true, item: true });
        pageElements.unshift(
          prevEl({className: prevClass, href: '#' + this.props.previous, key: 'prev', onClick: this.props.previous || this.props.previous === 0 && !this.props.loading ? this._navigate.bind(null, this.props.previous) : null}, <i className="left arrow icon"></i>)
        );
        pageElements.push(
          nextEl({className: nextClass, href: '#' + this.props.next, key: 'next', onClick: this.props.next && !this.props.loading ? this._navigate.bind(null, this.props.next) : null}, <i className="right arrow icon"></i>)
        );
        pages = (
          <div className="ui pagination menu">
            {pageElements}
          </div>
        );
      }
        return (
          <div className="ui page grid main centered">
            <div className="row">
              <div className="column">
                <ReactCSSTransitionGroup transitionName="alerts">
                  {alerts}
                </ReactCSSTransitionGroup>
              </div>
            </div>
            <div className="row">
              <div className="column">
                <FluxComponent>
                  <CustomersWrapper />
                </FluxComponent>
              </div>
            </div>

            <div className="ui bottom fixed menu centered">
              {pages}
            </div>
          </div>
        );
    }
});

export default App;
