//var React = require('react'),
var Data = require('../Data'),
    Customer = require('./Customer'),
    accounting = require('accounting'),
    _ = require('underscore');


module.exports = React.createClass({
    getInitialState() {
        return { customers: [] };
    },
    componentDidMount() {
        
        Data.getCustomers({asc: 'CompanyName', limit: 20},function(err, data) {
            
          if (this.isMounted()) {
            this.setState({customers: data});  
          }  
          
        }.bind(this));
        
    },
    render() {
        
        var custs = _.map(this.state.customers, (c, index) => {
            
            return <Customer customer={c} key={index}/>;
        });
        return(
            <div className="col-lg-10">
            <table className="table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Balance</th>
                    <th>Invoices</th>
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
