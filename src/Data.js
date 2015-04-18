'use strict';

var Qs = require('qs');

module.exports = {
    getCustomers(query, cb) {
        
        $.ajax('/customers?' + Qs.stringify(query)).done((data) => {
            cb(null, data.QueryResponse.Customer);//array of customers 
        });
        
    },
    submitPayments(data, cb) {
        console.log('submitPayments:',data);
        $.ajax('/payment', {
            method: 'POST',
            data: ({payments: data})
        }).done((response) => {
            cb(response); 
        });  
    },
    getInvoices(query, cb) {
        $.ajax('/invoices?' + Qs.stringify(query)).done((data) => {
            cb(null, data.QueryResponse.Invoice);
        });  
    },
    
    login(username, password,s,e) {
        
        $.ajax('/login', {
            method: 'POST',
            data: {username: username, password: password},
            
            
        }).done(function(data, textStatus, jqXHR) {
            s(data);
        }).fail(function(jqXHR, textStatus, error) {
            e({message: error});
        });
        
    }
    
    
};
