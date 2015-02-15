var Hapi = require('hapi'),
    Path = require('path'),
    Request = require('request'),
    Qs = require('qs'),
    
    AWS = require('aws-sdk'),
    DOC = require("dynamodb-doc"),

    QuickBooks = require('node-quickbooks');

var testUser = process.env.QBO_USER; 
var users = {};

users[testUser] = {
    id: testUser,
    password: process.env.QBO_PW,
    name: 'Bill Brasky'
};

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


var consumerKey = process.env.CONSUMER_KEY,
    consumerSecret = process.env.CONSUMER_SECRET;
    
var {IP, PORT, C9_HOSTNAME}  = process.env;

server.connection({
    host: C9_HOSTNAME,
    address: IP,
    port: PORT
});

var home = (request, reply) => {

    reply('<html><head><title>Login page</title></head><body><h3>Welcome '
      + request.auth.credentials.name
      + '!</h3><br/><form method="get" action="/logout">'
      + '<input type="submit" value="Logout">'
      + '</form></body></html>');
};

var login = (request, reply) => {

    if (request.auth.isAuthenticated) {
        return reply.redirect('/');
    }

    var message = '';
    var account = null;

    if (request.method === 'post') {

        if (!request.payload.username ||
            !request.payload.password) {

            message = 'Missing username or password';
        }
        else {
            account = users[request.payload.username];
            if (!account ||
                account.password !== request.payload.password) {

                message = 'Invalid username or password';
            }
        }
    }

    if (request.method === 'get' ||
        message) {

        return reply('<html><head><title>Login page</title></head><body>'
            + (message ? '<h3>' + message + '</h3><br/>' : '')
            + '<form method="post" action="/login">'
            + 'Username: <input type="text" name="username"><br>'
            + 'Password: <input type="password" name="password"><br/>'
            + '<input type="submit" value="Login"></form></body></html>');
    }

    request.auth.session.set(account);
    return reply.redirect('/');
};

var logout = function (request, reply) {

    request.auth.session.clear();
    return reply.redirect('/');
};


server.register(require('hapi-auth-cookie'), function (err) {
    if (err) {
        console.err(err);
    } else {
        server.auth.strategy('session', 'cookie', {
            password: 'secret',
            cookie: 'sid-example',
            redirectTo: '/login',
            isSecure: true
        });
    }
});

server.route([
   {
        method: 'GET',
        path: '/',
        config: {
            handler: home,
            auth: 'session'
        }
    },
    {
        method: ['GET', 'POST'],
        path: '/login',
        config: {
            handler: login,
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/logout',
        config: {
            handler: logout,
            auth: 'session'
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
    },
    auth: 'session'
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
    },
    auth: 'session'}
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
    },
    auth: 'session'}
},{
    method: 'GET',
    path: '/close',
    config: {
    handler: (request, reply) => {
        reply.view('close.html');      
    },
    auth: 'session'}
    
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

