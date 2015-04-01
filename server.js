var Hapi = require('hapi'),
    Hoek = require('hoek'),
    Wreck = require('wreck'),
    AuthCookie = require('hapi-auth-cookie'),
    Yar = require('yar'),
    Bell = require('bell'),
    _ = require('underscore'),
    Request = require('request'),
    Qs = require('qs'),
    Handlebars = require('handlebars'),
    AWS = require('aws-sdk'),
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
    
    
AWS.config.region = AWS_REGION;

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

server.register([Bell, AuthCookie, { register: require('crumb'), options: { cookieOptions: { isSecure: true }, restful: true }}], (err) => {
    if (err) {
        console.error(err);
        return process.exit(1);
    } 
    
    server.auth.strategy('waldon-qbo', 'cookie', {
        password: 'user-cookie-encryption-password-alskval;sdjvalskdalskdjal;skdjf',
        cookie: 'waldon-qbo',
        isSecure: true,
        clearInvalid: true
    });
    
    server.auth.strategy('google', 'bell', {
        forceHttps: true,
        provider: 'google',
        password: 'google-encryption-password',
        clientId: GOOGLE_APP_ID,
        clientSecret: GOOGLE_APP_SECRET,
        isSecure: true,
        scope: ['profile']
    });
    
    server.auth.default('waldon-qbo');
});

