var moment = require('moment'),
    accounting = require('accounting');

var Invoice = React.createClass({
    
    getInitialState() {
        return { checked: null };   
    },
    
    handleChange(event) {
        this.setState({checked: this.state.checked ? null : 'checked'});
    },
    
    render() {
        var invoice = this.props.invoice;
        
        return (
            <div className="row">
                <div className="col-sm-6">
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" checked={this.state.checked} onChange={this.handleChange}/>
                            {accounting.formatMoney(invoice.Balance)}
                            <p className="help-block"><small>{moment(invoice.TxnDate, '"YYYY-MM-DD').format('DD MMM YYYY')}</small></p>
                        </label>
                    </div>
                </div>
            </div>
        ); 
        
    }
});

module.exports = Invoice;