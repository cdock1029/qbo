var Data = require('../Data'),
    accounting = require('accounting'),
    Invoices = require('./Invoices');
    

module.exports = React.createClass({
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
                <td>{accounting.formatMoney(customer.Balance)}</td>
                <td><Invoices CustomerRef={customer.Id} /></td>
            </tr>
        );
    }
});