var React = require('react/addons');
var {DropdownButton, ButtonGroup, MenuItem} = require('react-bootstrap');

var _ = require('underscore');


module.exports = React.createClass({
    
    render: function() {
        
        var companies = this.props.companies;
        var change = this.onChange;
        var selectedLabel;
        var menuItems = _(companies).map( (company, index) => {
            if (company.isSelected) {
                selectedLabel = company.name + ' ';
            }  
            return <MenuItem className="companyItems" eventKey={index} key={index}>{company.name}</MenuItem>;   
        }); 
        return(
            <DropdownButton title={selectedLabel} data-toggle="dropdown">
                {menuItems} 
            </DropdownButton>
        ); 
    }
});