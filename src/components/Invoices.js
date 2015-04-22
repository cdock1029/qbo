var Invoice = require('./Invoice'),
    Data = require('../flux/Data'),
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
            <div className="accordion">
                {invoices}
            </div> 
            : null
        );
    }
});

module.exports = Invoices;