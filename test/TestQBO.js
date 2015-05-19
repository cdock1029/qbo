'use strict';

const QBO = require('../src/utils/QBO');
const chai = require('chai');
const expect = chai.expect;


describe('QBO', function() {
  describe('.init(consumerKey, consumerSecret, useSandbox, useDebug)', function() {
    it('should return return a function that takes a company and returns a node-Quickbooks service object.', function() {
      let consumerKey = 'consumerKey', consumerSecret = 'consumerSecret', useSandbox = true, useDebug = true;

      const qbo = QBO.init(consumerKey, consumerSecret, useSandbox, useDebug);

      expect(qbo).to.be.a('function');
      expect(qbo).to.have.length(1);
    });
  });

  describe('.filterCompanies(companies, SANDBOX)', function() {


    it('should return a list of companies with first item isSelected set to true.', function() {
      const companies = [
        {name: 'Prod company 1'},
        {name: 'Prod company 2'},
        {name: 'Sandbox company'}
      ];
      let filtered = QBO.filterCompanies(companies, false);

      expect(filtered).to.have.length(2);
      expect(filtered[0]).to.have.property('isSelected', true);
      expect(filtered[1]).to.not.have.property('isSelected');
    });

    it('should return the sandbox copmany if SANDBOX param is true', function() {
      const companies = [
        {name: 'Prod company 1', id: 0},
        {name: 'Prod company 2', id: 1},
        {name: 'Sandbox company', id: 2},
        {name: 'another saNDbox fake company', id: 3}
      ];

      let filtered = QBO.filterCompanies(companies, true);

      expect(filtered).to.have.length(2);
      expect(filtered[0]).to.have.property('isSelected', true);
      expect(filtered[0].name).to.match(/sandbox/i);
      expect(filtered[1].name).to.match(/sandbox/i);
    });
  });

  describe('.createPaymentLine(invoices)', function() {
    it('takes a list of invoices and returns Payment "Line" linking to invoices', function() {
      const invoices = [
        {Balance: 23.45, Id: 0},
        {Balance: 70, Id: 1},
        {Balance: 2.0, Id: 2}
      ];
      expect(QBO.createPaymentLine).to.be.a('function');
      expect(QBO.createPaymentLine).to.have.length(1);

      let payments = QBO.createPaymentLine(invoices);

      expect(payments).to.have.length(3);
      expect(payments[0]).to.have.property('Amount', invoices[0].Balance);
      expect(payments[1]).to.have.property('Amount', invoices[1].Balance);
      expect(payments[2]).to.have.property('Amount', invoices[2].Balance);

      expect(payments[0]).to.have.property('LinkedTxn');

      let p1Linked = payments[0].LinkedTxn;
      expect(p1Linked).to.be.an('array');
      expect(p1Linked).to.have.length(1);
      expect(p1Linked[0]).to.have.property('TxnId', invoices[0].Id);
      expect(p1Linked[0]).to.have.property('TxnType', 'Invoice');
    });
  });

  describe('.calculateTotal(invoices)', function() {
    it('takes list of invoices, returns total amount for Payment', function() {
      const expectedTotal = 95.50;
      const invoices = [
        {Balance: 23.49, Id: 0},
        {Balance: 70, Id: 1},
        {Balance: 2.01, Id: 2}
      ];
      /*const line = [
        {
          Amount: 23.45,
          LinkedTxn: [{
            TxnId: '0',
            TxnType: 'Invoice'
          }]
        },
        {
          Amount: 245,
          LinkedTxn: [{
            TxnId: '0',
            TxnType: 'Invoice'
          }]
        },
        {
          Amount: 9.01,
          LinkedTxn: [{
            TxnId: '0',
            TxnType: 'Invoice'
          }]
        }
      ];*/

      expect(QBO.calculateTotal).to.be.a('function');
      expect(QBO.calculateTotal).to.have.length(1);

      let total = QBO.calculateTotal(invoices);
      expect(total).to.be.a('number');
      expect(total).to.equal(expectedTotal);

    });
  });

  describe('.createPartialPayment(invoices)', function() {
    it('takes list of invoices, returns partial Payment containing Line and TotalAmt', function() {
      const expectedTotal = 95.50;
      const invoices = [
        {Balance: 23.49, Id: 0},
        {Balance: 70, Id: 1},
        {Balance: 2.01, Id: 2}
      ];

      expect(QBO.createPartialPayment).to.be.a('function');
      expect(QBO.createPartialPayment).to.have.length(1);

      let partialPayment = QBO.createPartialPayment(invoices);

      expect(partialPayment).to.have.property('Line');
      expect(partialPayment).to.have.property('TotalAmt', expectedTotal);
    });
  });

  describe('.createPaymentForCustomer(customerId, invoices)', function() {
    it('takes customerId and invoice list, returns Payment object', function() {
      const expectedTotal = 95.50;
      const customerId = 'CUSTOMER_ID';
      const invoices = [
        {Balance: 23.49, Id: 0},
        {Balance: 70, Id: 1},
        {Balance: 2.01, Id: 2}
      ];

      expect(QBO.createPaymentForCustomer).to.be.a('function');
      expect(QBO.createPaymentForCustomer).to.have.length(2);

      let payment = QBO.createPaymentForCustomer(customerId, invoices);

      expect(payment).to.have.property('Line');
      expect(payment).to.have.property('TotalAmt', expectedTotal);

      expect(payment).to.have.property('CustomerRef');
      expect(payment.CustomerRef).to.be.an('object');
      expect(payment.CustomerRef).to.have.property('value', customerId);
    });
  });

});
