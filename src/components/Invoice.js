'use strict';

var React = require('react/addons');
var moment = require('moment');
var accounting = require('accounting');
var _ = require('underscore');
var {Panel, ListGroup, ListGroupItem} = require('react-bootstrap');

var Invoice = React.createClass({
    
    getInitialState() {
        return { checked: null };   
    },
    
    handleChange(event) {
        this.setState({checked: this.state.checked ? null : 'checked'});
    },
    
    render() {
        var invoice = this.props.invoice;
        var checkbox = null;//<input type="checkbox" checked={this.state.checked} onChange={this.handleChange}/>;
        var panelBody = invoice.PrivateNote && <p className="help-block"><small>{invoice.PrivateNote /*|| (invoice.CustomerMemo && invoice.CustomerMemo.value)*/}</small></p>; 
        
        var header = <div><span className="badge">{accounting.formatMoney(invoice.Balance)}</span>
                            <p className="help-block pull-right"><small>{moment(invoice.TxnDate, '"YYYY-MM-DD').format('YYYY MMM DD')}</small></p></div>;
        return (
            <Panel eventKey={this.props.key} header={accounting.formatMoney(invoice.Balance)}>
                {panelBody} 
                <ListGroup fill>
                    {_.map(invoice.Line, (line, i) => {
                        return line.SalesItemLineDetail && line.SalesItemLineDetail.ItemRef && <ListGroupItem key={i}>{line.SalesItemLineDetail.ItemRef.name}</ListGroupItem> 
                    })}
                </ListGroup>
            </Panel>
        ); 
        
    }
});

module.exports = Invoice;