
var Invoices = React.createClass({
    mixins: [ParseReact.Mixin], 
    
    observe: function() {
    // Subscribe to all Invoice objects, ordered by creation date 
    // The results will be available at this.data.invoices
        return {
            invoices: (new Parse.Query('Invoice')).ascending('createdAt')
        };
    },
    
    render: function() {
        <ol>
            {this.data.invoices.map(function(inv) {
                return <li key={inv.objectId}>Name: {inv.name}</li>; 
            })} 
        </ol> 
    }
});

module.exports = Invoices;