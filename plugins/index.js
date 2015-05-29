'use strict';

const AuthCookie = require('hapi-auth-cookie');
const Yar = require('yar');

module.exports = [AuthCookie, {
  register: require('crumb'),
  options: {
    cookieOptions: {
      isSecure: process.env.ENV !== 'local'
    },
    restful: true
  }
}, {
  register: Yar,
  options: {
    cookieOptions: {
      password: 'OIyfd43346fgxhbokdChcz1sI',
      clearInvalid: true
    }
  }
}, {
  register: require('good'),
  options: {
    opsInterval: 1000,
    reporters: [{
      reporter: require('good-console'),
      args: [{
        log: '*',
        response: '*',
        error: '*',
        request: '*'
      }]
    }]
  }
}];
