"use strict";

var Hapi = require('hapi');
    //Hoek = require('hoek'),
    //Wreck = require('wreck'),
var AuthCookie = require('hapi-auth-cookie');
var Yar = require('yar');
    //Bell = require('bell'),
var _ = require('underscore');
var Request = require('request');
var Qs = require('qs');
var Handlebars = require('handlebars');
var Boom = require('boom');
var Q = require('q');
var React = require('react');

var CompanyDropdownButton = React.createFactory(require('./lib/components/CompanyDropdownButton'));

const BATCH_SIZE = 25;
const SANDBOX = false;   
    /* Server params */ 
const PORT = process.env.PORT,
    IP = process.env.IP,
    C9_HOSTNAME = process.env.C9_HOSTNAME,
    
    /* App configuration */
    //Quickbooks
    CONSUMER_KEY = SANDBOX ? process.env.DEV_CONSUMER_KEY : process.env.CONSUMER_KEY,
    CONSUMER_SECRET = SANDBOX ? process.env.DEV_CONSUMER_SECRET : process.env.CONSUMER_SECRET,
    
    FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID, 
    FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET,
    
    GOOGLE_APP_ID = process.env.GOOGLE_APP_ID,
    GOOGLE_APP_SECRET = process.env.GOOGLE_APP_SECRET,
   
    /* AWS config */ 
    AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID,
    AWS_REGION = process.env.AWS_REGION,
    ROLE_ARN = process.env.IAM_ROLE_ARN,
    POOL_ID = process.env.COGNITO_IDENTITY_POOL_ID,
    DATA_SET_NAME = process.env.COGNITO_DATASET_NAME,
    
    PARSE_APP_ID = process.env.PARSE_APP_ID,
    PARSE_JS_KEY = process.env.PARSE_JS_KEY,
    PARSE_REST_KEY = process.env.PARSE_REST_KEY,
   
    /* keys */ 
    QBO_SESSION_KEY = 'qbo',
    QBO_COMPANY_ID = 'qbo_company_id', 
    QBO_TOKEN = 'oauth_token',
    QBO_TOKEN_SECRET = 'oauth_token_secret',
    QBO_REALM_ID = 'realm_id';
    
var QBO = require('./lib/utils/QBO').init(CONSUMER_KEY, CONSUMER_SECRET, false/*useSandbox*/, true/*useDebug*/);
//var Parse = require('node-parse-api').Parse;
var utils = require('./lib/utils/Utils');
var Parser = utils.init(PARSE_APP_ID, PARSE_REST_KEY);
/*var db = new Parse({
    app_id: PARSE_APP_ID,
    api_key: PARSE_REST_KEY 
});*/

var server = new Hapi.Server();//{

server.connection({ host: C9_HOSTNAME, address: IP, port: PORT});

server.register([AuthCookie/*, { register: require('crumb'), options: { cookieOptions: { isSecure: true }}}*/], (err) => {
    if (err) {
        console.error(err);
        return process.exit(1);
    } 
    
    server.auth.strategy('user', 'cookie', {
        password: 'emGWVAqponcmoscHSKJOEWEEal2h2JLssf205HlJS',
        cookie: 'user',
        isSecure: true,
        redirectTo: '/login',
        clearInvalid: true,
        ttl: 4*60*60*1000
    });
    
    server.auth.default('user');
});

