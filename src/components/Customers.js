//var React = require('react'),
var Data = require('../Data'),
    QBO = require('node-quickbooks'),
    _ = require('underscore');


module.exports = React.createClass({
    getInitialState() {
        return { customers: [] };
    },
    _sync() {
        var {consumerKey, consumerSecret, token, tokenSecret, realmId} = this.props.qboData;
        var qbo = new QBO(consumerKey, consumerSecret, token, tokenSecret, realmId, true, true);
        qbo.findCustomers((err, list) => {
            if (err) {
                console.log('Error in Data getting customers: ' + err.message);
            } else {
                alert('worked');
                //this.setState({ customers: list });
            } 
        });
        //Data.getCustomers(this.props.QBO, this.setState);
    },
    render() {
        var custs = _.map(this.state.customers, (c, index) => {
            return <tr key={c.Id}><td>{c.DisplayName}</td><td>{c.Balance}</td></tr>;
        });
        return(
            <div>
            <button onClick={this._sync}>Sync</button>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Balance</th>
                </tr>
                </thead>
                <tbody>
                    {custs}
                </tbody>
            </table>
            </div>
        );
    }
});
