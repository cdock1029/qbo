//var React = require('react');
var Data = require('../flux/Data'),
    classnames = require('classnames'),
    Table = require('./Table'),
    Customer = require('./Customer'),
    accounting = require('accounting'),
    Immutable = require('immutable'),
    Alert = require('./Alert'),
    Spinner = require('react-spinkit'),
    {ButtonToolbar, Button, Row, Col, Pager, PageItem} = require('react-bootstrap'), 
    _ = require('underscore');

var pageSize = 30;

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
            nextState.next !== this.state.next
        );
    },
    
    _getCustomerData(offset) {
        this.setState({loading: true});
        Data.getCustomers({asc: 'CompanyName', limit: pageSize, offset: offset},function(err, data) {
            if (this.isMounted()) {
                if (err) {
                    console.log('customer Data Error:', err);
                    this.setState({ alert: {className: 'alert alert-danger', message: err} })   
                } else {
                    console.log('customer data returned'); 
                    var customerList = this.state.customers;
                    this.setState({
                        loading: false,
                        invoices: Immutable.Map(data.Invoice),
                        customers: Immutable.List(data.Customer),//customerList.merge(customers),
                        next: data.maxResults === pageSize ? data.startPosition + data.maxResults : null,
                        previous: data.startPosition === 1 ? null : ( data.startPosition - data.maxResults >= 1 ? data.startPosition - data.maxResults  : 1)
                    });  
                }
            }
        }.bind(this));
    },
    
    componentDidMount() {
        this._getCustomerData(1);
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
                    payments: null
                });
                this._getCustomerData(1); 
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
        return(
            <div className="col-lg-9">
            <div className="row">
                <div className="col-md-6 col-md-offset-6">
                    <ButtonToolbar>
                        <Button bsStyle="success" onClick={this._submitPayments} disabled={this.state.payments.size < 1}>Pay Selected</Button> 
                        <Button bsStyle="info" disabled onClick={this._toggleExpanded}>Collapse/Expand</Button> 
                        <Button bsStyle="primary" onClick={this._deselectAll} disabled={this.state.payments.size < 1}>Deselect All</Button> 
                        {spinner} 
                    </ButtonToolbar>
                </div>
            </div>
            <Row>
                <Col md={6} mdOffset={4}>
                    <Pager>
                        <PageItem previous disabled={!this.state.previous} onClick={this.state.previous ? this._getCustomerData.bind(null, this.state.previous) : null}>&larr; Previous Page</PageItem>
                        <PageItem next disabled={!this.state.next} onClick={this.state.next ? this._getCustomerData.bind(null, this.state.next) : null}>Next Page &rarr;</PageItem> 
                    </Pager> 
                </Col>
            </Row>
            <div className="row">
            
            <Table headings={['Address','Customer', 'Open Balance', 'Invoices']}>
                {custs}
            </Table>
            </div>
            </div>
        );
    }
});
