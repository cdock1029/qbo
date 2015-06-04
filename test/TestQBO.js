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

  describe('.extractPaymentsMap(paymentsArray)', function() {
    it('takes a list of batch payment reponses, and returns a map of customer id to txnId list', function() {
      const payments = [ { Payment:
        { CustomerRef: { value: '3', name: 'Cool Cars' },
          DepositToAccountRef: { value: '4' },
          TotalAmt: 40,
          UnappliedAmt: 0,
          ProcessPayment: false,
          domain: 'QBO',
          sparse: false,
          Id: '237',
          SyncToken: '0',
          MetaData:
          { CreateTime: '2015-06-04T10:04:41-07:00',
            LastUpdatedTime: '2015-06-04T10:04:41-07:00' },
          TxnDate: '2015-06-04',
          Line:
            [ { Amount: 22,
              LinkedTxn: [ { TxnId: '188', TxnType: 'Invoice' } ],
              LineEx:
              { any:
                [ { name: '{http://schema.intuit.com/finance/v3}NameValue',
                  declaredType: 'com.intuit.schema.finance.v3.NameValue',
                  scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                  value: { Name: 'txnId', Value: '188' },
                  nil: false,
                  globalScope: true,
                  typeSubstituted: false },
                  { name: '{http://schema.intuit.com/finance/v3}NameValue',
                    declaredType: 'com.intuit.schema.finance.v3.NameValue',
                    scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                    value: { Name: 'txnOpenBalance', Value: '22.00' },
                    nil: false,
                    globalScope: true,
                    typeSubstituted: false },
                  { name: '{http://schema.intuit.com/finance/v3}NameValue',
                    declaredType: 'com.intuit.schema.finance.v3.NameValue',
                    scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                    value: { Name: 'txnReferenceNumber', Value: '1047' },
                    nil: false,
                    globalScope: true,
                    typeSubstituted: false } ] } },
              { Amount: 18,
                LinkedTxn: [ { TxnId: '170', TxnType: 'Invoice' } ],
                LineEx:
                { any:
                  [ { name: '{http://schema.intuit.com/finance/v3}NameValue',
                    declaredType: 'com.intuit.schema.finance.v3.NameValue',
                    scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                    value: { Name: 'txnId', Value: '170' },
                    nil: false,
                    globalScope: true,
                    typeSubstituted: false },
                    { name: '{http://schema.intuit.com/finance/v3}NameValue',
                      declaredType: 'com.intuit.schema.finance.v3.NameValue',
                      scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                      value: { Name: 'txnOpenBalance', Value: '18.00' },
                      nil: false,
                      globalScope: true,
                      typeSubstituted: false },
                    { name: '{http://schema.intuit.com/finance/v3}NameValue',
                      declaredType: 'com.intuit.schema.finance.v3.NameValue',
                      scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                      value: { Name: 'txnReferenceNumber', Value: '1041' },
                      nil: false,
                      globalScope: true,
                      typeSubstituted: false } ] } } ] },
          bId: '3' },
          { Payment:
          { CustomerRef: { value: '9', name: 'Freeman Sporting Goods:55 Twin Lane' },
            DepositToAccountRef: { value: '4' },
            TotalAmt: 171.4,
            UnappliedAmt: 0,
            ProcessPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '238',
            SyncToken: '0',
            MetaData:
            { CreateTime: '2015-06-04T10:04:42-07:00',
              LastUpdatedTime: '2015-06-04T10:04:42-07:00' },
            TxnDate: '2015-06-04',
            Line:
              [ { Amount: 86.4,
                LinkedTxn: [ { TxnId: '14', TxnType: 'Invoice' } ],
                LineEx:
                { any:
                  [ { name: '{http://schema.intuit.com/finance/v3}NameValue',
                    declaredType: 'com.intuit.schema.finance.v3.NameValue',
                    scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                    value: { Name: 'txnId', Value: '14' },
                    nil: false,
                    globalScope: true,
                    typeSubstituted: false },
                    { name: '{http://schema.intuit.com/finance/v3}NameValue',
                      declaredType: 'com.intuit.schema.finance.v3.NameValue',
                      scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                      value: { Name: 'txnOpenBalance', Value: '86.40' },
                      nil: false,
                      globalScope: true,
                      typeSubstituted: false },
                    { name: '{http://schema.intuit.com/finance/v3}NameValue',
                      declaredType: 'com.intuit.schema.finance.v3.NameValue',
                      scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                      value: { Name: 'txnReferenceNumber', Value: '1006' },
                      nil: false,
                      globalScope: true,
                      typeSubstituted: false } ] } },
                { Amount: 81,
                  LinkedTxn: [ { TxnId: '92', TxnType: 'Invoice' } ],
                  LineEx:
                  { any:
                    [ { name: '{http://schema.intuit.com/finance/v3}NameValue',
                      declaredType: 'com.intuit.schema.finance.v3.NameValue',
                      scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                      value: { Name: 'txnId', Value: '92' },
                      nil: false,
                      globalScope: true,
                      typeSubstituted: false },
                      { name: '{http://schema.intuit.com/finance/v3}NameValue',
                        declaredType: 'com.intuit.schema.finance.v3.NameValue',
                        scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                        value: { Name: 'txnOpenBalance', Value: '81.00' },
                        nil: false,
                        globalScope: true,
                        typeSubstituted: false },
                      { name: '{http://schema.intuit.com/finance/v3}NameValue',
                        declaredType: 'com.intuit.schema.finance.v3.NameValue',
                        scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                        value: { Name: 'txnReferenceNumber', Value: '1028' },
                        nil: false,
                        globalScope: true,
                        typeSubstituted: false } ] } },
                { Amount: 4,
                  LinkedTxn: [ { TxnId: '13', TxnType: 'Invoice' } ],
                  LineEx:
                  { any:
                    [ { name: '{http://schema.intuit.com/finance/v3}NameValue',
                      declaredType: 'com.intuit.schema.finance.v3.NameValue',
                      scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                      value: { Name: 'txnId', Value: '13' },
                      nil: false,
                      globalScope: true,
                      typeSubstituted: false },
                      { name: '{http://schema.intuit.com/finance/v3}NameValue',
                        declaredType: 'com.intuit.schema.finance.v3.NameValue',
                        scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                        value: { Name: 'txnOpenBalance', Value: '4.00' },
                        nil: false,
                        globalScope: true,
                        typeSubstituted: false },
                      { name: '{http://schema.intuit.com/finance/v3}NameValue',
                        declaredType: 'com.intuit.schema.finance.v3.NameValue',
                        scope: 'javax.xml.bind.JAXBElement$GlobalScope',
                        value: { Name: 'txnReferenceNumber', Value: '1005' },
                        nil: false,
                        globalScope: true,
                        typeSubstituted: false } ] } } ] },
            bId: '9' } ];

      expect(QBO.extractPaymentsMap).to.be.a('function');
      expect(QBO.extractPaymentsMap).to.have.length(1);

      let result = QBO.extractPaymentsMap(payments);

      expect(result).to.be.a('object');

      expect(result).to.have.property('customers');
      expect(result.customers).to.eql(['3', '9']);

      expect(result).to.have.property('transactionIds');
      expect(result.transactionIds).to.eql(['188', '170', '14', '92', '13']);

    });
  });

});
