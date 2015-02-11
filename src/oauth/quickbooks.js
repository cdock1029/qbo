var request = require('request'),
    OAuth = require('oauth-1.0a');


module.exports = {

    getRequestTokenAndSecret(consumerKey, consumerSecret, cbUrl) {
        var requestData = {
            url: 'https://oauth.intuit.com/oauth/v1/get_request_token',
            method: 'POST',
            data: {
                oauth_callback: cbUrl
            }
        };
        var oauth = OAuth({
            consumer: {
                public: consumerKey,
                secret: consumerSecret
            }
        });

        request({
            url: requestData.url,
            method: requestData.method,
            form: requestData.data,
            headers: oauth.toHeader(oauth.authorize(requestData))
        });

    },



};
