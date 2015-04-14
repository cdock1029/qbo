var Invoice = require('./Invoice'),
    Data = require('../Data'),
    _ = require('underscore');

var Invoices = React.createClass({
    getInitialState() {
        return { invoices: [] };
    },
    componentDidMount() {
        
        Data.getInvoices({desc: 'TxnDate', limit: 50, CustomerRef: this.props.CustomerRef},function(err, data) {
            
          if (this.isMounted()) {
            this.setState({invoices: data});  
          }  
          
        }.bind(this));
        
    },
    
    render: function() {
        var invoices = _.map(this.state.invoices, function(inv, index) {
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