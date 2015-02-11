var React = require('react'),
    Data = require('../Data'),
    _ = require('underscore');


module.exports = React.createClass({
    getInitialState() {
        return { customers: Data.getCustomers() };
    },
    _sync() {
        this.setState({ customers: Data.getCustomers() });
    },
    render() {
        var custs = _.map(this.state.customers, (c, id) => {
            return <tr key={id}><td>{c.name}</td><td>{c.balance}</td></tr>;
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
