/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import crypto = require('crypto');
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { <%= assetPascalCase %> } from './<%= assetDashSeparator %>';
const myCollectionName: string = 'CollectionOne';

@Info({title: '<%= assetPascalCase %>Contract', description: '<%= description %>' })
export class <%= assetPascalCase %>Contract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async <%= assetCamelCase %>Exists(ctx: Context, <%= assetCamelCase %>Id: string): Promise<boolean> {
        const buffer: Buffer = await ctx.stub.getPrivateDataHash(myCollectionName, <%= assetCamelCase %>Id);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async create<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<void> {
        const exists: boolean = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} already exists`);
        }

        const privateAsset: <%= assetPascalCase %> = new <%= assetPascalCase %>();

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.privateValue = transientData.get('privateValue').toString('utf8');

        await ctx.stub.putPrivateData(myCollectionName, <%= assetCamelCase %>Id, Buffer.from(JSON.stringify(privateAsset)));
    }

    @Transaction(false)
    @Returns('<%= assetPascalCase %>')
    public async read<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<string> {
        const exists: boolean = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }

        let privateDataString: string;
        const privateData: Buffer = await ctx.stub.getPrivateData(myCollectionName, <%= assetCamelCase %>Id);

        privateDataString = JSON.parse(privateData.toString());
        return privateDataString;
    }

    @Transaction()
    public async update<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<void> {
        const exists: boolean = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }

        const privateAsset: <%= assetPascalCase %> = new <%= assetPascalCase %>();

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.privateValue = transientData.get('privateValue').toString('utf8');

        await ctx.stub.putPrivateData(myCollectionName, <%= assetCamelCase %>Id, Buffer.from(JSON.stringify(privateAsset)));
    }

    @Transaction()
    public async delete<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<void> {
        const exists: boolean = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        await ctx.stub.deletePrivateData(myCollectionName, <%= assetCamelCase %>Id);
    }

    @Transaction()
    public async verify<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string, objectToVerify: <%= assetPascalCase %>): Promise<boolean> {
        // Convert user provided object into a hash
        const hashToVerify: string = crypto.createHash('sha256').update(JSON.stringify(objectToVerify)).digest('hex');
        const pdHashBytes: Buffer = await ctx.stub.getPrivateDataHash(myCollectionName, <%= assetCamelCase %>Id);
        if (pdHashBytes.length === 0) {
            throw new Error(`No private data hash with the Key: ${<%= assetCamelCase %>Id}`);
        }

        const actualHash: string = pdHashBytes.toString('hex');

        // Compare the hash calculated (from object provided) and the hash stored on public ledger
        if (hashToVerify === actualHash) {
            return true;
        } else {
            return false;
        }
    }

}
