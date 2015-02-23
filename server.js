var Hapi = require('hapi'),
    AuthCookie = require('hapi-auth-cookie'),
    Yar = require('yar'),
    Bell = require('bell'),
    _ = require('underscore'),
    Path = require('path'),
    Request = require('request'),
    Qs = require('qs'),
    
    Handlebars = require('handlebars'),
    
    AWS = require('aws-sdk'),

    QuickBooks = require('node-quickbooks');
    
var CONSUMER_KEY = process.env.CONSUMER_KEY,
    CONSUMER_SECRET = process.env.CONSUMER_SECRET;
    
//var IP, PORT, C9_HOSTNAME, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET;
var PORT = process.env.PORT,
    IP = process.env.IP,
    C9_HOSTNAME = process.env.C9_HOSTNAME,
    FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID, 
    FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET,
    GOOGLE_APP_ID = process.env.GOOGLE_APP_ID,
    GOOGLE_APP_SECRET = process.env.GOOGLE_APP_SECRET;
    
var AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID,
    AWS_REGION = process.env.AWS_REGION,
    ROLE_ARN = process.env.IAM_ROLE_ARN,
    POOL_ID = process.env.COGNITO_IDENTITY_POOL_ID,
    DATA_SET_NAME = process.env.COGNITO_DATASET_NAME,
    
    COGNITO_IDENTITY_ID = 'COGNITO_IDENTITY_ID',
    COGNITO_SYNC_TOKEN = 'COGNITO_SYNC_TOKEN',
    COGNITO_SYNC_COUNT = 'COGNITO_SYNC_COUNT',
   
    QBO_TOKEN = 'oauth_token',
    QBO_TOKEN_SECRET = 'oauth_token_secret',
    QBO_REALM_ID = 'realm_id',
    
    
    TABLE_NAME = 'Users';
    
//AWS.config.region = AWS_REGION;
var cognitosync;

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

