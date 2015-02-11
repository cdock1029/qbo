'use strict';

module.exports = {
    getCustomers() {
        var data = {
            '0': {
                id: '0',
                name: 'John Doe',
                balance: '22.00'
            },
            '1': {
                id: '1',
                name: 'Bill Brasky',
                balance: '0.00'
            },
            '3': {
                id: '0',
                name: 'Mad Hatter',
                balance: '299.95'
            }
        }
        return data;
    }
};
