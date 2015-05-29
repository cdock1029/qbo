'use strict';

module.exports = {
  host: process.env.HOSTNAME || process.env.C9_HOSTNAME || 'localhost',
  address: process.env.IP,
  port: process.env.PORT || 3000
};