server.route([
    {
        method: 'GET',
        path: '/src/{param*}',
        config: {
            handler: {
                directory: {
                    path: (request) => {
                        return 'src'; 
                    }
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/',
        config: {
            handler: (request, reply) => {
                var companies = request.auth.credentials.companies;
                var companySelectForm = React.renderToStaticMarkup(CompanyDropdownButton({ companies: companies }));
                var ctx = {companies: companies, companySelectForm: companySelectForm};
                return reply.view('main.html', ctx);
            }
        }
    },
    {
        method: 'GET',
        path: '/customers',
        config: {
            handler: (request, reply) => {
                
                var session = request.auth.credentials; 
                var qbo = QBO(_.findWhere(session.companies, {isSelected: true}));
                var queryParams = [
                    {field: 'asc', value: request.query.asc, operator: '='},
                    {field: 'desc', value: request.query.desc, operator: '='},
                    {field: 'limit', value: request.query.limit || 10, operator: '='},
                    {field: 'offset', value: request.query.offset || 1, operator: '='},
                    {field: 'Balance', value: 0, operator: '>'}
                ];
                
                getCount(qbo.findCustomers, qbo, request.query.count, queryParams).then((count) => {
                    
                    qbo.findCustomers(queryParams, (err, response) => {
                        var customerInvoiceMap = {};
                        if (err) {
                            return reply(err);
                        } else {
                            var customers = response.QueryResponse.Customer;
                            var promises = [];
                            _(Math.ceil(customers.length / BATCH_SIZE)).times( i => {
                                
                                var segment = customers.slice(i*BATCH_SIZE, i*BATCH_SIZE + BATCH_SIZE);
                                var batches = _.map(segment, (customer, index) => {
                                    return {
                                        bId: customer.Id,
                                        Query: ("select * from Invoice where CustomerRef = '" + customer.Id + "' and Balance > '0'")
                                    }; 
                                });
                                
                                promises.push(batchPromise(qbo, batches));
                                
                            }); 
                            Q.all(promises).done( results => {
                                
                                _.each(results, (result, i) => {
                                    _.each(result.BatchItemResponse, (item, j) => {
                                        customerInvoiceMap[item.bId] = item.QueryResponse.Invoice;
                                    });
                                });
                                
                                response.QueryResponse.Invoice = customerInvoiceMap;
                                response.QueryResponse.totalCount = count; 
                                return reply(response);
                                
                            }, err => {
                                return reply(err); 
                            });
                        }     
                    });
                    
                }, (promiseError) => {
                    console.error(promiseError);
                    return reply(promiseError);
                });
            }
        }
    },
    {
        method: 'POST',
        path: '/payment',
        config: {
            handler: (request, reply) => {
                
                var qbo = QBO(_.findWhere(request.auth.credentials.companies, {isSelected: true}));
                
                var data = request.payload.payments;
               
                var items = _.map(data, function(value, key) {
                    if (value) {
                        var customerId = value.customerId;
                        var invoices = value.invoices;
                         
                        return {
                            bId: customerId,
                            operation: 'create',
                            Payment: createPaymentForCustomer(customerId, invoices)
                        };
                    }
                });
                
                var promises = []; 
                _(Math.ceil(items.length / BATCH_SIZE)).times( i => {
                    var section = items.slice(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE); 
                    promises.push(batchPromise(qbo, section));
                    
                    Q.all(promises).done( results => {
                        var merged = _.union(results);
                        return reply(merged);
                    }, err => {
                        return reply(err); 
                    });
                });
            }
        }
    },
    {
        method: 'GET',
        path: '/invoices',
        config: {
            handler: (request, reply) => {
                
                var qbo = QBO();
                qbo.findInvoices([
                    {field: 'Balance', value: 0, operator: '>'},
                    {field: 'limit', value: request.query.limit || 5, operator: '='},
                    {field: 'asc', value: request.query.asc, operator: '='},
                    {field: 'desc', value: request.query.desc, operator: '='},
                    {field: 'CustomerRef', value: request.query.CustomerRef, operator: '='}
                ], (err, invoices) => {
                    if (err) {
                        return reply(err);
                    } else {
                        return reply(invoices); 
                    }     
                });  
                
            }
        }
    },
    {
        method: ['GET', 'POST'],
        path: '/login',
        config: {
            auth: {
                mode: 'try'   
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
            handler: (request, reply) => {
                
                if (request.method === 'post') {
                    
                    var username = request.payload.username, password = request.payload.password;
                    if (! username || ! password) {
                        return reply.view('login.html', { message: 'Missing username or password'});
                    }
                    Parser.privateUserData({username: username, password: password}).fork(function(failure) {
                        return reply(failure && failure.response && failure.response.body); 
                    }, function(success) {
                        
                        return reply(success) ;
                    });
                    /*db.loginUser(username, password).then( user => {
                            
                            db.find('PrivateUserData', {objectId: user.privateUserData.objectId}, function(err, pud) {
                                if (err) {
                                    return reply(err); 
                                } else {
                                    return reply({user: user, pud: pud});
                                }
                            }, user.sessionToken);
                                user.get('privateUserData').fetch().then(function(privateUserData) {
                                var relation = privateUserData.relation("companies")
                                return relation.query().find();
                            }).then(function(companies) {
                                //console.log('COMPANIES',companies);
                                var sorted = sortAndSetCompanies(companies);
                                var session = {
                                    user: { id: user.id, email: user.get('email'), username: user.get('username'), token: user.getSessionToken() },
                                    companies: sorted
                                }; 
                                request.auth.session.set(session);
                                return reply.redirect('/');
                                //return reply(session);
                            }, function(err) {
                                return reply.view('login.html', { message: err.message });    
                            });
                            
                            
                        },
                        (err) => {
                            //request.session.reset();
                            
                            return reply(err);
                            //return reply.view('login.html', { message: err.message });  
                        }
                    );*/
                } else {
                    if (false){//request.auth.isAuthenticated) {
                        return reply.redirect('/');
                    } else {
                        return reply.view('login.html');    
                    }
                }
                
            }
        }
    },
    {
        method: 'GET',
        path: '/logout',
        config: {
            handler: (request, reply) => {
                
                //Parse.User.logOut(); 
                request.auth.session.clear();
                request.session.reset();
                reply.redirect('/login');
                
            }
        }
    },
    {
        method: 'GET',
        path: '/disconnect',
        config: {
            handler: (request, reply) => {
                //TODO call api, then remove from cognito db
                reply.redirect('/'); 
            }
        }
    },
    {
        method: 'GET',
        path: '/privacy',
        config: {
            handler: (request, reply) => {
                //TODO call api, then remove from cognito db
                reply.view('privacy.html'); 
            }
        }
    },
    {
        method: 'GET',
        path: '/eula',
        config: {
            handler: (request, reply) => {
                
                reply.view('eula.html'); 
            }
        }
    },
    {
        method: 'GET',
        path: '/oauth/requestToken',
        config: {
            handler: (request, reply) => {
                
                var postBody = {
                    url: QBO.REQUEST_TOKEN_URL,
                    oauth: {
                        callback: 'https://' + C9_HOSTNAME + '/oauth/callback',
                        consumer_key: CONSUMER_KEY,
                        consumer_secret: CONSUMER_SECRET
                    }
                };
                Request.post(postBody, (e, r, data) => {
                    var requestToken = Qs.parse(data);
                    //console.info('after post to QBO Reuqest token url.\nRequest Token: ');
                    //console.info(requestToken);
                    request.session.set(QBO_TOKEN_SECRET, requestToken.oauth_token_secret);
                    reply.redirect(QBO.APP_CENTER_URL + requestToken.oauth_token);
                });
                
            }
        }
    },
    {
        method: 'GET',
        path: '/oauth/callback',
        config: {
            handler: (request, reply) => {
                
                var postBody = {
                    url: QBO.ACCESS_TOKEN_URL,
                    oauth: {
                        consumer_key: CONSUMER_KEY,
                        consumer_secret: CONSUMER_SECRET,
                        token: request.query.oauth_token,
                        token_secret: request.session.get(QBO_TOKEN_SECRET),
                        verifier: request.query.oauth_verifier,
                        realmId: request.query.realmId
                    }
                };
                request.session.clear(QBO_TOKEN_SECRET);
                Request.post(postBody, (e, r, data) => {
                    
                    var accessToken = Qs.parse(data);
                    var realmId = postBody.oauth.realmId;
                    var oauthToken = accessToken.oauth_token;
                    var oauthTokenSecret = accessToken.oauth_token_secret;
                    
                    var qbo = QBO({oauthToken: oauthToken, oauthTokenSecret: oauthTokenSecret, realmId: realmId});
                    
                    qbo.getCompanyInfo(realmId, (err, companyInfo) => {
                        
                        if (err) {
                            return reply(err);
                        } else {
                            var token = request.auth.credentials.user.token;
                            var user;// = Parse.User.current();
                            var pud;
                            
                            Parse.User.become(token).then( u => { 
                                
                                user = Parse.User.current();
                                return user.get('privateUserData').fetch();
                                
                            }).then( privateUserData => {
                                    
                                    pud = privateUserData;
                                    
                                    var Company = Parse.Object.extend('Company');
                                    var company = new Company();
                                    company.setACL(new Parse.ACL(user));
                                    
                                    company.set('name', companyInfo.CompanyName); 
                                    company.set('oauthToken', oauthToken);
                                    company.set('oauthTokenSecret', oauthTokenSecret);
                                    company.set('realmId', realmId);
                                    return company.save(); 
                                    
                            }).then( company => {
                                    
                                    var relation = pud.relation("companies");
                            
                                    relation.add(company); 
                                    return pud.save();
                        
                            }).then( privateUserData => {
                    
                                    var relation = privateUserData.relation("companies");
                                    return relation.query().find();
        
                            }).then( companies => {
                                    
                                    request.auth.session.set('companies', sortAndSetCompanies(companies));     
                                    return reply.redirect('/close');
                                    
                            }, err => {
                                    //error creating / saving company
                                    //Parse.User.logOut();
                                    return reply(err); 
                            });
                        }        
                    });
                });
            }
        }
    }, 
    {
        method: 'POST',
        path: '/company',
        config : {
            handler: (request, reply) => {
                var companies = request.auth.credentials.companies;
                var selected = parseInt(request.payload.company, 10);
                
                for (var i=0; i < companies.length; i++) {
                    companies[i].isSelected = (i === selected);    
                }
                request.auth.session.set('companies', companies);
                return reply.redirect('/');
            }    
        }
    },
    {
        method: 'GET',
        path: '/close',
        config: {
            handler: (request, reply) => {
                
                reply.view('close.html');      
                
            }
        }
    }]
);

server.views({
    engines: {
        html: Handlebars,
        hbs: Handlebars
    },
    path: 'src/views',
    partialsPath: 'src/views/partials',
    helpersPath: 'src/views/helpers',
    context: {
        grantUrl: 'https://' + C9_HOSTNAME + '/oauth/requestToken',
        appCenter: QBO.APP_CENTER_BASE
    }
});

server.register(
    [{
        register: Yar,
        options: {
            cookieOptions: {
                password: 'OIyfd43346fgxhbokdChcz1sI',
                clearInvalid: true
            }        
        }
    },
    {
        register: require('good'),
        options: {
            opsInterval: 1000,
            reporters: [{
                reporter: require('good-console'),
                args:[{ log: '*', response: '*' , error: '*', request: '*'}]
            }]    
        }
    }],
    (err) => {
        
        if (err) {
            console.error(err);
            return process.exit(1);
        } else {
            server.start(() => {
                //console.info('consumer key: ' + CONSUMER_KEY + ', consumer secret: ' + CONSUMER_SECRET);
                console.info('server started @ ' + IP + ':' + PORT + '\naccess @ ' + C9_HOSTNAME);
            });
        } 
        
    }
);

var getCount = (fn, qbo, countParam, queryParams) => {    
    var deferred = Q.defer();
    var combined = _.union([{count: true}], queryParams);
    if (countParam) {
        fn.call(qbo, combined, (e, result) => {
            if (e) {
                deferred.reject(e);
            } else {
                deferred.resolve(result.QueryResponse.totalCount); 
            }  
        });   
    } else {
        deferred.resolve(null);    
    }
    return deferred.promise;
};

var batchPromise = (qbo, items) => {
    
    var deferred = Q.defer();
    qbo.batch(items, (err, result) => {
        if (err) {
            deferred.reject(err); 
        } else {
            deferred.resolve(result);     
        }
    });
    
    return deferred.promise;
};

var sortAndSetCompanies = (companies) => {
    var sorted;
    if (SANDBOX) {
        sorted = _.filter(companies, c => {
            return c.get('name').toLowerCase().includes('sandbox');
        }); 
    } else {
        sorted = _.sortBy(companies, (c) => {return c.get('name')});
    }
    sorted[0].set('isSelected', true);
    return sorted;
};

var createPaymentForCustomer = function(customerId, invoices) {
    
    var total = 0.0; 
    var line = _.map(invoices, function(inv, index) {
            var balance = parseFloat(inv.Balance);
            total += balance; 
            return buildPayment(balance, inv.Id); 
        });
        
    return {
        CustomerRef: { value: customerId },
        TotalAmt: (Math.round(total * 100) / 100).toFixed(2),
        sparse: false,
        Line: line
    }; 
};

var buildPayment = function(amount, invoiceId) {
   
    return {
        Amount: amount,
        LinkedTxn: [{
            TxnId: invoiceId,
            TxnType: 'Invoice'
        }]
    }; 
};
