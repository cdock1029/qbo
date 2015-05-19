'use strict';

require('babel/register');
/*eslint-disable no-var */
var server = require('./server.js');
/*eslint-enable no-var */

server.start(function() {
  console.info('server started @ ' + server.info.host + ':' + server.info.port + '\naccess @ ' + server.info.uri);
});
