'use strict';

import Flux from 'flummox';
import { CustomerActions } from './Actions';
import { CustomerStore } from './Stores';

class AppFlux extends Flux {

  constructor() {
    super();
    this.createActions('customers', CustomerActions);

    this.createStore('customers', CustomerStore, this);
  }

}

module.exports = AppFlux;
