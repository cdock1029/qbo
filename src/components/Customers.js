//var React = require('react'),
var Data = require('../Data'),
    Customer = require('./Customer'),
    accounting = require('accounting'),
    Immutable = require('immutable'),
    _ = require('underscore');


module.exports = React.createClass({
    getInitialState() {
        return { customers: Immutable.List(), payments: Immutable.Map({whatever: Immutable.Set.of(4,5)}) };
    },
    
    shouldComponentUpdate(nextProps, nextState) {
        return  ! Immutable.is(this.state.customers, nextState.customers) || ! Immutable.is(this.state.payments, nextState.payments);
    },
    
    componentDidMount() {
        //console.log('component did mount');
        Data.getCustomers({asc: 'CompanyName', limit: 20},function(err, data) {
            console.log('customer data returned'); 
            //console.log(data);
            if (this.isMounted()) {
                var customerList = this.state.customers;
                
                this.setState({customers: customerList.merge(data)});  
            }  
          
        }.bind(this));
        
    },
    
    _updatePayments(customerId, invoiceIds) {
        var paymentsMap = this.state.payments,
            updatedMap,
            customerIdSet = paymentsMap.get(customerId); 
            
        if (customerIdSet) {
            updatedMap = paymentsMap.set(customerId, customerIdSet.merge(invoiceIds)); 
        } else {
            updatedMap = paymentsMap.set(customerId, Immutable.Set.of(invoiceIds));
        }
        this.setState({ payments: updatedMap });
    },
    
    _submitPayments() {//will have customerRef,List of amount / inv Ids
    
        Data.submitPayments(this.state.payments, function(batchItemResponse) {
            alert('Payments submitted!');
            console.log(batchItemResponse); 
        }) 
    },
    
    render() {
        
        console.log('Customers: render');
        var custs = this.state.customers.map((c, index) => {
            return <Customer customer={c.toObject()} key={index} callback={this._updatePayments}/>;
        });
        return(
            <div className="col-lg-10">
            <div className="row">
                <div className="col-md-6 col-md-offset-6">
                    <button onClick={this._updatePayments.bind(null, 'whatever', [1,2,3])}>Pay Selected</button>
                </div>
            </div>
            
            <div className="row">
            <table className="table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Balance</th>
                    <th>Invoices</th>
                </tr>
                </thead>
                <tbody>
                    {custs}
                </tbody>
            </table>
            
            </div>
            </div>
        );
    }
});
