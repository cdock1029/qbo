'use strict';

const chai = require('chai');
const expect = chai.expect;
import {removeSubmitted} from '../source/client/utils/dataTransforms';

describe('dataTransforms', function () {
  describe('.removeSubmitted', function () {
    it('should return update state for Customers and Invoices with submitted items removed.', function () {
      const prevCustomerState = [
        {
          Id: '17',
          GivenName: 'Mark',
          FamilyName: 'Cho',
          FullyQualifiedName: 'Mark Cho',
          CompanyName: '36 Willow',
          DisplayName: 'Mark Cho'
        },
        {
          Id: '9',
          SyncToken: '2',
          MetaData: {
            CreateTime: '2014-12-22T17:01:00-08:00',
            LastUpdatedTime: '2015-06-18T13:36:31-07:00'
          },
          GivenName: 'Amelia',
          FullyQualifiedName: 'Freeman Sporting Goods:55 Twin Lane',
          CompanyName: 'Freeman Sporting Goods UPDATED',
          DisplayName: '55 Twin Lane'
        },
        {
          Id: '8',
          SyncToken: '2',
          MetaData: {
            CreateTime: '2014-12-22T17:00:01-08:00',
            LastUpdatedTime: '2015-06-18T13:06:34-07:00'
          },
          GivenName: 'Sasha',
          FamilyName: 'Tillou',
          FullyQualifiedName: 'Freeman Sporting Goods:0969 Ocean View Road',
          CompanyName: 'Freeman Sporting Goods UPDATED',
          DisplayName: '0969 Ocean View Road'
        },
        {
          Id: '12',
          SyncToken: '2',
          MetaData: {
            CreateTime: '2014-12-22T17:05:09-08:00',
            LastUpdatedTime: '2015-06-18T13:36:37-07:00'
          },
          GivenName: 'Jeff',
          FamilyName: 'Chin',
          FullyQualifiedName: 'Jeff\'s Jalopies',
          CompanyName: 'Jeff\'s Jalopies UPDATED',
          DisplayName: 'Jeff\'s Jalopies'
        }];


      const prevInvoiceState = {
        '8': [
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '129',
            SyncToken: '4',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1036',
            TxnDate: '2014-12-30',
            LinkedTxn: [],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2015-01-29',
            TotalAmt: 477.5,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 477.5
          },
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '96',
            SyncToken: '4',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1031',
            TxnDate: '2014-10-15',
            LinkedTxn: [],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2014-11-14',
            TotalAmt: 387,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 387
          }],
        '9': [
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '92',
            SyncToken: '7',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1028',
            TxnDate: '2014-11-12',
            LinkedTxn: [],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2014-12-12',
            TotalAmt: 81,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 81
          },
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '14',
            SyncToken: '6',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1006',
            TxnDate: '2014-11-21',
            LinkedTxn: [],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2014-12-21',
            TotalAmt: 86.4,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 86.4
          },
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '13',
            SyncToken: '8',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1005',
            TxnDate: '2014-12-21',
            LinkedTxn: [Object],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2015-01-20',
            TotalAmt: 54,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 4
          }],
        '12': [
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '68',
            SyncToken: '9',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1022',
            TxnDate: '2014-12-08',
            LinkedTxn: [],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2015-01-07',
            TotalAmt: 81,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 81
          }],
        '17': [{
          Deposit: 0,
          AllowIPNPayment: false,
          AllowOnlinePayment: false,
          AllowOnlineCreditCardPayment: false,
          AllowOnlineACHPayment: false,
          domain: 'QBO',
          sparse: false,
          Id: '206',
          SyncToken: '5',
          MetaData: [Object],
          CustomField: [Object],
          DocNumber: '1057',
          TxnDate: '2015-05-23',
          CurrencyRef: [Object],
          LinkedTxn: [],
          Line: [Object],
          TxnTaxDetail: [Object],
          CustomerRef: [Object],
          CustomerMemo: [Object],
          BillAddr: [Object],
          ShipAddr: [Object],
          SalesTermRef: [Object],
          DueDate: '2015-06-22',
          TotalAmt: 275,
          ApplyTaxAfterDiscount: false,
          PrintStatus: 'NeedToPrint',
          EmailStatus: 'NotSet',
          BillEmail: [Object],
          Balance: 275}
        ]};

      //without 9 and 17
      const expectedFinalInvoices = {
        '8': [
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '129',
            SyncToken: '4',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1036',
            TxnDate: '2014-12-30',
            LinkedTxn: [],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2015-01-29',
            TotalAmt: 477.5,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 477.5
          },
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '96',
            SyncToken: '4',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1031',
            TxnDate: '2014-10-15',
            LinkedTxn: [],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2014-11-14',
            TotalAmt: 387,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 387
          }],
        '12': [
          {
            Deposit: 0,
            AllowIPNPayment: false,
            AllowOnlinePayment: false,
            AllowOnlineCreditCardPayment: false,
            AllowOnlineACHPayment: false,
            domain: 'QBO',
            sparse: false,
            Id: '68',
            SyncToken: '9',
            MetaData: [Object],
            CustomField: [Object],
            DocNumber: '1022',
            TxnDate: '2014-12-08',
            LinkedTxn: [],
            Line: [Object],
            TxnTaxDetail: [Object],
            CustomerRef: [Object],
            CustomerMemo: [Object],
            BillAddr: [Object],
            ShipAddr: [Object],
            SalesTermRef: [Object],
            DueDate: '2015-01-07',
            TotalAmt: 81,
            ApplyTaxAfterDiscount: false,
            PrintStatus: 'NeedToPrint',
            EmailStatus: 'NotSet',
            BillEmail: [Object],
            Balance: 81
          }]};

      //without 9 and 17
      const expectedFinalCustomers = [
        {
          Id: '8',
          SyncToken: '2',
          MetaData: {
            CreateTime: '2014-12-22T17:00:01-08:00',
            LastUpdatedTime: '2015-06-18T13:06:34-07:00'
          },
          GivenName: 'Sasha',
          FamilyName: 'Tillou',
          FullyQualifiedName: 'Freeman Sporting Goods:0969 Ocean View Road',
          CompanyName: 'Freeman Sporting Goods UPDATED',
          DisplayName: '0969 Ocean View Road'
        },
        {
          Id: '12',
          SyncToken: '2',
          MetaData: {
            CreateTime: '2014-12-22T17:05:09-08:00',
            LastUpdatedTime: '2015-06-18T13:36:37-07:00'
          },
          GivenName: 'Jeff',
          FamilyName: 'Chin',
          FullyQualifiedName: 'Jeff\'s Jalopies',
          CompanyName: 'Jeff\'s Jalopies UPDATED',
          DisplayName: 'Jeff\'s Jalopies'
        }];

      const batchResponse = [
        {
          BatchItemResponse: [{
            Payment: {
              CustomerRef: {value: '9', name: 'Sushi by Katsuyuki'},
              DepositToAccountRef: {value: '4'},
              TotalAmt: 100,
              UnappliedAmt: 0,
              ProcessPayment: false,
              domain: 'QBO',
              sparse: false,
              Id: '249',
              SyncToken: '0',
              TxnDate: '2015-06-19',
              Line: [{
                Amount: 100,
                LinkedTxn: [{TxnId: '211', TxnType: 'Invoice'}]
              }]
            },
            bId: '9'
          }, {
            Payment: {
              CustomerRef: {value: '17', name: 'Sushi by Katsuyuki'},
              DepositToAccountRef: {value: '4'},
              TotalAmt: 100,
              UnappliedAmt: 0,
              ProcessPayment: false,
              domain: 'QBO',
              sparse: false,
              Id: '249',
              SyncToken: '0',
              TxnDate: '2015-06-19',
              Line: [{
                Amount: 100,
                LinkedTxn: [{TxnId: '211', TxnType: 'Invoice'}]
              }]
            },
            bId: '17'
          }],
          time: '2015-06-19T10:00:35.048-07:00'
        }];

      const result = removeSubmitted(prevCustomerState, prevInvoiceState, batchResponse);
      console.log(result);
      expect(result).to.be.an('object');
      expect(result).to.have.property('invoices');
      expect(result.invoices).to.eql(expectedFinalInvoices);

      expect(result).to.have.property('customers');
      expect(result.customers).to.eql(expectedFinalCustomers);
    });
  });
});
