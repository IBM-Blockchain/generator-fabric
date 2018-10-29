/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyContract extends Contract {

    async instantiate(ctx) {
        console.info('instantiate');
    }

    async transaction1(ctx, arg1) {
        console.info('transaction1', arg1);
    }

    async transaction2(ctx, arg1, arg2) {
        console.info('transaction2', arg1, arg2);
    }

}

module.exports = MyContract;
