'use strict';

//require("babel/polyfill");

var React = require('react/addons');
var App = require('./components/App');
var FluxComponent = require('flummox/component');
var AppFlux = require('./flux/Flux');
var {Accordion, Panel} = require('react-bootstrap');

var flux = new AppFlux(); 
flux.addListener('dispatch', payload => {
    console.log('Dispatch: ', payload);    
});
/*flux.addListener('error', payload => {
    console.log('Flux Error: ', payload);    
});*/

React.render(
    <FluxComponent flux={flux} connectToStores={{
        customers: store => ({
            alerts: store.getErrors()    
        })
    }}>
      <App />
    </FluxComponent>,
    document.getElementById('content')
);


