'use strict';

import Flux from 'flummox';
import { CustomerActions, AlertActions } from './Actions';
import { CustomerStore, AlertStore } from './Stores';

class AppFlux extends Flux {

  constructor() {
    super();
    this.createActions('customers', CustomerActions);

    this.createStore('customers', CustomerStore, this);
  }

}

module.exports = AppFlux;
