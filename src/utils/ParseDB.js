"use strict";

var Parse = require('node-parse-api').Parse;
var Q = require('q');
var db;
var _ = require('underscore');
var {compose, curry} = require("functional.js");


var dbCall = function(fn, ...args) {
    
    var d = Q.defer(); 
    
    var cb = function(err, result) {
        if (err) {
            d.reject(err);
        } else {
            d.resolve(result);
        } 
    };
    
    fn.call(db, ...args, cb);
    
    return d.promise;
};

exports.init = function(id, key) {
    
    var options = {
        app_id: id,
        api_key: key
    };
    
    db = new Parse(options); 
};

exports.login = function(user, pw) {
    return dbCall(db.loginUser, user, pw);   
};

exports.me = function(token) {
    return dbCall(db.me, token);   
};