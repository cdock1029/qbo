'use strict';

const HOSTNAME = process.env.HOSTNAME || process.env.C9_HOSTNAME;
const Handlebars = require('handlebars');
const QuickBooks = require('server/utils/QBO');

module.exports = {
  engines: {
    html: Handlebars,
    hbs: Handlebars
  },
  path: 'app/node_modules/public',
  context: {
    grantUrl: 'https://' + HOSTNAME + '/oauth/requestToken',
    appCenter: QuickBooks.APP_CENTER_BASE
  }
};
