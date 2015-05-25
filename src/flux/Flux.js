'use strict';

import Flux from 'flummox';
import { CustomerActions, AlertActions } from './Actions';
import { CustomerStore, AlertStore } from './Stores';

class AppFlux extends Flux {
  
  constructor() {
    super();
    this.createActions('customers', CustomerActions);
    this.createActions('alerts', AlertActions);
    
    this.createStore('customers', CustomerStore, this);
    this.createStore('alerts', AlertStore, this);
  }
  
}

module.exports = AppFlux;
