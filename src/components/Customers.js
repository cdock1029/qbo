//var React = require('react'),
var Data = require('../flux/Data'),
    Table = require('./Table'),
    Customer = require('./Customer'),
    accounting = require('accounting'),
    Immutable = require('immutable'),
    Alert = require('./Alert'),
    _ = require('underscore');


module.exports = React.createClass({
    getInitialState() {
        return { customers: Immutable.List(), payments: Immutable.Map() };
    },
    
    shouldComponentUpdate(nextProps, nextState) {
        return ! Immutable.is(this.state.customers, nextState.customers) || ! Immutable.is(this.state.payments, nextState.payments);
    },
    
    _getCustomerData() {
        
        Data.getCustomers({asc: 'CompanyName', limit: 20},function(err, data) {
            
            if (this.isMounted()) {
                if (err) {
                    console.log('customer Data Error:', err);
                    this.setState({ alert: {className: 'alert alert-danger', message: err} })   
                } else {
                    console.log('customer data returned'); 
                    var customerList = this.state.customers;
                    this.setState({customers: customerList.merge(data)});  
                }
            }
        }.bind(this));
    },
    
    componentDidMount() {
        this._getCustomerData();
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
        var payments = this.state.payments.toObject(); 
        Data.submitPayments(payments, function(err, batchItemResponse) {
            if (err) {
                
            } else {
                console.log(batchItemResponse); 
                this.setState({ alert: { type: 'alert-success', message: 'Payments applied', strong: 'Success! '}})
                this._getCustomerData(); 
            }
        }.bind(this)); 
    },
    
    render() {
        console.log('Customers: render');
        var alert = this.state.alert;
        var alertDiv = alert ?
                        <Alert type={alert.type} message={alert.message} strong={alert.strong} /> : 
                        null;
            
        CUSTS = this.state.customers;
        var custs = this.state.customers.map((c, index) => {
            return <Customer customer={c.toObject()} key={index} callback={this._updatePayments} selected={this.state.payments.has(c.get('Id'))}/>;
        });
        return(
            <div className="col-lg-10">
            <div className="row">
                <div className="col-md-6 col-md-offset-6">
                    <button onClick={this._submitPayments}>Pay Selected</button>
                </div>
            </div>
            
            <div className="row">
            
            <Table headings={['Customer', 'Invoices']} body={custs} />
            </div>
            </div>
        );
    }
});
