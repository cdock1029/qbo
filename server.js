'use strict';

const Hapi = require('hapi');

const routes = require('./routes');
const plugins = require('./plugins');
const views = require('./views');
const connection = require('./connection');

const server = new Hapi.Server();

server.connection(connection);
server.register(plugins, (err) => {

  if (err) {
    console.error(err);
    throw err;
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

server.route(routes);
server.views(views);

module.exports = server;
