//var React = require('react'),
//var Customers = require('./components/Customers');
var App = require('./components/App');

Parse.initialize('bEuAUztO4K72O99Pl3swHUvIXsQaN9J2vd8LezZh','2onVqImx0qiq1DhpWazKeJuUXpXm2aospHfptBVw');

var Temp = React.createClass({
    render: function() {
       return <h4>You're logged in!</h4>; 
    }
});

React.render(
    <Temp />,
    document.getElementById('content')
);