server.route([
    {
        method: 'GET',
        path: '/src/{param*}',
        config: {
            auth: false,
            handler: {
                directory: {
                    path: (request) => {
                        return 'src'; 
                    }
                }
            }
        }
    },{
        method: 'GET',
        path: '/companies',
        config: {
            handler: (request, reply) => {
                return reply.view('companies.html'); 
            }
        } 
    },
    {
        method: 'GET',
        path: '/',
        config: {
            auth: {
                mode: 'optional'   
            },
            handler: (request, reply) => {
                
                var ctx = {};
                if (request.auth.isAuthenticated) {
                    ctx.profile = request.auth.credentials.profile;
                   
                    var qboSession = request.session.get(QBO_SESSION_KEY); 
                    //check for QBO session values. Use if here, else lookup in Cognito Dataset
                    
                    if (qboSession) {
                        var qbo = QBO(qboSession[QBO_TOKEN], qboSession[QBO_TOKEN_SECRET], qboSession[QBO_REALM_ID]);
                        qbo.findCompanyInfos((err, data) => {
                            
                            if (err) {
                                return reply(err);
                            } else {
                                ctx.message = '<h3>qbo session was set</h3>';
                                ctx.company = data.QueryResponse.CompanyInfo[0].CompanyName;
                                ctx.qbo = true;
                                return reply.view('main.html', ctx);
                            }
                            
                        });
                    } else {
                        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                            AcountId: AWS_ACCOUNT_ID,
                            IdentityPoolId: POOL_ID,
                            RoleArn: ROLE_ARN,
                            Logins: {
                                'accounts.google.com': request.auth.credentials.idToken
                            }
                        });
                        AWS.config.credentials.get(function(err) {
                    
                            if (err) {
                                console.error('## credentials.get ##' + err);
                                return reply(err);
                            } else {
                                //QBO stuff
                                var cognitosync = new AWS.CognitoSync();
                                
                                cognitosync.listRecords({
                                    DatasetName: DATA_SET_NAME,
                                    IdentityId: AWS.config.credentials.identityId,
                                    IdentityPoolId: POOL_ID
                                }, function(err, data) {
                                    if (err) {
                                        console.log('## listRecords ##' + err);
                                        return reply(err);
                                    } else {
                                        var qboCredentials = {};
                                        for (var i = 0; i < data.Count; i++) {
                                            var record = data.Records[i];
                                            switch(record.Key) {
                                                case QBO_COMPANY_ID:
                                                    qboCredentials[QBO_COMPANY_ID] = record.Value; 
                                                    break;
                                                case QBO_TOKEN:
                                                    qboCredentials[QBO_TOKEN] = record.Value;
                                                    //request.session.set(QBO_TOKEN, record.Value);
                                                    break;
                                                case QBO_TOKEN_SECRET:
                                                    qboCredentials[QBO_TOKEN_SECRET] = record.Value;
                                                    //request.session.set(QBO_TOKEN_SECRET, record.Value);
                                                    break;
                                                case QBO_REALM_ID:
                                                    qboCredentials[QBO_REALM_ID] = record.Value;
                                                    //request.session.set(QBO_REALM_ID, record.Value);
                                                    break;
                                            }   
                                        }
                                        if (typeof qboCredentials[QBO_TOKEN] === 'undefined' ||
                                            typeof qboCredentials[QBO_TOKEN_SECRET] === 'undefined' ||
                                            typeof qboCredentials[QBO_REALM_ID] === 'undefined') {
                                            
                                            //show the button
                                            return reply.view('main.html', ctx);
                                        }
                                        //save values from cognito DB into QBO session
                                        request.session.set(QBO_SESSION_KEY, qboCredentials);
                                        var qbo = QBO(qboCredentials[QBO_TOKEN], qboCredentials[QBO_TOKEN_SECRET], qboCredentials[QBO_REALM_ID]);
                                        qbo.findCompanyInfos((err, data) => {
                                            
                                            if (err) {
                                                return reply(err);
                                            } else {
                                                ctx.message = '<h3>qbo session wasn\'t set, got values from Cognito</h3>';
                                                ctx.company = data.QueryResponse.CompanyInfo[0].CompanyName;
                                                ctx.qbo = true;
                                                return reply.view('main.html', ctx);
                                            }
                                            
                                        });
                                    }
                                });  
                            }
                            
                        });
                    }
                } else {
                    ctx.message = 'Not logged in';
                    return reply.view('main.html', ctx);   
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/customers',
        config: {
            handler: (request, reply) => {
                var qboSession = request.session.get(QBO_SESSION_KEY);  
                var qbo = QBO(qboSession[QBO_TOKEN], qboSession[QBO_TOKEN_SECRET], qboSession[QBO_REALM_ID]);
                qbo.findCustomers({
                    asc: request.query.asc,
                    desc: request.query.desc,
                    limit: request.query.limit || 5
                }, (err, customers) => {
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
                var qboSession = request.session.get(QBO_SESSION_KEY);  
                var qbo = QBO(qboSession[QBO_TOKEN], qboSession[QBO_TOKEN_SECRET], qboSession[QBO_REALM_ID]);
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
                var qboSession = request.session.get(QBO_SESSION_KEY);  
                var qbo = QBO(qboSession[QBO_TOKEN], qboSession[QBO_TOKEN_SECRET], qboSession[QBO_REALM_ID]);
                qbo.findInvoices({
                    asc: request.query.asc,
                    desc: request.query.desc,
                    limit: request.query.limit || 5
                }, (err, invoices) => {
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
        /** Login to 'Google', as well as 'AWS Cognito' */
        method: 'GET',
        path: '/login',
        config: {
            auth: 'google',
            handler: (request, reply) => {
                if (request.auth.isAuthenticated) {
                    //console.info(request.auth.credentials);
                    request.auth.session.set(request.auth.credentials);
                    return reply.redirect('/');
                } else {
                    return reply('Not loggin in.').code(401);
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/logout',
        config: {
            auth: false,
            handler: (request, reply) => {
                
                request.auth.session.clear();
                request.session.reset();
                reply.redirect('/');
                
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
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                AcountId: AWS_ACCOUNT_ID,
                IdentityPoolId: POOL_ID,
                RoleArn: ROLE_ARN,
                Logins: {
                    'accounts.google.com': request.auth.credentials.idToken
                }
            });
            console.log(AWS.config.credentials);
            
            //get id token and temp credentials from AWS
            AWS.config.credentials.get(function(err) {
                
                if (err) {
                    console.error('## credentials.get ##' + err);
                    return process.exit(1);
                } else {
                    var cognitosync = new AWS.CognitoSync();
                    cognitosync.listRecords({
                        DatasetName: DATA_SET_NAME, // required
                        IdentityId: AWS.config.credentials.identityId, // required
                        IdentityPoolId: POOL_ID // required
                    }, function(err, data) {
                        
                        if (err) {
                            console.log('## listRecords ##' + err);
                            return process.exit(1);
                        } else {
                            var syncCount = data.DatasetSyncCount;
                            var params = {
                                DatasetName: DATA_SET_NAME,
                                IdentityId: AWS.config.credentials.identityId,
                                IdentityPoolId: POOL_ID,
                                SyncSessionToken: data.SyncSessionToken,
                                RecordPatches: [{
                                    Key: QBO_TOKEN,
                                    Op: 'replace',
                                    SyncCount: syncCount,
                                    Value: accessToken.oauth_token
                                }, {
                                    Key: QBO_TOKEN_SECRET,
                                    Op: 'replace',
                                    SyncCount: syncCount,
                                    Value: accessToken.oauth_token_secret
                                }, {
                                    Key: QBO_REALM_ID,
                                    Op: 'replace',
                                    SyncCount: syncCount,
                                    Value: postBody.oauth.realmId
                                }]
                                
                            }; 
                            cognitosync.updateRecords(params, (err, data) => {
                                
                                if (err) {
                                    console.error('## updateRecords ## ' + err);
                                    return process.exit(1);
                                } else {
                                    var qboCredentials = {};
                                    qboCredentials[QBO_TOKEN] = accessToken.oauth_token;
                                    qboCredentials[QBO_TOKEN_SECRET] = accessToken.oauth_token_secret;
                                    qboCredentials[QBO_REALM_ID] = postBody.oauth.realmId;
                                    //set QBO cookie
                                    request.session.set(QBO_SESSION_KEY, qboCredentials);
                                }  
                                return reply.redirect('/close');
                                
                            });
                        }  
                    });
                }
            }); 
           
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
                password: '0yar-!yarn-zgar^-garzP',
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
    
    return new QuickBooks(CONSUMER_KEY, CONSUMER_SECRET, token, tokenSec, realmId, false/*use sandbox*/, true/*turn debugging on*/); 
    
};

    
