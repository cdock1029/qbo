'use strict';

const Handlebars = require('handlebars');

module.exports = function(value, company) {
    let val = Handlebars.Utils.escapeExpression(value);
    let selected = company.isSelected ? ' selected="selected"' : '';

    let result = '<option value="' + val + '"' + selected + '>' + company.name + '</option>';

    return new Handlebars.SafeString(result);
};
