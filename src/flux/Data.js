'use strict';

import Qs from 'qs';
import R from 'ramda';

let data = {};

data.getCustomersPromise = query => {
  return Promise.resolve($.ajax('/customers?' + Qs.stringify(query)));
};

data.getCustomers = (query, cb) => {

  $.ajax('/customers?' + Qs.stringify(query)).done(params => {

    if (params.crumb) {
      window.crumb(params.crumb);
    }
    cb(null, params.QueryResponse); //array of customers

  }).fail((jqXHR, textStatus, errorThrown) => {

    cb(errorThrown, null);
  });

};

data.submitPaymentsPromise = params => {

  return Promise.resolve($.ajax('/payment',
  {
    method: 'POST',
    headers: {
      'X-CSRF-Token': window.crumb()
    },
    data: {
      payments: params
    }
  }));
};


data.submitPayments = (params, cb) => {

  console.log('submitPayments:', params);
  $.ajax('/payment', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': window.crumb()
    },
    data: {
      payments: params
    }
  }).done((response) => {

    cb(null, response);
  });
};

data.getInvoices = (query, cb) => {

  $.ajax('/invoices?' + Qs.stringify(query)).done((response) => {

    if (response.crumb) {
      window.crumb(response.crumb);
    }
    cb(null, response.QueryResponse.Invoice);
  });
};

module.exports = data;
