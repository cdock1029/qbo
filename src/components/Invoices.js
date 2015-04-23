var Invoice = require('./Invoice'),
    Data = require('../flux/Data'),
    {Accordion, PanelGroup, Panel, ListGroup, ListGroupItem} = require('react-bootstrap'),
    _ = require('underscore');
var accounting = require('accounting');

var Invoices = React.createClass({
    
    getInitialState() {
        return { selectedInvoiceIds: [] };     
    },
    
    
    
    render: function() {
        
        return (
            this.props.invoices ? 
                <PanelGroup>
                    {_.map(this.props.invoices, function(invoice, index) {
                        var header = (
                            accounting.formatMoney(invoice.Balance)
                        );
                        return (
                            //<Invoice key={index} invoice={inv} />
                            <Panel collapsable key={index}  header={header}>
                                {invoice.PrivateNote || (invoice.CustomerMemo && invoice.CustomerMemo.value)}
                                <ListGroup fill>
                                    {_.map(invoice.Line, (line, i) => {
                                        return line.SalesItemLineDetail && line.SalesItemLineDetail.ItemRef && <ListGroupItem key={i}>{line.SalesItemLineDetail.ItemRef.name}</ListGroupItem> 
                                    })}
                                </ListGroup>
                            </Panel>
                        ); 
                    })} 
                </PanelGroup>
            : null
        );
    }
});

module.exports = Invoices;