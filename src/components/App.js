'use strict';

import React from 'react/addons';
import FluxComponent from 'flummox/component';
//import Customers from './Customers';
import CustomersWrapper from './CustomersWrapper';
//import Alert from './Alert';
import Spinner from 'react-spinkit';
import {Row, Col, Alert} from 'react-bootstrap';

const App = React.createClass({

    propTypes: {
      alerts: React.PropTypes.array
    },

    getInitialState() {
      return {
        alert: null,
        loading: false
      };
    },

    _hideAlert() {
      this.setState({alert: null});
    },

    _showAlert(params) {
      this.setState({alert: params});
    },

    _toggleLoading() {
      this.setState({loading: !this.state.loading});
    },

    render() {

        const loading = this.state.loading ?
            <Row>
                <Col sm={4} smPush={4}>
                    <Spinner spinnerName='three-bounce'/>
                </Col>
            </Row> :
            null;

        const alerts = this.props.alerts.map(function(message, index) {
          return (<Alert bsStyle='danger' key={index}>
            {message}
          </Alert>);
        });
        return (
            <div>
                {loading}
                {alerts}
                <FluxComponent>
                  <CustomersWrapper />
                </FluxComponent>
            </div>
        );
    }
});

export default App;
