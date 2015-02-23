var React = require('react'),
    Customers = require('./components/Customers'),
    QBO = require('node-quickbooks'),
    AWS = require('aws-sdk');

var COGNITO_PARAMS = {
    AccountId: "448236577045",
    RoleArn: "arn:aws:iam::448236577045:role/Cognito_QBOAuth_DefaultRole",
    IdentityPoolId: "us-east-1:f01f51d9-67be-4ada-97ca-2ac0aa5b03e7"   
};
var DATA_SET_NAME = "QBO";

AWS.config.region = 'us-east-1';
var cognitosync;

window.signinCallback = (authResult) => {
    if (authResult['status']['signed_in']) {
        // Update the app to reflect a signed in user
        // Hide the sign-in button now that the user is authorized, for example:
        document.getElementById('signinButton').setAttribute('style', 'display: none');
        document.getElementById('qboButton').setAttribute('style', 'display:block');
        COGNITO_PARAMS.Logins = {
            'accounts.google.com': authResult.id_token
        };
        AWS.config.credentials = new AWS.CognitoIdentityCredentials(COGNITO_PARAMS);
        AWS.config.credentials.get(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Cognito Identity Id: " + AWS.config.credentials.identityId);
                
                cognitosync = new AWS.CognitoSync();
                
                cognitosync.listRecords({
                    DatasetName: DATA_SET_NAME,
                    IdentityId: AWS.config.credentials.identityId,
                    IdentityPoolId: COGNITO_PARAMS.IdentityPoolId
                }, (err, data) => {
                    if (err) {
                        console.error('## list records ##' + err);
                    } else {
                        console.log('QBO record found for Cognito user');
                        var token, tokenSecret, realmId, consumerKey, consumerSecret;
                        for (var i = 0; i < data.Count; i++) {
                            var record = data.Records[i];
                            switch(record.Key) {
                                case 'consumer_key':
                                    consumerKey = record.Value;
                                    break;
                                case 'consumer_secret':
                                    consumerSecret = record.Value;
                                    break;
                                case 'oauth_token':
                                    token = record.Value;
                                    break;
                                case 'oauth_token_secret':
                                    tokenSecret = record.Value;
                                    break;
                                case 'realm_id':
                                    realmId = record.Value;
                                    break;
                                default:
                                    console.log('Unrecognized Key: ' + record.Key + ', with value: ' + record.Value);
                                    break;
                            }      
                        }
                        console.log(`building QBO == cKey: ${consumerKey}, cSec: ${consumerSecret}, 
                        token: ${token}, tokenSecret: ${tokenSecret}, realmId: ${realmId}`);
                        
                        var qbo = new QBO(consumerKey, consumerSecret, token, tokenSecret, realmId, true, true);
                        appFunc(qbo); 
                    }    
                });
                
            }
        });
        console.log('token: ' + authResult.id_token);
    } else {
        // Update the app to reflect a signed out user
        // Possible error values:
        //   "user_signed_out" - User is signed-out
        //   "access_denied" - User denied access to your app
        //   "immediate_failed" - Could not automatically log in the user
        console.log('Sign-in state: ' + authResult['error']);
    }
} 

var appFunc = (QBO) => {
    React.render(
        <Customers QBO={QBO} />,
        document.getElementById('content')
    );
};