server.register([Bell, AuthCookie], (err) => {
    if (err) {
        console.error(err);
        return process.exit(1);
    } 
    
    server.auth.strategy('waldon-user', 'cookie', {
        password: 'user-cookie-encryption-password',
        cookie: 'waldon-user',
        isSecure: true,
        clearInvalid: true
    });
    
    server.auth.strategy('facebook', 'bell', {
        forceHttps: true,
        provider: 'facebook',
        password: 'facebook-encryption-password',
        clientId: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        isSecure: true,
        scope: ['public_profile'],
        providerParams: {
            display: 'page'
        }
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
    
    server.auth.default('waldon-user');
});

server.route([
    {
        method: 'GET',
        path: '/src/{param*}',
        config: {
            auth: false,
            handler: {
                directory: {
                    path: 'src'
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/node_modules/{param*}',
        config: {
            auth: false,
            handler: {
                directory: {
                    path: 'node_modules'
                }
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
                var message, ctx = {};
                if (request.auth.isAuthenticated) {
                    //console.info(request.auth.credentials);
                    ctx.profile = request.auth.credentials.profile;
                    
                    //check for QBO session values. Use if here, else lookup in Cognito Dataset
                    var token = request.session.get(QBO_TOKEN), 
                        tokenSecret = request.session.get(QBO_TOKEN_SECRET), 
                        realmId = request.session.get(QBO_REALM_ID); 
                    
                    if (token && tokenSecret && realmId) {
                        var qbo = QBO(token, tokenSecret, realmId);
                        qbo.findCompanyInfos((err, list) => {
                            if (err) {
                                return reply(err);
                            } else {
                                ctx.message = '<pre>' + JSON.stringify(list, null, 4) + '</pre>'; 
                                return reply.view('main.html', ctx);
                            }
                        });
                    } else {
                        setAWSCredentials(request.auth.credentials.token); 
                        AWS.config.credentials.get(function(err) {
                            if (err) {
                                console.error('## credentials.get ##' + err);
                                return process.exit(1);
                            } else {
                                //console.info("Cognito Identity Id: " + AWS.config.credentials.identityId);
                                cognitosync = new AWS.CognitoSync();
                                cognitosync.listRecords({
                                    DatasetName: DATA_SET_NAME, // required
                                    IdentityId: AWS.config.credentials.identityId, // required
                                    IdentityPoolId: POOL_ID // required
                                }, function(err, data) {
                                    if (err) {
                                        console.log('## listRecords ##' + err);
                                        return reply(err);
                                    } else {
                                        for (var i = 0; i < data.Count; i++) {
                                            var record = data.Records[i];
                                            switch(record.Key) {
                                                case QBO_TOKEN:
                                                    request.session.set(QBO_TOKEN, record.Value);
                                                    break;
                                                case QBO_TOKEN_SECRET:
                                                    request.session.set(QBO_TOKEN_SECRET, record.Value);
                                                    break;
                                                case QBO_REALM_ID:
                                                    request.session.set(QBO_REALM_ID, record.Value);
                                                    break;
                                            }   
                                        }
                                        var qbo = QBO(request.session.get(QBO_TOKEN), request.session.get(QBO_TOKEN_SECRET), request.session.get(QBO_REALM_ID));
                                        qbo.findCompanyInfos((err, list) => {
                                            if (err) {
                                                ctx.message = '<pre>' + JSON.stringify(err, null, 4) + '</pre>';
                                                return reply.view('main.html', ctx);
                                            } else {
                                                ctx.message = '<pre>' + JSON.stringify(list, null, 4) + '</pre>'; 
                                                return reply.view('main.html', ctx);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                } else {
                    ctx.message = 'Not authenticated';
                    return reply.view('main.html', ctx);   
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/client',
        config: {
            auth: false,
            handler: (request, reply) => {
                return reply.view('client.html', {GOOGLE_APP_ID: GOOGLE_APP_ID});
            }
        }
    },
    {
        method: 'GET',
        path: '/login',
        config: {
            auth: 'google',
            handler: (request, reply) => {
                if (request.auth.isAuthenticated) {
                    console.info(request.auth.credentials);
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
                reply.redirect('/');
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
        Request.post(postBody, (e, r, data) => {
            var accessToken = Qs.parse(data);
            
            setAWSCredentials(request.auth.credentials.token); 
            console.log(AWS.config.credentials);
            
            //get id token and temp credentials from AWS
            AWS.config.credentials.get(function(err) {
                if (err) {
                    console.error('## credentials.get ##' + err);
                    return process.exit(1);
                } else {
                    console.info("Cognito Identity Id: " + AWS.config.credentials.identityId);
                    
                    cognitosync = new AWS.CognitoSync();
                    
                    cognitosync.listRecords({
                        DatasetName: DATA_SET_NAME, // required
                        IdentityId: AWS.config.credentials.identityId, // required
                        IdentityPoolId: POOL_ID // required
                    }, function(err, data) {
                        if (err) {
                            console.log('## listRecords ##' + err);
                            return reply.redirect('/');
                        } else {
                            var syncCount = data.DatasetSyncCount;
                            
                            var params = {
                                DatasetName: DATA_SET_NAME,
                                IdentityId: AWS.config.credentials.identityId,
                                IdentityPoolId: POOL_ID,
                                SyncSessionToken: data.SyncSessionToken,
                                RecordPatches: [{
                                    Key: 'oauth_token',
                                    Op: 'replace',
                                    SyncCount: syncCount,
                                    Value: accessToken.oauth_token
                                }, {
                                    Key: 'oauth_token_secret',
                                    Op: 'replace',
                                    SyncCount: syncCount,
                                    Value: accessToken.oauth_token_secret
                                }, {
                                    Key: 'realm_id',
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
                                    
                                    //set QBO cookies
                                    request.session.set(QBO_TOKEN, accessToken.oauth_token);
                                    request.session.set(QBO_TOKEN_SECRET, accessToken.oauth_token_secret);
                                    request.session.set(QBO_REALM_ID, postBody.oauth.realmId);
                                }  
                                return reply.redirect('/');
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
                console.info('server started @ ' + IP + ':' + PORT + '\naccess @ ' + C9_HOSTNAME);
            });
        } 
    }
);

var QBO = (token, tokenSec, realmId) => {
    return new QuickBooks(CONSUMER_KEY, CONSUMER_SECRET, token, tokenSec, realmId, true/*use sandbox*/, true/*turn debugging on*/); 
};

var setAWSCredentials = (authToken) => {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        AcountId: AWS_ACCOUNT_ID,
        IdentityPoolId: POOL_ID,
        // optional, only necessary when the identity pool is not configured
        // to use IAM roles in the Amazon Cognito Console
        RoleArn: ROLE_ARN,
        Logins: { // optional tokens, used for authenticated login
            //'graph.facebook.com': request.auth.credentials.token,
            'accounts.google.com': authToken
        }
    });
};
