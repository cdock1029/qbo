var Hapi = require('hapi'),
    AuthCookie = require('hapi-auth-cookie'),
    Yar = require('yar'),
    Bell = require('bell'),
    Path = require('path'),
    Request = require('request'),
    Qs = require('qs'),
    
    Handlebars = require('handlebars'),
    
    AWS = require('aws-sdk'),
    DOC = require("dynamodb-doc"),

    QuickBooks = require('node-quickbooks');
    
var consumerKey = process.env.CONSUMER_KEY,
    consumerSecret = process.env.CONSUMER_SECRET;
    
var IP, PORT, C9_HOSTNAME, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET;
    PORT = process.env.PORT,
    IP = process.env.IP,
    C9_HOSTNAME = process.env.C9_HOSTNAME,
    FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID, 
    FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    
var AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID,
    ROLE_ARN = 'arn:aws:iam::448236577045:role/Cognito_QBOAuth_DefaultRole',
    POOL_ID = 'us-east-1:f01f51d9-67be-4ada-97ca-2ac0aa5b03e7',
    DATA_SET_NAME = 'QBO',
    COGNITO_ID_KEY = 'cognitoIdentityId',
    TABLE_NAME = 'Users';
    
var testUser = process.env.QBO_USER; 
var users = {};

users[testUser] = { id: testUser, password: process.env.QBO_PW, name: 'Bill Brasky' };

AWS.config.update({region: 'us-east-1'});

var server = new Hapi.Server();//{
    /*
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, '.')
            }
        }
    }*//*,
    debug: { request: ['log', 'response', 'error', 'request'] }
    */
//});

server.connection({ host: C9_HOSTNAME, address: IP, port: PORT});

server.register([Bell, AuthCookie], (err) => {
    if (err) {
        console.error(err);
        return process.exit(1);
    } 
    
    server.auth.strategy('waldon-cookie', 'cookie', {
        password: 'cookie-encryption-password',
        cookie: 'waldon-auth',
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
        providerParams: {
            display: 'page'
        }
    });
    
    server.auth.default('waldon-cookie');
});

server.register({
    register: Yar,
    options: {
        cookieOptions: {
            password: '0yar-!yarn-zgar^-garzP'
        }        
    }},
    (err) => {
        if (err) {
            console.error(err);
            return process.exit(1);
        } 
    }
);


