'use strict';

const AppFlux = require('../source/client/flux/Flux');
const chai = require('chai');
const expect = chai.expect;


describe('CustomerStore', function() {
  describe('.getCustomers', function() {
    it('should return state references that are not equal after state change', function() {
      const flux = new AppFlux();
      const CustomerStore = flux.getStore('customers');
      const c1 = CustomerStore.getCustomers();
      let data = {QueryResponse: {
        Customer: [{id: 1}, {id: 2}, {id: 3}]
      }};

      CustomerStore.handleCustomers(data);
      const c2 = CustomerStore.getCustomers();
      expect(c1).to.not.equal(c2);
    });
  });
});
