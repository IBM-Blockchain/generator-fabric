/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

@Info({title: 'MyContract', description: '<%= description %>', version: '<%= version %>'})
export class MyContract extends Contract {

    @Transaction()
    public async instantiate(ctx: Context): Promise<void> {
        console.info('instantiate');
    }

    @Transaction()
    @Returns('string')
    public async transaction1(ctx: Context, arg1: string): Promise<string> {
        console.info('transaction1', arg1);
        return `Transaction 1 called with ${arg1}`;
    }

    @Transaction()
    @Returns('string')
    public async transaction2(ctx: Context, arg1: string, arg2: string): Promise<string> {
        console.info('transaction2', arg1, arg2);
        return `Transaction 2 called with ${arg1} ${arg2}`;
    }

}
