var Customers = require('./Customers'),
    Alert = require('./Alert');

var App = React.createClass({
    
    getInitialState: function() {
        
        return {alert: null};
    },
    
    _hideAlert() {
        
        this.setState({alert: false});   
    },
    
    render() {
       
        var content = <Customers />;
        
        return(
            <div>
                {this.state.alert && <Alert {...this.state.alert} close={this._hideAlert} />}
                {content}
            </div>
        ); 
    }
});

module.exports = App;