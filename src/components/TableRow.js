//var React = require('react');
var _ = require('underscore');
var Immutable = require('immutable');

module.exports = React.createClass({
    
    mixins: [React.addons.PureRenderMixin],
    
    render() {
        var tds =  _.map(this.props.cells, (c, index) => {
                return <td onClick={c.onClick} key={index}>{c.content}</td>; 
            }); 
        return(
            <tr>
                {tds}
            </tr>     
        );  
    } 
});