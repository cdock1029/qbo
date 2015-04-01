//var React = require('react'),
var Data = require('../Data'),
    Customer = require('./Customer'),
    accounting = require('accounting'),
    _ = require('underscore');


module.exports = React.createClass({
    getInitialState() {
        return { customers: [] };
    },
    _sync() {
        
        Data.getCustomers({desc: 'Balance', limit: 10},function(err, data) {
            
          if (this.isMounted()) {
            this.setState({customers: data});  
          }  
          
        }.bind(this));
        
    },
    render() {
        
        var custs = _.map(this.state.customers, (c, index) => {
            var fields = {key: index, name: c.DisplayName, balance: c.Balance};
            return <Customer data={c} key={index}/>;
        });
        return(
            <div>
            <button onClick={this._sync}>Sync</button>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Company</th>
                    <th>Name</th>
                    <th>Balance</th>
                    <th></th>
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
