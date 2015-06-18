'use strict';

const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

const PARSE_APP_ID = process.env.PARSE_APP_ID;
const PARSE_REST_KEY = process.env.PARSE_REST_KEY;

const HOSTNAME = process.env.HOSTNAME || process.env.C9_HOSTNAME;
const QBO_TOKEN_SECRET = 'oauth_token_secret';

const BATCH_SIZE = 25;

let Request = require('request');
let QuickBooks = require('server/utils/QBO');
let createQBO = QuickBooks.init(CONSUMER_KEY, CONSUMER_SECRET, /*useSandbox*/process.env.ENV !== 'prod', /*useDebug*/process.env.ENV !== 'prod');
let createPaymentForCustomer = QuickBooks.createPaymentForCustomer;
let batchPromise = QuickBooks.batchPromise;
let getCount = QuickBooks.getCount;
let Parse = require('node-parse-api').Parse;
let db = new Parse({
  /*eslint-disable*/
  app_id: PARSE_APP_ID,
  api_key: PARSE_REST_KEY
  /*eslint-enable*/
});

let React = require('react');
let CompanyDropdownButton = React.createFactory(require('lib/CompanyDropdownButton'));
let _ = require('underscore');
let Q = require('q');
let Qs = require('qs');

module.exports = [{
  method: 'GET',
  path: '/css/{param*}',
  handler: {
    directory: {
      path: 'css'
    }
  }
}, {
  method: 'GET',
  path: '/semantic/{param*}',
  config: {
    handler: {
      directory: {
        path: 'semantic'
      }
    }
  }
}, {
  method: 'GET',
  path: '/js/{param*}',
  config: {
    handler: {
      directory: {
        path: 'js'
      }
    }
  }
}, {
  method: 'GET',
  path: '/',
  config: {
    handler: (request, reply) => {
      let companies = request.auth.credentials.companies;
      let companySelectForm = React.renderToStaticMarkup(new CompanyDropdownButton({
        companies: companies
      }));
      let ctx = {
        companies: companies,
        companySelectForm: companySelectForm
      };
      return reply.view('index.html', ctx);
    }
  }
}, {
  method: 'GET',
  path: '/customers',
  config: {
    handler: (request, reply) => {

      let session = request.auth.credentials;
      let qbo = createQBO(_.findWhere(session.companies, {
        isSelected: true
      }));
      let queryParams = [{
        field: 'asc',
        value: request.query.asc,
        operator: '='
      }, {
        field: 'desc',
        value: request.query.desc,
        operator: '='
      }, {
        field: 'limit',
        value: request.query.limit || 10,
        operator: '='
      }, {
        field: 'offset',
        value: request.query.offset || 1,
        operator: '='
      }, {
        field: 'Balance',
        value: 0,
        operator: '>'
      }, {
        fields: request.query.fields
      }];

      getCount(qbo.findCustomers, qbo, request.query.count, queryParams).then((count) => {

        qbo.findCustomers(queryParams, (err, response) => {
          let customerInvoiceMap = {};
          if (err) {
            return reply(err);
          }
          else {
            let customers = response.QueryResponse.Customer;
            let promises = [];
            _(customers && Math.ceil(customers.length / BATCH_SIZE) || 0).times(i => {

              let segment = customers.slice(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE);
              let batches = _.map(segment, (customer, index) => {
                return {
                  bId: customer.Id,
                  Query: "select * from Invoice where CustomerRef = '" + customer.Id + "' and Balance > '0'"
                };
              });

              promises.push(batchPromise(qbo, batches));

            });
            Q.all(promises).done(results => {

              _.each(results, (result, i) => {
                _.each(result.BatchItemResponse, (item, j) => {
                  customerInvoiceMap[item.bId] = item.QueryResponse.Invoice;
                });
              });

              response.QueryResponse.Invoice = customerInvoiceMap;
              response.QueryResponse.totalCount = count;
              response.crumb = request.plugins.crumb;
              return reply(response);

            }, promiseErr => {
              return reply(promiseErr);
            });
          }
        });

      }, (promiseError) => {
        console.error(promiseError);
        return reply(promiseError);
      });
    }
  }
}, {
  method: 'POST',
  path: '/payment',
  config: {
    handler: (request, reply) => {

      let qbo = createQBO(_.findWhere(request.auth.credentials.companies, {
        isSelected: true
      }));

      let data = request.payload.payments;

      let items = _.map(data, function(value, key) {
        if (value) {
          let customerId = value.customerId;
          let invoices = value.invoices;

          return {
            bId: customerId,
            operation: 'create',
            Payment: createPaymentForCustomer(customerId, invoices)
          };
        }
      });

      let promises = [];
      _(Math.ceil(items.length / BATCH_SIZE)).times(i => {
        let section = items.slice(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE);
        promises.push(batchPromise(qbo, section));
      });

      Q.all(promises).done(results => {
        return reply(results);
      }, err => {
        return reply(err);
      });
    }
  }
}, {
  method: ['GET', 'POST'],
  path: '/login',
  config: {
    auth: {
      mode: 'try'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      },
      'crumb': {
        restful: false
      }
    },
    handler: (request, reply) => {

      if (request.method === 'post') {

        let username = request.payload.username,
          password = request.payload.password;
        if (!username || !password) {
          return reply.view('login.html', {
            message: 'Missing username or password'
          });
        }
        db.loginUser(username, password).then(function(user) {

          let token = user.sessionToken;

          db.find('PrivateUserData', {
            objectId: user.privateUserData.objectId,
            keys: 'companies'
          }, function(err, privateUserData) {
            if (err) {
              console.error(err);
              return reply(err);
            }
            else {
              db.find('Company', {
                  keys: 'name,oauthToken,oauthTokenSecret,realmId',
                  order: 'name',
                  where: {
                    $relatedTo: {
                      object: {
                        __type: 'Pointer',
                        className: 'PrivateUserData',
                        objectId: privateUserData.objectId
                      },
                      key: 'companies'
                    }
                  }
                },
                function(findErr, companies) {
                  if (findErr) {
                    console.error(findErr);
                    return reply(findErr);
                  }
                  else {
                    if (companies && companies.results && companies.results.length) {
                      companies.results[0].isSelected = true;
                    }
                    let session = {
                      user: {
                        id: user.objectId,
                        email: user.email,
                        username: user.username,
                        token: token
                      },
                      companies: companies.results
                    };
                    request.auth.session.set(session);
                    return reply.redirect('/');
                  }
                }, token);
            }
          }, token);

        }, function(err) {
          console.error(err);
          return reply.view('login.html', {
            message: err.error
          });
        });
      }
      else {
        return request.auth.isAuthenticated ?
          reply.redirect('/') :
          reply.view('login.html');
      }

    }
  }
}, {
  method: 'GET',
  path: '/logout',
  config: {
    handler: (request, reply) => {

      let session = request.auth.credentials;
      if (session.user && session.user.token) {
        db.logout(session.user.token, function(err, success) {
          request.auth.session.clear();
          request.session.reset();
          if (err) {
            return reply(err);
          }
          else {
            return reply.redirect('/login');
          }
        });
      }
      else {
        request.auth.session.clear();
        request.session.reset();
        return reply.redirect('/login');
      }
    }
  }
}, {
  method: 'GET',
  path: '/disconnect',
  config: {
    handler: (request, reply) => {
      //TODO call api, then remove from cognito db
      reply.redirect('/');
    }
  }
}, {
  method: 'GET',
  path: '/privacy',
  config: {
    handler: (request, reply) => {
      //TODO call api, then remove from cognito db
      reply.view('privacy.html');
    }
  }
}, {
  method: 'GET',
  path: '/eula',
  config: {
    handler: (request, reply) => {

      reply.view('eula.html');
    }
  }
}, {
  method: 'GET',
  path: '/oauth/requestToken',
  config: {
    handler: (request, reply) => {

      let postBody = {
        url: QuickBooks.REQUEST_TOKEN_URL,
        oauth: {
          callback: 'https://' + HOSTNAME + '/oauth/callback',
          consumer_key: CONSUMER_KEY,
          consumer_secret: CONSUMER_SECRET
        }
      };
      Request.post(postBody, (e, r, data) => {
        let requestToken = Qs.parse(data);
        request.session.set(QBO_TOKEN_SECRET, requestToken.oauth_token_secret);
        reply.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token);
      });

    }
  }
}, {
  method: 'GET',
  path: '/oauth/callback',
  config: {
    handler: (request, reply) => {

      let postBody = {
        url: QuickBooks.ACCESS_TOKEN_URL,
        oauth: {
          consumer_key: CONSUMER_KEY,
          consumer_secret: CONSUMER_SECRET,
          token: request.query.oauth_token,
          token_secret: request.session.get(QBO_TOKEN_SECRET),
          verifier: request.query.oauth_verifier,
          realmId: request.query.realmId
        }
      };
      request.session.clear(QBO_TOKEN_SECRET);
      Request.post(postBody, (e, r, data) => {

        let accessToken = Qs.parse(data);
        let realmId = postBody.oauth.realmId;
        let oauthToken = accessToken.oauth_token;
        let oauthTokenSecret = accessToken.oauth_token_secret;

        let credentials = {
          oauthToken: oauthToken,
          oauthTokenSecret: oauthTokenSecret,
          realmId: realmId
        };
        let qbo = createQBO(credentials);

        qbo.getCompanyInfo(realmId, (err, companyInfo) => {

          if (err) {
            return reply(err);
          }
          else {
            //var token = request.auth.credentials.user.token;
            //var user;// = Parse.User.current();
            //var pud;
            //TODO update in parse db
            return reply({
              company: companyInfo.CompanyName,
              credentials: credentials
            });
            /*eslint-disable*/
            /*Parse.User.become(token).then( u => { 
                                
                                user = Parse.User.current();
                                return user.get('privateUserData').fetch();
                                
                            }).then( privateUserData => {
                                    
                                    pud = privateUserData;
                                    
                                    var Company = Parse.Object.extend('Company');
                                    var company = new Company();
                                    company.setACL(new Parse.ACL(user));
                                    
                                    company.set('name', companyInfo.CompanyName); 
                                    company.set('oauthToken', oauthToken);
                                    company.set('oauthTokenSecret', oauthTokenSecret);
                                    company.set('realmId', realmId);
                                    return company.save(); 
                                    
                            }).then( company => {
                                    
                                    var relation = pud.relation("companies");
                            
                                    relation.add(company); 
                                    return pud.save();
                        
                            }).then( privateUserData => {
                    
                                    var relation = privateUserData.relation("companies");
                                    return relation.query().find();
        
                            }).then( companies => {
                                    
                                    request.auth.session.set('companies', sortAndSetCompanies(companies));     
                                    return reply.redirect('/close');
                                    
                            }, err => {
                                    //error creating / saving company
                                    //Parse.User.logOut();
                                    return reply(err); 
                            });*/
                            /*eslint-enable*/
          }
        });
      });
    }
  }
}, {
  method: 'POST',
  path: '/company',
  config: {
    plugins: {
      'crumb': {
        restful: false
      }
    },
    handler: (request, reply) => {
      let companies = request.auth.credentials.companies;
      let selected = parseInt(request.payload.company, 10);

      for (let i = 0; i < companies.length; i++) {
        companies[i].isSelected = i === selected;
      }
      request.auth.session.set('companies', companies);
      return reply.redirect('/');
    }
  }
}, {
  method: 'GET',
  path: '/close',
  config: {
    handler: (request, reply) => {

      reply.view('close.html');

    }
  }
}, {
  method: 'GET',
  path: '/robots.txt',
  config: {
    auth: false,
    handler: {
      file: 'robots.txt'
    }
  }
}];
