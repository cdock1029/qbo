'use strict';

var React = require('react/addons');
var Data = require('../flux/Data'),
    classnames = require('classnames'),
    Customer = require('./Customer'),
    accounting = require('accounting'),
    Immutable = require('immutable'),
    Alert = require('./Alert'),
    Spinner = require('react-spinkit'),
    {Table, ButtonToolbar, Button, Row, Col, Pager, PageItem} = require('react-bootstrap'), 
    _ = require('underscore');
    
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var pageSize = 100;

module.exports = React.createClass({
    getInitialState() {
      return {}; 
    },
    shouldComponentUpdate(nextProps, nextState) {
        return true; ( 
            ! Immutable.is(this.props.customers, nextProps.customers) || 
            ! Immutable.is(this.props.payments, nextProps.payments) || 
            ! Immutable.is(this.props.invoices, nextProps.invoices) ||
            nextProps.expanded !== this.props.expanded ||
            nextProps.isSubmitting !== this.props.isSubmitting ||
            nextProps.loading !== this.props.loading ||
            nextProps.previous !== this.props.previous ||
            nextProps.next !== this.props.next ||
            nextProps.totalCount !== this.props.totalCount
        );
    },
    
    _updatePayments(customerId, invoices) {
        //console.log('Customers _updatePayments  customerId: %s invoices: %O', customerId, invoices);
        var paymentsMap = this.state.payments;
        var updatedMap;
            
        if (invoices){//customerObject) {
            updatedMap = paymentsMap.set(customerId, {customerId: customerId, invoices: invoices}); 
        } else {
            updatedMap = paymentsMap.delete(customerId);//, {customerId: customerId, invoices: invoices});
        }
        //console.log('Customers _updatePayments  Map.get:', updatedMap.get(customerId));
        this.setState({ payments: updatedMap });
    },
    
    _submitPayments() {//will have customerRef,List of amount / inv Ids
        this.setState({loading: true});
        var payments = this.state.payments.toObject(); 
        Data.submitPayments(payments, function(err, batchItemResponse) {
            if (err) {
                this.setState({loading: false});
            } else {
                console.log(batchItemResponse); 
                this.setState({ 
                    alert: { 
                        type: 'alert-success', 
                        message: 'Payments applied', 
                        strong: 'Success! '
                    },
                    payments: this.state.payments.clear() 
                });
                this._getCustomerData(1, true); 
            }
        }.bind(this)); 
    },
    
    _toggleExpanded() {
        var newState = !this.state.expanded;
        this.setState({expanded: newState});     
    },
    
    _deselectAll() {
        this.setState({payments: this.state.payments.clear()})  
    },
    
    _navigate(offset) {
        this._getCustomerData(offset);
    },
    
    render() {
        console.log('render Customers. ');
        //debugger;
        var alert = this.props.alert;
        var alertDiv = alert ?
                        <Alert type={alert.type} message={alert.message} strong={alert.strong} /> : 
                        null;
        var custs = this.props.customers.map((c, index) => {
            var selected = this.props.payments.has(c.Id);
            console.log('customer id: ' + c.Id);
            return <Customer 
                    customer={c} 
                    invoices={this.props.invoices.get(c.Id)}
                    count={index + 1}
                    key={index} 
                    callback={this._updatePayments} 
                    selected={selected} 
                    isSubmitting={false/*selected && this.state.loading*/} 
                    expanded={this.props.expanded} />;
            
        });
        var spinner = <Button disabled style={{display: this.props.loading ? 'inline-block' : 'none'}}>
                            <Spinner spinnerName='three-bounce' noFadeIn/>
                        </Button>; 
        var pages = null;
        if (this.props.totalCount) {
            var numPages = Math.floor(this.props.totalCount / pageSize) + (this.props.totalCount % pageSize > 0 ? 1 : 0);
            var pageElements = _(numPages).times(function(i) {
                
                        var offset = i * pageSize + 1; 
                        var classes;
                        if (this.props.previous && this.props.next) {
                            classes = classnames({
                                active: (this.props.previous < offset &&  offset < this.props.next),
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
            var nextClass = classnames({ disabled: !this.props.next || this.props.loading });
            var prevClass = classnames({ disabled: !this.props.previous || this.props.loading });
            pageElements.unshift(
                 <li className={prevClass} key={'prev'}><a href={'#' + this.props.previous} onClick={this.props.previous && !this.props.loading ? this._navigate.bind(null, this.props.previous): null}>&larr; Previous</a></li>
            );
            pageElements.push(
                 <li className={nextClass} key={'next'}><a href={'#' + this.props.next} onClick={this.props.next && !this.props.loading ? this._navigate.bind(null, this.props.next): null}>Next &rarr;</a></li>
            );
            pages = <nav>
                <ul className="pagination">
                    {pageElements}
                </ul>
            </nav>;
        }                 
        return(
            <div className="col-lg-9">
            <div className="row">
                <div className="col-md-6 col-md-offset-6">
                    <ButtonToolbar>
                        <Button bsStyle="primary" onClick={this._deselectAll} disabled={this.props.payments.size < 1}>Deselect All</Button> 
                        <Button bsStyle="info" disabled onClick={this._toggleExpanded}>Collapse/Expand</Button> 
                        <Button bsStyle="success" onClick={this._submitPayments} disabled={this.props.payments.size < 1}>Pay Selected</Button> 
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
                       {_.map(['Address','Customer', 'Invoices', 'Open Balance'], (h, i) => {
                            return <th key={i}>{h}</th>; 
                       })} 
                    </tr>
                </thead>
                <ReactCSSTransitionGroup transitionName="tenants" component="tbody">
                    {custs}
                </ReactCSSTransitionGroup>
            </Table>
            </div>
            </div>
        );
    }
});
