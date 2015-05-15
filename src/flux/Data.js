'use strict';

var Qs = require('qs');


module.exports = {
  getCustomers(query, cb) {

      $.ajax('/customers?' + Qs.stringify(query)).done(data => {
        if (data.crumb) {
          window.crumb(data.crumb);
        }
        cb(null, data.QueryResponse); //array of customers 

      }).fail((jqXHR, textStatus, errorThrown) => {
        cb(errorThrown, null);
      });

    },
    submitPayments(data, cb) {
      console.log('submitPayments:', data);
      $.ajax('/payment', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': window.crumb()
        },
        data: ({
          payments: data
        })
      }).done((response) => {
        cb(null, response);
      });
    },
    getInvoices(query, cb) {

      $.ajax('/invoices?' + Qs.stringify(query)).done((data) => {
        if (data.crumb) {
          window.crumb(data.crumb);
        }
        cb(null, data.QueryResponse.Invoice);
      });
    }


};
