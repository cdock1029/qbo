var moment = require('moment'),
    accounting = require('accounting');
var _ = require('underscore');

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
        var panelBody = invoice.PrivateNote && 
                        <div className="panel-body">
                            <p className="help-block"><small>{invoice.PrivateNote /*|| (invoice.CustomerMemo && invoice.CustomerMemo.value)*/}</small></p>
                        </div>; 
        
        return (
            <div className="row">
                <div className="col-sm-6">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <span className="badge">{accounting.formatMoney(invoice.Balance)}</span>
                            <p className="help-block pull-right"><small>{moment(invoice.TxnDate, '"YYYY-MM-DD').format('YYYY MMM DD')}</small></p>
                        </div>
                        {panelBody} 
                        <ul className="list-group">
                            {_.map(invoice.Line, (line, i) => {
                                return line.SalesItemLineDetail && line.SalesItemLineDetail.ItemRef && <li className="list-group-item" key={i}>{line.SalesItemLineDetail.ItemRef.name}</li> 
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        ); 
        
    }
});

module.exports = Invoice;