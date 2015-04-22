var _ = require('underscore');

module.exports = React.createClass({
    
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
            <tbody>
                {this.props.body}
            </tbody>
        </table>    
    }    
});