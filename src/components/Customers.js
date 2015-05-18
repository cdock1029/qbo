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
        return { customers: Immutable.List(), invoices: Immutable.Map(), payments: Immutable.Map(), expanded: true, isSubmitting: false, loading: false};
    },
    
    shouldComponentUpdate(nextProps, nextState) {
        return ( 
            ! Immutable.is(this.state.customers, nextState.customers) || 
            ! Immutable.is(this.state.payments, nextState.payments) || 
            nextState.expanded !== this.state.expanded ||
            nextState.isSubmitting !== this.state.isSubmitting ||
            nextState.loading !== this.state.loading ||
            nextState.previous !== this.state.previous ||
            nextState.next !== this.state.next ||
            nextState.totalCount !== this.state.totalCount
        );
    },
    
    _getCustomerData(offset, getCount) {
        this.setState({loading: true});
        Data.getCustomers({asc: 'CompanyName', limit: pageSize, offset: offset, count: getCount}, function(err, data) {
            if (this.isMounted()) {
                if (err) {
                    console.log('customer Data Error:', err);
                    this.setState({ alert: {className: 'alert alert-danger', message: err, loading: false} })   
                } else {
                    console.log('customer data returned'); 
                    var customerList = this.state.customers;
                    this.setState({
                        totalCount: data.totalCount ? data.totalCount : this.state.totalCount,
                        loading: false,
                        invoices: Immutable.Map(data.Invoice),
                        customers: Immutable.List(data.Customer),
                        next: data.maxResults === pageSize ? data.startPosition + data.maxResults : null,
                        previous: data.startPosition === 1 ? null : ( data.startPosition - data.maxResults >= 1 ? data.startPosition - data.maxResults  : 1)
                    });  
                }
            }
        }.bind(this));
    },
    
    componentDidMount() {
        //window.PAY = this.state.payments;
        this._getCustomerData(1, true);
    },
    
    _updatePayments(customerId, invoices) {
        console.log('Customers _updatePayments  customerId: %s invoices: %O', customerId, invoices);
        var paymentsMap = this.state.payments;
        var updatedMap;
        //var customerObject = paymentsMap.get(customerId); 
            
        if (invoices){//customerObject) {
            updatedMap = paymentsMap.set(customerId, {customerId: customerId, invoices: invoices}); 
        } else {
            updatedMap = paymentsMap.delete(customerId);//, {customerId: customerId, invoices: invoices});
        }
        console.log('Customers _updatePayments  Map.get:', updatedMap.get(customerId));
        this.setState({ payments: updatedMap });
    },
    
    _submitPayments() {//will have customerRef,List of amount / inv Ids
        this.setState({isSubmitting: true});
        var payments = this.state.payments.toObject(); 
        Data.submitPayments(payments, function(err, batchItemResponse) {
            if (err) {
                this.setState({isSubmitting: false});
            } else {
                console.log(batchItemResponse); 
                this.setState({ 
                    alert: { 
                        type: 'alert-success', 
                        message: 'Payments applied', 
                        strong: 'Success! '
                    },
                    isSubmitting: false,
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
        console.log('pageItem clicked');
        this._getCustomerData(offset);
    },
    
    render() {
        console.log('Customers: render');
        var alert = this.state.alert;
        var alertDiv = alert ?
                        <Alert type={alert.type} message={alert.message} strong={alert.strong} /> : 
                        null;
            
        var custs = this.state.customers.map((c, index) => {
            var selected = this.state.payments.has(c.Id);
            
            return <Customer 
                    customer={c} 
                    invoices={this.state.invoices.get(c.Id)}
                    count={index + 1}
                    key={index} 
                    callback={this._updatePayments} 
                    selected={selected} 
                    isSubmitting={selected && this.state.isSubmitting} 
                    expanded={this.state.expanded} />;
            
        });
        var spinner = this.state.loading ? 
                        <Button disabled>
                            <Spinner spinnerName='three-bounce' />
                        </Button> : 
                        null;
        var pages = null;
        if (this.state.totalCount) {
            var numPages = Math.floor(this.state.totalCount / pageSize) + (this.state.totalCount % pageSize > 0 ? 1 : 0);
            var pageElements = _(numPages).times(function(i) {
                
                        var offset = i * pageSize + 1; 
                        var classes;
                        if (this.state.previous && this.state.next) {
                            classes = classnames({
                                active: (this.state.previous < offset &&  offset < this.state.next),
                                disabled: this.state.loading
                            }); 
                        } else if (this.state.previous) {
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
            var nextClass = classnames({ disabled: !this.state.next || this.state.loading });
            var prevClass = classnames({ disabled: !this.state.previous || this.state.loading });
            pageElements.unshift(
                 <li className={prevClass} key={'prev'}><a href={'#' + this.state.previous} onClick={this.state.previous && !this.state.loading ? this._navigate.bind(null, this.state.previous): null}>&larr; Previous</a></li>
            );
            pageElements.push(
                 <li className={nextClass} key={'next'}><a href={'#' + this.state.next} onClick={this.state.next && !this.state.loading ? this._navigate.bind(null, this.state.next): null}>Next &rarr;</a></li>
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
                        <Button bsStyle="primary" onClick={this._deselectAll} disabled={this.state.payments.size < 1}>Deselect All</Button> 
                        <Button bsStyle="info" disabled onClick={this._toggleExpanded}>Collapse/Expand</Button> 
                        <Button bsStyle="success" onClick={this._submitPayments} disabled={this.state.payments.size < 1}>Pay Selected</Button> 
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
