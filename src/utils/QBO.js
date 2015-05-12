"user strict";

var QuickBooks = require('node-quickbooks');


var QBO = exports;

QBO.APP_CENTER_BASE = QuickBooks.APP_CENTER_BASE;
QBO.ACCESS_TOKEN_URL = QuickBooks.ACCESS_TOKEN_URL;
QBO.APP_CENTER_URL = QuickBooks.APP_CENTER_URL;

QBO.init = function(consumerKey, consumerSecret, useSandbox, useDebug) {
    return function(company) {
        return new QuickBooks(consumerKey, consumerSecret, company.oauthToken, company.oauthTokenSecret, company.realmId, useSandbox, useDebug); 
    }
};
    
    
    
    