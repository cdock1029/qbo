'use strict';

const Hapi = require('hapi');

const routes = require('server/routes');
const plugins = require('server/plugins');
const views = require('server/views');
const connection = require('server/connection');
const Path = require('path');

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, '/../public')
      }
    }
  }
});

server.connection(connection);
server.register(plugins, (err) => {

  if (err) {
    console.error(err);
    throw err;
  }

  server.auth.strategy('user', 'cookie', {
    password: 'emGWVAqponcmoscHSKJOEWEEal2h2JLssf205HlJS',
    cookie: 'user',
    isSecure: process.env.ENV !== 'local',
    redirectTo: '/login',
    clearInvalid: true
  });

  server.auth.default('user');
});

server.route(routes);
server.views(views);

module.exports = server;