server.route([
   {
        method: 'GET',
        path: '/',
        config: {
            auth: {
                mode: 'optional'   
            },
            handler: (request, reply) => {
                var ctx = {};
                var cognitoIdentityId = request.session.get(COGNITO_ID_KEY);
                if (request.auth.isAuthenticated && cognitoIdentityId) {
                    var cognitoSyncClient = new AWS.CognitoSync(); 
                    var recordsParams = {
                        DatasetName: DATA_SET_NAME,
                        IdentityId: cognitoIdentityId,
                        IdentityPoolId: POOL_ID
                    };
                    cognitoSyncClient.listRecords(recordsParams, (err, data) => {
                        if (err) {
                            console.error(err);
                            return process.exit(1);
                        } else {
                            //hack
                            for (var record of data.Records) {
                                switch (record.key) {
                                    case 'oauth_token':
                                        
                                        break;
                                    case 'oauth_token_secret':
                                        
                                        break;
                                    case 'realm_id': 
                                        
                                        break;
                                }
                            }           
                        }
                    });
                
                    ctx.profile = request.auth.credentials.profile; 
                } else {
                   
                } 
                reply.view('main.html', ctx);   
            }
        }
    },
    {
        method: 'GET',
        path: '/login',
        config: {
            auth: 'facebook',
            handler: (request, reply) => {
                if (request.auth.isAuthenticated) {
                    var logins = {'graph.facebook.com': request.auth.credentials.token};
                     
                    // Parameters required for CognitoIdentityCredentials
                    var params = {
                        AccountId: AWS_ACCOUNT_ID,
                        RoleArn: ROLE_ARN,
                        IdentityPoolId: POOL_ID,
                        Logins: logins
                    };
                    AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
                    // Cognito credentials 
                    AWS.config.credentials.get((err) => {
                        if (err) {  // an error occurred
                            return reply(err);
                        } else {      // successful response
                            console.info(request.auth.credentials);
                            request.auth.session.set(request.auth.credentials);
                            request.session.set(COGNITO_ID_KEY, AWS.config.credentials.identityId);
                            return reply.redirect('/');
                        }
                    });
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
    /*{
    method: 'GET',
    path: '/src/{param*}',
    handler: {
        directory: {
            path: 'src'
        }
    }
},{
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            index: true
        }
    }
},*/{
    method: 'GET',
    path: '/oauth/requestToken',
    config: {
    handler: (request, reply) => {
        var postBody = {
            url: QuickBooks.REQUEST_TOKEN_URL,
            oauth: {
                callback: 'https://' + C9_HOSTNAME + '/oauth/callback',
                consumer_key: consumerKey,
                consumer_secret: consumerSecret
            }
        };
        Request.post(postBody, (e, r, data) => {
            var requestToken = Qs.parse(data);
            console.info('after post to QBO Reuqest token url.\nRequest Token: ');
            console.info(requestToken);
            request.session.set('oauth_token_secret', requestToken.oauth_token_secret);
            reply.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token);
        });
    }}
},{
    method: 'GET',
    path: '/oauth/callback',
    config: {
    handler: (request, reply) => {
        var postBody = {
            url: QuickBooks.ACCESS_TOKEN_URL,
            oauth: {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                token: request.query.oauth_token,
                token_secret: request.session.get('oauth_token_secret'),
                verifier: request.query.oauth_verifier,
                realmId: request.query.realmId
            }
        };
        Request.post(postBody, (e, r, data) => {
            var accessToken = Qs.parse(data);
            var cognitoIdentityId = request.session.get(COGNITO_ID_KEY);
            
            var cognitoSyncClient = new AWS.CognitoSync(); 
            var recordsParams = {
                DatasetName: DATA_SET_NAME,
                IdentityId: cognitoIdentityId,
                IdentityPoolId: POOL_ID
            };
            cognitoSyncClient.listRecords(recordsParams, (err, data) => {
                if (err) {
                    console.error(err);
                    return process.exit(1);
                } else {
                    var date = new Date();
                    var params = {
                        DatasetName: DATA_SET_NAME, /* required */
                        IdentityId: cognitoIdentityId, /* required */
                        IdentityPoolId: POOL_ID, /* required */
                        SyncSessionToken: data.SyncSessionToken, /* required */
                        RecordPatches: [{
                              Key: 'oauth_token', /* required */
                              Op: 'replace', /* required */
                              SyncCount: 0, /* required */
                              DeviceLastModifiedDate: date,
                              Value: accessToken.oauth_token
                        },{
                              Key: 'oauth_token_secret', /* required */
                              Op: 'replace', /* required */
                              SyncCount: 0, /* required */
                              DeviceLastModifiedDate: date,
                              Value: accessToken.oauth_token_secret
                        },{
                              Key: 'realm_id', /* required */
                              Op: 'replace', /* required */
                              SyncCount: 0, /* required */
                              DeviceLastModifiedDate: date,
                              Value: request.query.realmId
                        }]
                    }; 
                    cognitoSyncClient.updateRecords(params, function(err, data) {
                        if (err) {
                            console.error(err); // an error occurred
                            reply(err)
                        } else {
                            console.log('\ncognito records updated ! \n');
                            console.log(data);           // successful response
                            reply.redirect('https://' + C9_HOSTNAME + '/close');
                        }
                    });
                    
                } 
            });
            
            
            /*qbo = new QuickBooks(
                consumerKey,
                consumerSecret,
                accessToken.oauth_token,
                accessToken.oauth_token_secret,
                postBody.oauth.realmId,
                true, //use sandbox
                true //turn debugging on
            );
            qbo.getCompanyInfo('1327360235', (_, companyInfo) => {
                reply(companyInfo);
            });*/
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
        ejs: require('ejs'),
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





var options = {
    opsInterval: 1000,
    reporters: [{
        reporter: require('good-console'),
        args:[{ log: '*', response: '*' , error: '*', request: '*'}]
    }/*, {
        reporter: require('good-file'),
        args: ['./test/fixtures/awesome_log', { ops: '*' }]
    }, {
        reporter: require('good-http'),
        args: [{ error: '*' }, 'http://prod.logs:3000', {
            threshold: 20,
            wreck: {
                headers: { 'x-api-key' : 12345 }
            }
        }]
    }*/]
};

server.register({
    register: require('good'),
    options: options
}, (err) => {

    if (err) {
        console.error(err);
    } else {
        server.start(() => {
            console.info('server started @ ' + IP + ':' + PORT + '\naccess @ ' + C9_HOSTNAME);
        });
    }
});

