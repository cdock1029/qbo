var Data = require('../Data'),
    accounting = require('accounting');
    

module.exports = React.createClass({
    getInitialState() {
        return {balance: this.props.data.Balance};   
    },
    _doPay(event) {
        alert('payed');   
    },
    render() {
        var {key, data} = this.props; 
        return(
            <tr key={key}>
                <td>{data.Id}</td>
                <td>{data.CompanyName}</td>
                <td>{data.DisplayName}</td>
                <td>{accounting.formatMoney(this.state.balance)}</td>
                <th><button onClick={this._doPay}>Pay Off</button></th>
            </tr>
        );
    }
});