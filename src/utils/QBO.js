'use strict';

const QuickBooks = require('node-quickbooks');
const R = require('ramda');
const Q = require('q');



let QBO = {
  REQUEST_TOKEN_URL: QuickBooks.REQUEST_TOKEN_URL,
  ACCESS_TOKEN_URL: QuickBooks.ACCESS_TOKEN_URL,
  APP_CENTER_BASE: QuickBooks.APP_CENTER_BASE,
  APP_CENTER_URL: QuickBooks.APP_CENTER_URL,
  V3_ENDPOINT_BASE_URL: QuickBooks.V3_ENDPOINT_BASE_URL,
  PAYMENTS_API_BASE_URL: QuickBooks.PAYMENTS_API_BASE_URL,
  QUERY_OPERATORS: QuickBooks.QUERY_OPERATORS
};

QBO.init = function init(consumerKey, consumerSecret, useSandbox, useDebug) {

  return function(company) {

    return new QuickBooks(consumerKey, consumerSecret, company.oauthToken, company.oauthTokenSecret, company.realmId, useSandbox, useDebug);

  };

};

QBO.createPaymentLine = R.map(function(inv) {
  return {
    Amount: inv.Balance,
    LinkedTxn: [{
      TxnId: inv.Id,
      TxnType: 'Invoice'
    }]
  };
});

QBO.calculateTotal = R.reduce(function(acc, inv) {
  return parseFloat(inv.Balance) + acc;
}, 0);

/**
 * @param {Array} line Payment line links to transactions being paid
 * @param {number} totalAmt total value of Payment
 * @return {!Object} partial Payment does not include CustomerRef
 */
QBO.createPartialPayment = R.converge(function(line, totalAmt) {
  return {
    Line: line,
    TotalAmt: Math.round(totalAmt * 100) / 100
  };
}, QBO.createPaymentLine, QBO.calculateTotal);

/**
 * @param {string} customerId
 * @param {Array} invoices
 */
QBO.createPaymentForCustomer = function createPaymentForCustomer(customerId, invoices) {

  const partialPayment = QBO.createPartialPayment(invoices);
  return {
    CustomerRef: {
      value: customerId
    },
    TotalAmt: partialPayment.TotalAmt,
    sparse: false,
    Line: partialPayment.Line
  };

};

/**
 * @param {!Object} Quickbooks service object
 * @param {Array} items batch to be submitted
 * @returns {Promise} promise
 */
QBO.batchPromise = function batchPromise(qbo, items) {

  const deferred = Q.defer();
  qbo.batch(items, (err, result) => {

    if (err) {
      console.error(err);
      deferred.reject(err);
    }
    else {
      deferred.resolve(result);
    }

  });

  return deferred.promise;
};

/**
 * @param {function(Array, function(Object,Object))} fn quickbooks service call
 * @param {!Object} qbo Quickbooks service object
 * @param {boolean} countParam whether to include count or not
 * @param {Object} queryParams query filters for api call
 * @returns {Object} promise
 */
QBO.getCount = function getCount(fn, qbo, countParam, queryParams) {

  const deferred = Q.defer();
  const combined = R.union([{
    count: true
  }], queryParams);

  if (countParam) {
    fn.call(qbo, combined, (e, result) => {

      if (e) {
        console.error(e);
        deferred.reject(e);
      }
      else {
        deferred.resolve(result.QueryResponse.totalCount);
      }

    });
  }
  else {
    deferred.resolve(null);
  }
  return deferred.promise;

};

module.exports = QBO;
