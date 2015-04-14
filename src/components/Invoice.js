var moment = require('moment'),
    accounting = require('accounting');

var Invoice = React.createClass({
    
    
    render() {
        var invoice = this.props.invoice;
        
        return (
            <div className="row">
                <div className="col-sm-6">{moment(invoice.TxnDate, '"YYYY-MM-DD').fromNow()}</div> 
                <div className="col-sm-6">{accounting.formatMoney(invoice.Balance)}</div>
            </div>
        ); 
        
    }
});

module.exports = Invoice;