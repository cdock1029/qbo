//var React = require('react');
var _ = require('underscore');
var classnames = require('classnames');
var Immutable = require('immutable');

module.exports = React.createClass({
    
    mixins: [React.addons.PureRenderMixin],
    
    getInitialState() {
        return { data: Immutable.Map({hovered: -1}) }; 
    },
    
    
    render() {
        var tds =  _.map(this.props.cells, (c, index) => {
                var mEnter = c.hover && function() {
                    this.setState(function(prev) {
                        return {
                            data: prev.data.update('hovered', function(oldIndex) {
                                return index; 
                            }) 
                        }
                    });
                }.bind(this); 
                var mLeave = c.hover && function() {
                    this.setState(function(prev) {
                        return {
                            data: prev.data.update('hovered', function(oldIndex) {
                                return -1; 
                            }) 
                        }
                    });
                    
                }.bind(this); 
                
                var correctStyle = c.style, correctClass = c.className;
                if (! c.className && c.hover && index === this.state.data.get('hovered'))  {
                    correctStyle = React.addons.update(correctStyle, {$merge: c.hover});
                    correctClass = null;
                } 
                return <td className={correctClass} onMouseEnter={mEnter} onMouseLeave={mLeave} onClick={c.onClick} key={index} style={correctStyle}>{c.content}</td>; 
            }); 
        return(
            <tr>
                {tds}
            </tr>     
        );  
    } 
});