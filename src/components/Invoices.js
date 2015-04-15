var Invoice = require('./Invoice'),
    Data = require('../Data'),
    _ = require('underscore');

var Invoices = React.createClass({
    
    getInitialState() {
        return { selectedInvoiceIds: [] };     
    },
    
    
    
    render: function() {
        var invoices = _.map(this.props.invoices, function(inv, index) {
            return (
                <Invoice key={index} invoice={inv} />
            ); 
        });
        return (
            invoices ? 
            <div>
                {invoices}
            </div> 
            : null
        );
    }
});

module.exports = Invoices;