

var App = React.createClass({
    
    mixins: [React.addons.LinkedStateMixin],
    
    getInitialState: function() {
        
        var initial = { username: '', password: '', message: null };
        
        if (Parse.User.current()) {
            initial.loggedIn = true;
        } else {
            initial.loggedIn = false;
        }
        return initial;  
    },
    
    _login: function(e) {
        e.preventDefault();
        if (this.state.username && this.state.password) {
            var self = this;
            Parse.User.logIn(this.state.username, this.state.password,{
                success: function(user)  {
                    console.info(user);
                    self.setState({ username: '', password: '', loggedIn: true});
                }, 
                error: function(err) {
                    self.setState({ username: '', password: '', message: err.message });      
                }
            }); 
        } else {
            this.setState({ message: 'Enter valid username and password'});
        }    
    },
    
    _logout: function(e) {
        e.preventDefault();
        Parse.User.logOut();   
        this.setState({ loggedIn: false });
    },
    
    render: function() {
        var content = null; 
        var messageBlock = null;
        
        if (this.state.loggedIn) {
            
            content = (
                <div> 
                    <button onClick={this._logout}>Logout</button>
                    <Customers />
                </div>
            ); 
        } else {
            content = (<div>
                <form>
                    <label>Username:</label>  
                    <input type="text" valueLink={this.linkState('username')}/> 
                    <label>Password:</label>  
                    <input type="password" valueLink={this.linkState('password')}/> 
                    <button onClick={this._login}>Login</button>
                </form>
            </div>);
            if (this.state.message) {
                console.log(this.state.message);
                messageBlock = <h4>Error logging in: {this.state.message}</h4> 
            }
        }
        return(
            <div>
                {messageBlock}
                {content}  
            </div>
        ); 
    }
});

module.exports = App;