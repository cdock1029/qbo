'use strict';

const AppFlux = require('../src/flux/Flux');
const chai = require('chai');
const expect = chai.expect;


describe('CustomerStore', function() {
  describe('getCustomers', function() {
    it('should return state references that are not equal after state change', function() {
      const flux = new AppFlux();
      const CustomerStore = flux.getStore('customers');
      const c1 = CustomerStore.getCustomers();
      let data = {QueryResponse: {
        Customer: [{id: 1}, {id: 2}, {id: 3}]
      }};
      expect(state1).to.be.an('object');

      CustomerStore.handleCustomers(data);
      const state2 = CustomerStore.getState();
      const c2 = CustomerStore.getCustomers();
      expect(state2).to.be.an('object');
      expect(state2).to.equal(state1);
      expect(c1).to.equal(c2);
      expect(c1).to.eql(c2);
    });
  });
});
