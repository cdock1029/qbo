'use strict';

const HOSTNAME = process.env.HOSTNAME || process.env.C9_HOSTNAME;
const Handlebars = require('handlebars');
const QuickBooks = require('../src/utils/QBO');

module.exports = {
  engines: {
    html: Handlebars,
    hbs: Handlebars
  },
  path: 'src/views',
  partialsPath: 'src/views/partials',
  helpersPath: 'src/views/helpers',
  context: {
    grantUrl: 'https://' + HOSTNAME + '/oauth/requestToken',
    appCenter: QuickBooks.APP_CENTER_BASE
  }
};
