'use strict';

var React = require('react/addons');
var {Alert} = require('react-bootstrap');
var PureRenderMixin = React.addons.PureRenderMixin;

module.exports = React.createClass({
    
    mixins: [PureRenderMixin],
    
    propTypes: {
        close: React.PropTypes.func.isRequired,
        message: React.PropTypes.string.isRequired,
        strong: React.PropTypes.string
    },
   
    _close() {
        this.props.close();
    },
    
    render() {
        return (
            <Alert bsStyle={this.props.type} onDismiss={this._close}>
                <h4>{this.props.strong}</h4>
                <p>{this.props.message}</p> 
            </Alert>     
        );     
    }    
});