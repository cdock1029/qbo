'use strict';

var React = require('react/addons');
var Invoice = require('./Invoice'),
    Data = require('../flux/Data'),
    moment = require('moment'),
    {Accordion, PanelGroup, Panel, ListGroup, ListGroupItem, Badge} = require('react-bootstrap'),
    _ = require('underscore');
var accounting = require('accounting');

var Invoices = React.createClass({
    
    mixins: [React.addons.PureRenderMixin],
    
    render: function() {
        var panels =  _.map(this.props.invoices, function(invoice, index) {
                        
                        var lines = _(invoice.Line).where({DetailType: "SalesItemLineDetail"});
                        
                        var descriptionLabel; 
                        if (lines.length === 1) {
                            descriptionLabel = lines[0].SalesItemLineDetail.ItemRef.name; 
                        } else {
                            //descriptionLabel = invoice.PrivateNote || (invoice.CustomerMemo && invoice.CustomerMemo.value);
                            descriptionLabel = invoice.PrivateNote || lines[0].SalesItemLineDetail.ItemRef.name;
                            descriptionLabel += '...';
                        }
                        var style = {
                            display: 'inline-block',
                            marginRight: '2px'
                        }; 
                        var header = [
                            <small key="0" className="pull-right">{descriptionLabel}</small>,
                            <span key="1">{moment(invoice.TxnDate).format('MMM Do, YYYY') + '  '}</span>,
                            <span key="3" className="label label-default" style={style}>{accounting.formatMoney(invoice.Balance)}</span>
                        ];    
                            
                        var listGroupItems = _(lines).map((line, i) => {
                                return <ListGroupItem key={i}><Badge>{accounting.formatMoney(line.Amount)}</Badge>{line.SalesItemLineDetail.ItemRef.name}</ListGroupItem>;
                            });
                            
                        
                        var tax = invoice.TxnTaxDetail;
                        var taxLine = tax && tax.TotalTax && <ListGroupItem key={'tax'}><Badge>{accounting.formatMoney(tax.TotalTax)}</Badge>Tax</ListGroupItem>;
                        if (taxLine) {
                            listGroupItems.push(taxLine);
                        }
                            
                        return (
                            //<Invoice key={index} invoice={inv} />
                            <Panel collapsable defaultExpanded={false} header={header} key={index}>
                                <ListGroup fill>
                                    {listGroupItems}
                                </ListGroup>
                            </Panel>
                        ); 
                    }, this);
        return (
            this.props.invoices ? 
                <PanelGroup>
                    {panels} 
                </PanelGroup>
            : null
        );
    }
});

module.exports = Invoices;