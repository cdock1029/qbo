require('superagent-future');//modifies superagent
var request = require('superagent');
var {compose, chain, prop, curry, map, _} = require('ramda');
var {Future} = require('ramda-fantasy');
var util = require('util');
var {stringify} = require('qs');

/*pure*/ 
var privateUserDataId = compose(prop('id'), prop('privateUserData'));

// classname String -> partial url String
var classUrl = function url(className) {
    return util.format("https://api.parse.com/1/%s", className);
};

var objectUrl = curry(function getObjUrl(className, objectId) {
    return util.format("https://api.parse.com/1/%s/%s", className, objectId);
});

var createFuture = function(request) {
    return request.createFuture();   
};

var setPath = curry(function(pathString, request) {
    return request.get(pathString);   
});

var setHeaders = curry(function(headers, request) {
    return request.set(headers);  
});

var setHeader = curry(function(header, value, request) {
    return request.set(header, value); 
});

var setQueryParams = curry(function(request, params) {
    return request.query(params);  
});

var getWrapped = curry(function(field, source) {
    var wrapper = {};
    wrapper[field] = source[field];
    return wrapper;
});

var logIn = setQueryParams( request(classUrl('login')) );

var pud = function(body) {
    return {
        privateUserData: body.privateUserData, 
        sessionToken: body.sessionToken
    }; 
};

var ork = function(h,g,f,x) {
    return h(g(x), f(x));
};

var pointer = curry(function(fieldName, prevResult) {
    
    var val = prevResult[fieldName];//op 1
    var token = prevResult.sessionToken;//op 2
    
    var path = objectUrl(val.className, val.objectId);
    
    return request(path)
        .set("X-Parse-Session-Token", token);
   
});
//Future result -> Future result
/*impure*/

var log = function(x) {
    console.log(x); 
    return x;
};

var init = function init(app_id, rest_key) {
    var login = compose(map(prop('body')), createFuture, setHeaders({ "X-Parse-Application-Id": app_id, "X-Parse-REST-API-Key": rest_key }), logIn); 
    //var privateUserData = compose(map(pud), login);        
    
    //var privateUserData = compose(map(prop("body")), map(setHeaders({ "X-Parse-Application-Id": app_id, "X-Parse-REST-API-Key": rest_key })), map(log), map(pointer("privateUserData")), login);
    
    var privateUserData = compose(login, chain(pointer('privateUserData')), chain(log), chain(setHeaders({ "X-Parse-Application-Id": app_id, "X-Parse-REST-API-Key": rest_key })), chain(prop('body')));
    
    return {
        login: login,
        privateUserData: privateUserData
    };
};


module.exports.init = init;
 