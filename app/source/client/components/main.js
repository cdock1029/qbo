'use strict';

import React from '../../../../node_modules/react/addons';
import App from './App';
import FluxComponent from '../../../../node_modules/flummox/component';
import AppFlux from '../flux/Flux';
import { CustomerStore } from '../flux/Stores';

const flux = new AppFlux();
flux.addListener('dispatch', payload => {
    console.log('Dispatch: ', payload);
});
/*flux.addListener('error', payload => {
    console.log('Flux Error: ', payload);
});*/
React.render(
  <FluxComponent connectToStores={{
    customers: store => ({
      alerts: store.getAlerts(),
      loading: store.getLoading(),
      payments: store.getPayments(),
      previous: store.getPrevious(),
      next: store.getNext(),
      totalCount: store.getTotalCount()
    })
  }} flux={flux}>
    <App pageSize={CustomerStore.getPageSize()} />
  </FluxComponent>,
  document.getElementById('content')
);
