'use strict';

import React from 'react/addons';
import FluxComponent from 'flummox/component';
//import Customers from './Customers';
import CustomersWrapper from './CustomersWrapper';
//import Alert from './Alert';
import Spinner from 'react-spinkit';
import {Row, Col, Alert} from 'react-bootstrap';

class App extends React.Component {
  
    
    constructor() {
      super();
      this._hideAlert = this._hideAlert.bind(this);
      this._showAlert = this._showAlert.bind(this);
      this._toggleLoading = this._toggleLoading.bind(this);
      this.render = this.render.bind(this);
      this.state = {alert: null, loading: false};
    }
    
    _hideAlert() {
        this.setState({alert: null});   
    }
    
    _showAlert(params) {
        this.setState({alert: params})   
    }
    
    _toggleLoading() {
        this.setState({loading: !this.state.loading});   
    }
    
    render() {
       
        var loading = this.state.loading ? 
            <Row> 
                <Col sm={4} smPush={4}>
                    <Spinner spinnerName='three-bounce'/> 
                </Col>
            </Row> :
            null;
            
        var alerts = this.props.alerts.map(function(message, index) {
          return <Alert key={index} bsStyle='danger'> 
            {message}
          </Alert>;
        });  
        return(
            <div>
                {loading}
                {alerts}
                <FluxComponent>
                  <CustomersWrapper />
                </FluxComponent>
            </div>
        ); 
    }
};

export default App;