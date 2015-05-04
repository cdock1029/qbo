var Hapi = require('hapi'),
    //Hoek = require('hoek'),
    //Wreck = require('wreck'),
    AuthCookie = require('hapi-auth-cookie'),
    Yar = require('yar'),
    //Bell = require('bell'),
    _ = require('underscore'),
    Request = require('request'),
    Qs = require('qs'),
    
    Handlebars = require('handlebars'),
    Boom = require('boom'),
    QuickBooks = require('node-quickbooks');
var Q = require('q');
var Parse = require('parse').Parse;
    
    /* Server params */ 
var PORT = process.env.PORT,
    IP = process.env.IP,
    C9_HOSTNAME = process.env.C9_HOSTNAME,
    
    /* App configuration */
    //Quickbooks
    CONSUMER_KEY = process.env.CONSUMER_KEY,
    CONSUMER_SECRET = process.env.CONSUMER_SECRET,
    
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
   
    /* keys */ 
    QBO_SESSION_KEY = 'qbo',
    QBO_COMPANY_ID = 'qbo_company_id', 
    QBO_TOKEN = 'oauth_token',
    QBO_TOKEN_SECRET = 'oauth_token_secret',
    QBO_REALM_ID = 'realm_id';
    
Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);

var server = new Hapi.Server();//{
/*    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, './')
            }
        }
    }
});*/

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
        clearInvalid: true
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
    },{
        method: ['GET','POST'],
        path: '/companies',
        config: {
            handler: (request, reply) => {
                
                if (request.method === 'post') {
                    var Parse = request.pre.Parse,
                        Company = Parse.Object.extend('Company'),
                        query = new Parse.Query(Company);
                        
                    query.get(request.payload.company, {
                        success: function(company) {
                            var qboObj = {};
                            qboObj.realmId = company.get('realmId');
                            qboObj.oauthToken = company.get('oauthToken');
                            qboObj.oauthTokenSecret = company.get('oauthTokenSecret');
                            qboObj.name = company.get('name'); 
                           
                            request.session.set(QBO_SESSION_KEY, qboObj); 
                            
                            return reply.redirect('/');
                        },
                        error: function(object, err) {
                            return reply(err);
                        }
                    });
                    
                } else {
                    return reply.view('companies.html', {companies: request.pre.companies}); 
                }
            }
        } 
    },
    {
        method: 'GET',
        path: '/',
        config: {
            handler: (request, reply) => {
                var session = request.auth.credentials;
                var ctx = {companies: session.companies};
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
                
                getCount(qbo.findCustomers, qbo, request.query.count, queryParams)
                .then((count) => {
                qbo.findCustomers(queryParams, (err, response) => {
                    var customerInvoiceMap = {};
                    if (err) {
                        return reply(err);
                    } else {
                        var batches = _.map(response.QueryResponse.Customer, (customer, index) => {
                            return {
                                bId: customer.Id,
                                Query: ("select * from Invoice where CustomerRef = '" + customer.Id + "' and Balance > '0'")
                            }; 
                        });
                        
                        qbo.batch(batches, (err, result) => {
                            if (err) {
                                return reply(err); 
                            } else {
                                _.each(result.BatchItemResponse, (item, index) => {
                                    customerInvoiceMap[item.bId] = item.QueryResponse.Invoice;
                                });
                                response.QueryResponse.Invoice = customerInvoiceMap;
                                response.QueryResponse.totalCount = count; 
                                return reply(response); 
                            }
                        });
                        //return reply(customers); 
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
        method: 'GET',
        path: '/count',
        config: {
            handler: (request, reply) => {
                var qbo = QBO(_.findWhere(request.auth.credentials.companies, {isSelected: true}));
                
                qbo.findCustomers({count: true}, function(err, result) {
                    if (err) {
                        return reply(err);
                    } else {
                        return reply(result);
                    }
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
                
                var batchId = 1; 
                var items = _.map(data, function(value, key) {
                    if (value) {
                        var customerId = value.customerId;
                        var invoices = value.invoices;
                         
                        return {
                            bId: batchId++,
                            operation: 'create',
                            Payment: createPaymentForCustomer(customerId, invoices)
                        };
                    }
                });
                
                console.log('batchItemRequest: ', items);
                qbo.batch(items, function(err, result) {
                    if (err) {
                        return reply(err);
                    } else {
                        return reply(result);
                    }
                });
            }
        }
    },
    {
        method: ['GET', 'POST'],
        path: '/update',
        config: {
            handler: (request, reply) => {
                
                var qboSession = request.session.get(QBO_SESSION_KEY);
                var qbo = QBO(qboSession[QBO_TOKEN], qboSession[QBO_TOKEN_SECRET], qboSession[QBO_REALM_ID]);
                qbo.findInvoices([
                    { field: 'asc', value: 'DocNumber' },
                    { field: 'limit', value: parseInt(request.query.limit, 10) },
                    { field: 'offset', value: parseInt(request.query.offset, 10) },
                    { field: 'SalesTermRef', value: '3', operator: '='}], 
                    
                    (err, invoices) => {
                        
                    if (err) {
                        return reply(err);
                    }
                    var updates = [];
                    var updateString = 'Westchester Commons';
                    //return reply(invoices); 
                    
                    /*customers.QueryResponse.Customer.forEach((entity, i, arr) => {
                        console.info(entity); 
                        if (entity.CompanyName.indexOf(updateString) === -1) {
                            entity.CompanyName = updateString + ' ' + entity.CompanyName;
                            updates.push({
                                bId: 'bid' + i,
                                operation: 'update',
                                Customer: entity
                            }); 
                        }
                    });*/
                    invoices.QueryResponse.Invoice.forEach((entity, i, arr) => {
                        console.info(entity); 
                        //if (! entity.hasOwnProperty('DepartmentRef')) {
                            /*entity.DepartmentRef = {};
                            entity.DepartmentRef.name = updateString;
                            entity.DepartmentRef.value = '1';*/
                            
                            entity.SalesTermRef.value = '5';
                            entity.DueDate = entity.TxnDate;
                            updates.push({
                                bId: 'bid' + i,
                                operation: 'update',
                                Invoice: entity
                            }); 
                        //}
                        
                        
                    }); 
                    
                    qbo.batch(updates, (err, response) => {
                        
                        if (err) {
                            return reply(err);
                        } else {
                            return reply(response);
                        }
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
                    Parse.User.logIn(username, password, {
                        success: (user) => {
                            
                            user.get('privateUserData').fetch().then(function(privateUserData) {
                                var relation = privateUserData.relation("companies")
                                return relation.query().find();
                            }).then(function(companies) {
                                console.log('COMPANIES',companies);
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
                        error: (user, err) => {
                            //request.session.reset();
                            return reply.view('login.html', { message: err.message });  
                        }
                    });
                } else {
                    if (request.auth.isAuthenticated) {
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
                
                Parse.User.logOut(); 
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
                url: QuickBooks.REQUEST_TOKEN_URL,
                oauth: {
                    callback: 'https://' + C9_HOSTNAME + '/oauth/callback',
                    consumer_key: CONSUMER_KEY,
                    consumer_secret: CONSUMER_SECRET
                }
            };
            Request.post(postBody, (e, r, data) => {
                var requestToken = Qs.parse(data);
                console.info('after post to QBO Reuqest token url.\nRequest Token: ');
                console.info(requestToken);
                request.session.set(QBO_TOKEN_SECRET, requestToken.oauth_token_secret);
                reply.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token);
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
            url: QuickBooks.ACCESS_TOKEN_URL,
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
                    //var token = request.auth.credentials.user.token;
                    var user = Parse.User.current();
                    var pud;
                    
                    user.get('privateUserData').fetch().then( privateUserData => {
                            
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
                            Parse.User.logOut();
                            return reply(err); 
                    });
                }        
            });
        });
    }}
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
    
}]);

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
        appCenter: QuickBooks.APP_CENTER_BASE
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
                console.info('consumer key: ' + CONSUMER_KEY + ', consumer secret: ' + CONSUMER_SECRET);
                console.info('server started @ ' + IP + ':' + PORT + '\naccess @ ' + C9_HOSTNAME);
            });
        } 
        
    }
);

var getCount = (fn, qbo, countParam, queryParams) => {    
    var deferred = Q.defer();
    var combined = _.union([{field: 'count', value: true, operator: '='}], queryParams);
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

var sortAndSetCompanies = (companies) => {
    var sorted = _.sortBy(companies, (c) => {return c.get('name')});
    sorted[1].set('isSelected', true);
    return sorted;
};

var QBO = (company) => {
    return new QuickBooks(CONSUMER_KEY, CONSUMER_SECRET, /*process.env.TOKEN_3*/company.oauthToken, /*process.env.TOKEN_SECRET_3*/ company.oauthTokenSecret, /*process.env.REALM_3*/ company.realmId, false/*use sandbox*/, true/*turn debugging on*/); 
    
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
