'use strict';

var classnames = require('classnames'),
    PureRenderMixin = React.addons.PureRenderMixin;

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
            <div className={classnames('alert', this.props.type)}>
                <a href="#" className="close" onClick={this._close}>&times;</a>
                <strong>{this.props.strong}</strong>{this.props.message} 
            </div>     
        );     
    }    
});