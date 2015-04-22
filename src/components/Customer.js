var Data = require('../flux/Data'),
    accounting = require('accounting'),
    _ = require('underscore'),
    Invoices = require('./Invoices');
    
var TableRow = require('./TableRow');
    

module.exports = React.createClass({
    
    getInitialState() {
        return {invoices: null};     
    },
    
    componentDidMount() {
        
        Data.getInvoices({desc: 'TxnDate', limit: 50, CustomerRef: this.props.customer.Id},function(err, data) {
            
          if (this.isMounted()) {
            this.setState({invoices: data});  
          }  
          
        }.bind(this));
        
    },
    
    handleChange(event) {
        
        console.log('handleChange in Customer selected?', this.props.selected);
        var customerId = this.props.customer.Id;
        
        if (this.props.selected) {
            this.props.callback(customerId, null);
        } else {
            this.props.callback(customerId, this.state.invoices);
        }
        
    },
    
    render() {
        var customer = this.props.customer;
        var customerPanel = (
            <div className="panel panel-default" onClick={this.handleChange} style={{cursor: 'pointer'}}>
                <div className="panel-heading">
                    <h3 className="panel-title">{customer.CompanyName}</h3>
                </div>
                
                <div className="panel-body">
                    <p className={this.props.selected ? 'bg-success' : null}>{accounting.formatMoney(customer.Balance)}</p>
                    <div className="row">
                        <div className="col-xs-12">{customer.DisplayName}</div>
                    </div>        
                </div>
            </div>
        );
        var cells = [
            
            customerPanel,
            <Invoices invoices={this.state.invoices} />
            
        ];
        return(
           <TableRow cells={cells} /> 
        );
    }
    
});