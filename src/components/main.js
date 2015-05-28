'use strict';

import React from 'react/addons';
import App from './App';
import FluxComponent from 'flummox/component';
import AppFlux from '../flux/Flux';

const flux = new AppFlux();
flux.addListener('dispatch', payload => {
    console.log('Dispatch: ', payload);
});
/*flux.addListener('error', payload => {
    console.log('Flux Error: ', payload);
});*/

React.render(
  <FluxComponent connectToStores={{
    customers: store => ({
      alerts: store.getErrors()
    })
  }} flux={flux}>
    <App />
  </FluxComponent>,
  document.getElementById('content')
);
