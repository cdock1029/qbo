var Data = require('../Data'),
    accounting = require('accounting'),
    Invoices = require('./Invoices');
    

module.exports = React.createClass({
    
    getInitialState() {
        return {checked: null, invoices: null};     
    },
    
    componentDidMount() {
        
        Data.getInvoices({desc: 'TxnDate', limit: 50, CustomerRef: this.props.customer.Id},function(err, data) {
            
          if (this.isMounted()) {
            this.setState({invoices: data});  
          }  
          
        }.bind(this));
        
    },
    
    handleChange(event) {
        this.setState({checked: this.state.checked ? null : 'checked'});
    },
    
    render() {
        var {key, customer} = this.props; 
        return(
            <tr key={key}>
                <td>{customer.Id}</td>
                <td>
                    <div className="row">
                        <div className="col-xs-12">{customer.DisplayName}</div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">{customer.CompanyName}</div>
                    </div>
                </td>
                <td>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" checked={this.state.checked} onChange={this.handleChange}/>{accounting.formatMoney(customer.Balance)}
                    </label>
                </div>
                
                </td>
                <td><Invoices invoices={this.state.invoices} /></td>
            </tr>
        );
    }
    
});