var _ = require('underscore');

module.exports = React.createClass({
    
    mixins: [React.addons.PureRenderMixin], 
    
    render() {
        
        return(
            <tr>
                {_.map(this.props.cells, (c, index) => {
                    return <td key={index}>{c}</td>; 
                })}
            </tr>     
        );  
    } 
});