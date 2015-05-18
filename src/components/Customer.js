'use strict';

var React = require('react/addons');
var accounting = require('accounting');
var _ = require('underscore');
var Invoices = require('./Invoices');
var {Button} = require('react-bootstrap');
var Spinner = require('react-spinkit');
    

module.exports = React.createClass({
    mixins: [React.addons.PureRenderMixin],
    
    _handleChange(event) {
        
        //console.log('handleChange in Customer selected?', this.props.selected);
        var customerId = this.props.customer.Id;
        
        if (this.props.selected) {
            this.props.callback(customerId, null);
        } else {
            this.props.callback(customerId, this.props.invoices);//this.state.invoices);
        }
        
    },
    
    render() {
        var customer = this.props.customer;
        var cells = [
            {content: customer.CompanyName},
            {content: <p>{customer.DisplayName}</p>},
            /*{content: this.state.isLoading ? <Spinner spinnerName='three-bounce' /> : <Invoices invoices={customer.invoices} expanded={this.props.expanded} />}*/
            {content: <Invoices invoices={this.props.invoices} expanded={this.props.expanded} />},
            {content: this.props.isSubmitting ? <Spinner spinnerName='double-bounce' /> : <Button bsStyle={this.props.selected ? 'success' : 'default'} bsSize="large" onClick={this._handleChange}>{accounting.formatMoney(customer.Balance)}</Button>}
        ];
        return(
            <tr>
                {_.map(cells, (c, index) => {
                    return <td onClick={c.onClick} key={index}>{c.content}</td>; 
                })} 
            </tr>
        );
    }
    
});