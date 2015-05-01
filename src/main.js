window.React = require('react/addons');
//var Customers = require('./components/Customers');
var App = require('./components/App');
var {Accordion, Panel} = require('react-bootstrap');

//Parse.initialize('bEuAUztO4K72O99Pl3swHUvIXsQaN9J2vd8LezZh','2onVqImx0qiq1DhpWazKeJuUXpXm2aospHfptBVw');

React.render(
    <App />,
    document.getElementById('content')
);


