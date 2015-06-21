'use strict';

import React from 'react/addons';
import App from './App';
import FluxComponent from 'flummox/component';
import AppFlux from '../flux/Flux';
import { CustomerStore } from '../flux/Stores';
import PayButton from '../../lib/PayButton';

const flux = new AppFlux();
flux.addListener('dispatch', payload => {
  console.log('Dispatch: ', payload);
});
React.render(
  <FluxComponent connectToStores={{
    customers: store => ({
      payments: store.getPayments()
    })
  }} flux={flux}>
   <PayButton />
  </FluxComponent>,
  document.getElementById('payButtonContainer')
);

React.render(
  <FluxComponent connectToStores={{
    customers: store => ({
      alerts: store.getAlerts(),
      loading: store.getLoading(),
      previous: store.getPrevious(),
      next: store.getNext(),
      pageCount: store.getPageCount(),
      currentPage: store.getCurrentPage()
    })
  }} flux={flux}>
    <App loadLimit={CustomerStore.getLoadLimit()} pageSize={CustomerStore.getPageSize()} />
  </FluxComponent>,
  document.getElementById('content')
);
