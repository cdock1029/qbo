//var React = require('react');
var _ = require('underscore');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

module.exports = React.createClass({
    
    mixins: [React.addons.PureRenderMixin],
    
    propTypes: {
        headings: React.PropTypes.array.isRequired,
        body: React.PropTypes.any
    },
    
    render() {
        return <table className="table">
            <thead>
                <tr>
                    {_.map(this.props.headings, (h, index) => {
                        return <th key={index}>{h}</th>; 
                    })} 
                </tr>
            </thead>
            <ReactCSSTransitionGroup transitionName="tenants" component="tbody">
                {this.props.children}
            </ReactCSSTransitionGroup>
        </table>    
    }    
});