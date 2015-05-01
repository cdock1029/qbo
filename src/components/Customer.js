var Data = require('../flux/Data'),
    accounting = require('accounting'),
    _ = require('underscore'),
    Invoices = require('./Invoices');
    
var TableRow = require('./TableRow');
var classnames = require('classnames');
var Spinner = require('react-spinkit');
var {Button} = require('react-bootstrap');
    

module.exports = React.createClass({
    
    getInitialState() {
        return {invoices: null};     
    },
    
    _getInvoices() {
        this.setState({isLoading: true});
        Data.getInvoices({desc: 'TxnDate', limit: 50, CustomerRef: this.props.customer.Id},function(err, data) {
            setTimeout(function() {
                if (this.isMounted()) {
                    console.log('setting invoice state after server call');
                    this.setState({invoices: data, isLoading: false});  
                }   
            }.bind(this), 1200); 
        }.bind(this));
    },
    
    componentDidMount() {
        this._getInvoices();    
    },
    
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.customer.Id !== this.props.customer.Id) {
            console.log('customer willReceiveProps Ids !==');
            this._getInvoices();    
        }
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
            <div className="panel panel-default" style={{cursor: 'pointer'}}>
                <div className="panel-heading">
                    <h3 className="panel-title">{customer.CompanyName}</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-xs-12">{customer.DisplayName}</div>
                    </div>        
                </div>
            </div>
        );
        var cells = [
            {content: customer.CompanyName},
            {content: customer.DisplayName},
            {content: this.props.isSubmitting ? <Spinner spinnerName='double-bounce' /> : <Button bsStyle={this.props.selected ? 'success' : 'default'} bsSize="large" onClick={this.handleChange}>{accounting.formatMoney(customer.Balance)}</Button>},
            {content: this.state.isLoading ? <Spinner spinnerName='three-bounce' /> : <Invoices invoices={this.state.invoices} expanded={this.props.expanded} />}
        ];
        return(
           <TableRow cells={cells} /> 
        );
    }
    
});