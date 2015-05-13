"use strict";

var QuickBooks = require('node-quickbooks');

module.exports = {
    REQUEST_TOKEN_URL : QuickBooks.REQUEST_TOKEN_URL,
    ACCESS_TOKEN_URL : QuickBooks.ACCESS_TOKEN_URL,
    APP_CENTER_BASE : QuickBooks.APP_CENTER_BASE,
    APP_CENTER_URL : QuickBooks.APP_CENTER_URL,
    V3_ENDPOINT_BASE_URL : QuickBooks.V3_ENDPOINT_BASE_URL,  
    PAYMENTS_API_BASE_URL :  QuickBooks.PAYMENTS_API_BASE_URL,
    QUERY_OPERATORS : QuickBooks.QUERY_OPERATORS,
    init: function(consumerKey, consumerSecret, useSandbox, useDebug) {
        return function(company) {
            return new QuickBooks(consumerKey, consumerSecret, company.oauthToken, company.oauthTokenSecret, company.realmId, useSandbox, useDebug); 
        };
    }
    
};

    
    
    
    