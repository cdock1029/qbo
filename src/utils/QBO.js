'use strict';

var QuickBooks = require('node-quickbooks');
var _ = require('underscore');
var Q = require('q');

/**
 * Builds a Payment
 * @param {number} amount payment amount
 * @param {string} invoiceId id of invoice this payment links to
 * @return {!Payment} Payment
 */
var buildPayment = function(amount, invoiceId) {

  return {
    Amount: amount,
    LinkedTxn: [{
      TxnId: invoiceId,
      TxnType: 'Invoice'
    }]
  };

};

module.exports = {
  REQUEST_TOKEN_URL: QuickBooks.REQUEST_TOKEN_URL,
  ACCESS_TOKEN_URL: QuickBooks.ACCESS_TOKEN_URL,
  APP_CENTER_BASE: QuickBooks.APP_CENTER_BASE,
  APP_CENTER_URL: QuickBooks.APP_CENTER_URL,
  V3_ENDPOINT_BASE_URL: QuickBooks.V3_ENDPOINT_BASE_URL,
  PAYMENTS_API_BASE_URL: QuickBooks.PAYMENTS_API_BASE_URL,
  QUERY_OPERATORS: QuickBooks.QUERY_OPERATORS,

  init: function init(consumerKey, consumerSecret, useSandbox, useDebug) {

    return function(company) {

      return new QuickBooks(consumerKey, consumerSecret, company.oauthToken, company.oauthTokenSecret, company.realmId, useSandbox, useDebug);

    };

  },

  /**
   * @param {Array} companies
   * @param {boolean} SANDBOX true if in sandbox mode
   * @returns {Array} filter Sandbox companies or not, according to env.
   */
  filterCompanies: function filterCompanies(companies, SANDBOX) {

    var filtered = _.filter(companies, c => {

      var isASandbox = c.name.toLowerCase().includes('sandbox');
      return SANDBOX ? isASandbox : !isASandbox;

    });
    filtered[0].isSelected = true;
    return filtered;

  },




  /**
   * @param {string} customerId
   * @param {Array} invoices
   */
  createPaymentForCustomer: function createPaymentForCustomer(customerId, invoices) {

    var total = 0.0;
    var line = _.map(invoices, function(inv, index) {

      var balance = parseFloat(inv.Balance);
      total += balance;

      return buildPayment(balance, inv.Id);

    });

    return {
      CustomerRef: {
        value: customerId
      },
      TotalAmt: (Math.round(total * 100) / 100).toFixed(2),
      sparse: false,
      Line: line
    };

  },

  /**
   * @param {!Object} Quickbooks service object
   * @param {Array} items batch to be submitted
   * @returns {Promise} promise
   */
  batchPromise: function batchPromise(qbo, items) {

    var deferred = Q.defer();
    qbo.batch(items, (err, result) => {

      if (err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve(result);
      }

    });

    return deferred.promise;
  },

  /**
   * @param {function(Array, function(Object,Object))} fn quickbooks service call
   * @param {!Object} qbo Quickbooks service object
   * @param {boolean} countParam whether to include count or not
   * @param {Object} queryParams query filters for api call
   * @returns {Object} promise
   */
  getCount: function getCount(fn, qbo, countParam, queryParams) {

    var deferred = Q.defer();
    var combined = _.union([{
      count: true
    }], queryParams);
    if (countParam) {
      fn.call(qbo, combined, (e, result) => {

        if (e) {
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

  }

};