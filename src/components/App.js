var Customers = require('./Customers');
    //React = require('react'),
var Alert = require('./Alert');
var Spinner = require('react-spinkit');
var {Grid, Row, Col} = require('react-bootstrap');

var App = React.createClass({
    
    getInitialState: function() {
        
        return {alert: null, loading: false};
    },
    
    _hideAlert() {
        this.setState({alert: null});   
    },
    
    _showAlert(params) {
        this.setState({alert: params})   
    },
    
    _toggleLoading() {
        this.setState({loading: !this.state.loading});   
    },
    
    render() {
       
        var content = <Customers loadingCallback={this._toggleLoading} />;
        
        var loading = this.state.loading ? 
            <Row> 
                <Col sm={4} smPush={4}>
                    <Spinner spinnerName='three-bounce'/> 
                </Col>
            </Row> :
            null;
            
        var alert = this.state.alert ? 
            <Alert {...this.state.alert} close={this._hideAlert} /> :
            null;
        return(
            <div>
                {loading}
                {alert}
                {content}
            </div>
        ); 
    }
});

module.exports = App;