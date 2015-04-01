'use strict';

var Qs = require('qs');

module.exports = {
    getCustomers(query, cb) {
        
        var data = [
            {
                id: '0',
                name: 'John Doe',
                balance: '22.00'
            },
            {
                id: '1',
                name: 'Bill Brasky',
                balance: '0.00'
            },
            {
                id: '0',
                name: 'Mad Hatter',
                balance: '299.95'
            }
        ];
        $.ajax('/customers?' + Qs.stringify(query)).done((data) => {
            cb(null, data.QueryResponse.Customer); 
        });
        
    },
    createPayment(data, cb) {
        $.ajax('/payment', {
            method: 'POST',
            data: data 
        }).done((payment) => {
            cb(null, payment); 
        });  
    }
};
