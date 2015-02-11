var Hapi = require('hapi'),
    Path = require('path'),
    Request = require('request'),
    qs = require('querystring'),

    QuickBooks = require('node-quickbooks'),

    port = 8000;

var server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, '.')
            }
        }
    }
});

var consumerKey = process.env.CONSUMER_KEY,
    consumerSecret = process.env.CONSUMER_SECRET;

server.connection({
    port: port
});

server.register({
    register: require('yar'),
    options: {
        cookieOptions: {
            password: 'password',
            isSecure: false
        }
    }
}, (err) => {
    if (err) {
        console.log('Failed to load yar plugin.');
        throw err;
    }
});

server.route({
    method: 'GET',
    path: '/src/{param*}',
    handler: {
        directory: {
            path: 'src'
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            index: true
        }
    }
});

server.route({
    method: 'GET',
    path: '/oauth/start',
    handler: (request, reply) => {
        var ctx = {
            port: port,
            appCenter: QuickBooks.APP_CENTER_BASE
        };
        reply.view('intuit', ctx);
    }
});

server.route({
    method: 'GET',
    path: '/oauth/requestToken',
    handler: (request, reply) => {
        var postBody = {
            url: QuickBooks.REQUEST_TOKEN_URL,
            oauth: {
                callback: 'http://localhost:' + port + '/oauth/callback',
                consumer_key: consumerKey,
                consumer_secret: consumerSecret
            }
        };
        Request.post(postBody, (e, r, data) => {
            var requestToken = qs.parse(data);

            var qboSession = request.session.get('qbo_session');
            console.log('session: ' + qboSession);
            //if (!qboSession) {
                qboSession = { oauth_token_secret: requestToken.oauth_token_secret };
            //}
            qboSession.last = Date.now();
            console.log(requestToken);
            request.session.set('qbo_session', qboSession);
            reply.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token);
        });
    }
});

server.route({
    method: 'GET',
    path: '/oauth/callback',
    handler: (request, reply) => {
        console.log('oauth callback');
        var qboSession = request.session.get('qbo_session');
        console.log(qboSession);
        var postBody = {
            url: QuickBooks.ACCESS_TOKEN_URL,
            oauth: {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                token: request.query.oauth_token,
                token_secret: qboSession.oauth_token_secret,
                verifier: request.query.oauth_verifier,
                realmId: request.query.realmId
            }
        };
        Request.post(postBody, (e, r, data) => {
            var accessToken = qs.parse(data);
            console.log(accessToken);
            console.log(postBody.oauth.realmId);

            qbo = new QuickBooks(
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
            });
        });
    }
});

server.views({
    engines: {
        ejs: {
            module: require('ejs')
        },
        html: require('handlebars')
    },
    path: 'src/views'
});

server.start(() => {
    console.log('server started at ' + server.info.uri);
});
