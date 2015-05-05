var React = require('react/addons');
var form = React.createFactory('form'), select = React.createFactory('select'), option = React.createFactory('option'); 
var _ = require('underscore');


module.exports = React.createClass({
    
    _onChange: function() {
        this.refs.form.submit();       
    },
    
    render: function() {
        
        var companies = this.props.companies;
        var change = this.onChange;
        return form( 
            { id: 'companyForm', action: '/company', ref: 'form', method: 'post' }, 
            select(
                { id: 'companySelect', className: 'form-control', name: 'company', onChange: change }, 
                _(companies).map(function(company, index) {
                    
                    return option({ key: index, value: index, selected: company.isSelected ? 'selected' : null }, company.name);
                    
                })
            )
        );        
    }
});