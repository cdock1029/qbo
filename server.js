var Hapi = require('hapi'),
    AuthCookie = require('hapi-auth-cookie'),
    Bell = require('bell'),
    Path = require('path'),
    Request = require('request'),
    Qs = require('qs'),
    
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
    
var testUser = process.env.QBO_USER; 
var users = {};

users[testUser] = { id: testUser, password: process.env.QBO_PW, name: 'Bill Brasky' };

AWS.config.update({region: 'us-east-1'});
var docClient = new DOC.DynamoDB();

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
        isSecure: true
    });
    
    server.auth.strategy('facebook', 'bell', {
        forceHttps: true,
        provider: 'facebook',
        password: 'facebook-encryption-password',
        clientId: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        isSecure: true,
        providerParams: {
            display: 'popup'
        }
    });
    
    server.auth.default('waldon-cookie');
});




server.route([
   {
        method: 'GET',
        path: '/',
        config: {
            auth: {
                mode: 'optional'   
            },
            handler: (request, reply) => {
                if (request.auth.isAuthenticated) {
                    reply('Welcome back ' + request.auth.credentials.profile.displayName);   
                } else {
                    reply('<h4>Hello stranger!</h4><a href="login">Login</a>');
                } 
            }
        }
    },
    {
        method: ['GET', 'POST'],
        path: '/login',
        config: {
            auth: 'facebook',
            handler: (request, reply) => {
                if (request.auth.isAuthenticated) {
                    request.auth.session.set(request.auth.credentials);
                    
                    reply('<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>');
                } else {
                    reply('Not logged in.').code(401);
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/account',
        config: {
            handler: (request, reply) => {
                reply(request.auth.credentials.profile); 
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
    path: '/oauth/start',
    config: {
    handler: (request, reply) => {
        var ctx = {
            user: request.session.get('user'),
            grantUrl: 'https://' + C9_HOSTNAME + '/oauth/requestToken',
            appCenter: QuickBooks.APP_CENTER_BASE
        };
        reply.view('intuit.ejs', ctx);
    }
    }
},{
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
        console.info('In oauth callback');
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
            console.info('after post to access token url.\n Access Token: ');
            console.info(accessToken);
           
            request.session.set('user', {
                oauth_token: accessToken.oauth_token,
                oauth_token_secret: accessToken.oauth_token_secret,
                realmId: postBody.oauth.realmId
            });
            console.info('redirect to close here');
            reply.redirect('https://' + C9_HOSTNAME + '/close');
            
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
        html: require('handlebars')
    },
    path: 'src/views'
});

server.register({
    register: require('yar'),
    options: {
        cookieOptions: {
            password: 'password',
            isSecure: true
        }
    }
}, (err) => {
    if (err) {
        console.error('Failed to load yar plugin.');
        throw err;
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

