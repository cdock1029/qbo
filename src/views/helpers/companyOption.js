var Handlebars = require('handlebars');

module.exports = function(value, company) {
    var val = Handlebars.Utils.escapeExpression(value);
    var selected = company.isSelected ? ' selected="selected"' : ''; 
    
    var result = '<option value="' + val + '"' + selected + '>' + company.name + '</option>'; 
    
    return new Handlebars.SafeString(result); 
};