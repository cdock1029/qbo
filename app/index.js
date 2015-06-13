'use strict';

require('core-js');
/*eslint-disable no-var */
var server = require('server');
/*eslint-enable no-var */

server.start(function() {
  console.info('server started @ ' + server.info.host + ':' + server.info.port + '\naccess @ ' + server.info.uri);
});
