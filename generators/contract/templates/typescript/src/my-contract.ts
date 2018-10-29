/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import { Context, Contract } from 'fabric-contract-api';

export class MyContract extends Contract {

    public async instantiate(ctx: Context): Promise<any> {
        console.info('instantiate');
    }

    public async transaction1(ctx: Context, arg1: string): Promise<any> {
        console.info('transaction1', arg1);
    }

    public async transaction2(ctx: Context, arg1: string, arg2: string): Promise<any> {
        console.info('transaction2', arg1, arg2);
    }

}
