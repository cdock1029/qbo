window.React = require('react/addons');
//var Customers = require('./components/Customers');
var App = require('./components/App');
var {Accordion, Panel} = require('react-bootstrap');

//Parse.initialize('bEuAUztO4K72O99Pl3swHUvIXsQaN9J2vd8LezZh','2onVqImx0qiq1DhpWazKeJuUXpXm2aospHfptBVw');
var a = <Accordion>
                <Panel header='Collapsible Group Item #1' eventKey='1'>
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                </Panel>
                <Panel header='Collapsible Group Item #2' eventKey='2'>
                  Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                </Panel>
                </Accordion>;
React.render(
    <App />,
    document.getElementById('content')
);


