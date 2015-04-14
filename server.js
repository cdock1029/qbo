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


var extension = function (request, reply) {
    //var companySession = request.session && request.session.get(QBO_SESSION_KEY),
    var user = Parse.User.current(),
        path = request.path;
    
    if (! user) {//&& path !== '/login') {
        request.setUrl('/login');
    } 
    
    return reply.continue(); 
};
//server.ext('onRequest', extension);


server.register([AuthCookie, { register: require('crumb'), options: { cookieOptions: { isSecure: true }}}], (err) => {
    if (err) {
        console.error(err);
        return process.exit(1);
    } 
    
    server.auth.strategy('user', 'cookie', {
        password: 'FBeJ2ibHNmG9SaSFWa;alssf2052h2JLHlS0FlJS',
        cookie: 'user',
        isSecure: true,
        clearInvalid: true
    });
    
    //server.auth.default('user');
});

var parsePre = function(request, reply) {
    
    var Parse = require('parse').Parse;
    Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
    
    return reply(Parse);
};

var userPre = function(request, reply) {
    var Parse = request.pre.Parse,
        token = request.session && request.session.get('token');
    
    if (token) {
        Parse.User.become(token).then(function(user) {
            return reply(user); 
        }, function(err) {
            return reply(err).takeover(); 
        });
    } else {
        reply.redirect('/login').takeover(); 
    }
};

var companiesPre = function(request, reply) {
    
    if (request.method === 'get') {
        var Parse = request.pre.Parse, 
            user = request.pre.user;
        
        user.get('privateUserData').fetch().then(function(privateUserData) {
            var relation = privateUserData.relation("companies");
            return relation.query().find();
        }).then(function(companies) {
            return reply(companies);
        }, function(err) {
            return reply(err).takeover();
        });
    } else {
        return reply.continue();
    }
};

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
            pre: [
                { method: parsePre, assign: 'Parse'}, 
                { method: userPre, assign: 'user'}, 
                { method: companiesPre, assign: 'companies' }
            ],
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
            /*pre: [
                {method: parsePre, assign: 'Parse'}, 
                {method: userPre, assign: 'user'}
            ],*/
            handler: (request, reply) => {
                var ctx = {};
                var company = request.session.get(QBO_SESSION_KEY); 
                if (company) {
                    ctx.companyName = company.name;    
                } 
                return reply.view('main.html', ctx);
            }
        }
    },
    {
        method: 'GET',
        path: '/customers',
        config: {
            handler: (request, reply) => {
                
                var qbo = QBO();
                qbo.findCustomers([
                    {field: 'asc', value: request.query.asc, operator: '='},
                    {field: 'desc', value: request.query.desc, operator: '='},
                    {field: 'limit', value: request.query.limit || 10, operator: '='},
                    {field: 'Balance', value: 0, operator: '>'}
                ], (err, customers) => {
                    if (err) {
                        return reply(err);
                    } else {
                        return reply(customers); 
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
                var qbo = QBO();
                
                qbo.
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
                    {field: 'desc', value: request.query.asc, operator: '='},
                    {field: 'asc', value: request.query.asc, operator: '='},
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
            //pre: [{method: parsePre, assign: 'Parse'}],
            handler: (request, reply) => {
                
                if (request.method === 'post') {
                    
                    var username = request.payload.username, password = request.payload.password;
                    if (! username || ! password) {
                        return reply.view('login.html', { message: 'Missing username or password'});
                    } 
                    var Parse = request.pre.Parse;
                    Parse.User.logIn(username, password, {
                        success: (user) => {
                            /*
                            user.get('privateUserData').fetch().then(function(privateUserData) {
                                var relation = privateUserData.relation("companies")
                                return relation.query().find();
                            }).then(function(companies) {
                                return reply({user: user, companies: companies});
                            }, function(err) {
                                return reply.view('login.html', { message: err.message });    
                            });*/
                           
                            request.session.set('token', user.getSessionToken()); 
                            return reply.redirect('/companies');
                        },
                        error: (user, err) => {
                            //request.session.reset();
                            return reply.view('login.html', { message: err.message });  
                        }
                    });
                } else {
                    return reply.view('login.html');    
                }
                
            }/*,
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                } 
            }*/
        }
    },
    {
        method: 'GET',
        path: '/logout',
        config: {
            //pre: [{method: parsePre, assign: 'Parse'}],
            handler: (request, reply) => {
                
                request.pre.Parse.User.logOut(); 
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
        //pre: [{ method: companiesPre, assign: 'companies'}],
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
            return reply({postBody: postBody, accessToken: accessToken});
           
            /*var user = Parse.User.current();
            var privateUserData = user.get('privateUserData');
            var relation = privateUserData.relation('companies'); 
            
            //var Company = Parse.Object.extend('Company');
            //var query = new Parse.Query(Company);
            var query = relation.query();
            
            query.equalTo('realmId', postBody.oauth.realmId);  
            */
            
           
        });
    }}
},{
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

var QBO = (token, tokenSec, realmId) => {
    
    return new QuickBooks(CONSUMER_KEY, CONSUMER_SECRET, 'qyprd4ca41z2erv8RQ4Uge3GaTJHtp7oBjUw9Cmth3HEov5G'/*token*/,'cdC5yzpNnTPfa33tDyfO5iXCCAkA7ScMuiqwJNdx'/*tokenSec*/,1315144815 /*realmId*/, true/*use sandbox*/, true/*turn debugging on*/); 
    
};

var getParseSession = (parseUser) => {
    var obj = {};
    obj.id = parseUser.id;
    obj.username = parseUser.username;
    obj.email = parseUser.email;
    obj.sessionToken = parseUser._sessionToken;
    return obj;
};

var createPaymentList = function(invoiceList) {
   
    _.map(invoiceList, function(inv, index) {
        var id, balance;
        
        id = inv.Id;//string
        balance = inv.Balance;//decimal
        return {
            Amount: balance,
            LinkedTxn: [{
                TxnId: id,
                TxnType: 'Invoice'
            }]
        }; 
        
    }); 
    
};
