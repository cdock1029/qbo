'use strict';

import {compose, createMapEntry, differenceWith, flatten, filter, whereEq, map, omit, pluck} from 'ramda';

/**
 * Get customer IDs from payments that were submitted
 */
const getCustomerIds = compose(pluck('bId'), flatten, pluck('BatchItemResponse'));


/**
 * For more fine grained removal of invoices, when not paying off entire customer balance
 */
const getPaymentLines = compose(flatten, pluck('Line'), pluck('Payment'), flatten, pluck('BatchItemResponse'));
const getInvoiceIds = compose(pluck('TxnId'), filter(whereEq({TxnType: 'Invoice'})), flatten, pluck('LinkedTxn'), getPaymentLines);

const constructIdsMap = map(createMapEntry('Id'));

const compare = (prev, removed) => { return prev.Id === removed.Id; };
const pruneCustomers = differenceWith(compare);

const removeSubmitted = (prevCustomers, prevInvoices, response) => {

  // get invoice ids (not needed now, but will be when paying off partial balances)

  // get customer ids
  const customerIds = getCustomerIds(response);
  const customerIdsMap = constructIdsMap(customerIds);

  //omit invoice ids from invoices object (not needed now..)
  const invoices = omit(customerIds, prevInvoices);

  //omit customer ids from customer array and invoice object
  const customers = pruneCustomers(prevCustomers, customerIdsMap);

  return {invoices, customers};
};

export default {
  getPaymentLines,
  getInvoiceIds,
  removeSubmitted
};
