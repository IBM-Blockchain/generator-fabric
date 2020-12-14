/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import crypto = require('crypto');
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { <%= assetPascalCase %> } from './<%= assetDashSeparator %>';

async function getCollectionName(ctx: Context): Promise<string> {
    const mspid: string = ctx.clientIdentity.getMSPID();
    const collectionName: string = `_implicit_org_${mspid}`;
    return collectionName;
}

@Info({title: '<%= assetPascalCase %>Contract', description: '<%= description %>' })
export class <%= assetPascalCase %>Contract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async <%= assetCamelCase %>Exists(ctx: Context, <%= assetCamelCase %>Id: string): Promise<boolean> {
        const collectionName: string = await getCollectionName(ctx);
        const data: Uint8Array = await ctx.stub.getPrivateDataHash(collectionName, <%= assetCamelCase %>Id);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async create<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<void> {
        const exists: boolean = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} already exists`);
        }

        const privateAsset: <%= assetPascalCase %> = new <%= assetPascalCase %>();

        const transientData: Map<string, Uint8Array> = ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.privateValue = transientData.get('privateValue').toString();

        const collectionName: string = await getCollectionName(ctx);
        await ctx.stub.putPrivateData(collectionName, <%= assetCamelCase %>Id, Buffer.from(JSON.stringify(privateAsset)));
    }

    @Transaction(false)
    @Returns('<%= assetPascalCase %>')
    public async read<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<string> {
        const exists: boolean = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }

        let privateDataString: string;

        const collectionName: string = await getCollectionName(ctx);
        const privateData: Uint8Array = await ctx.stub.getPrivateData(collectionName, <%= assetCamelCase %>Id);

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

        const transientData: Map<string, Uint8Array> = ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.privateValue = transientData.get('privateValue').toString();

        const collectionName: string = await getCollectionName(ctx);
        await ctx.stub.putPrivateData(collectionName, <%= assetCamelCase %>Id, Buffer.from(JSON.stringify(privateAsset)));
    }

    @Transaction()
    public async delete<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<void> {
        const exists: boolean = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }

        const collectionName: string = await getCollectionName(ctx);
        await ctx.stub.deletePrivateData(collectionName, <%= assetCamelCase %>Id);
    }

    @Transaction()
    public async verify<%= assetPascalCase %>(ctx: Context, mspid: string, <%= assetCamelCase %>Id: string, objectToVerify: <%= assetPascalCase %>): Promise<boolean> {
        // Convert user provided object into a hash
        const hashToVerify: string = crypto.createHash('sha256').update(JSON.stringify(objectToVerify)).digest('hex');
        const pdHashBytes: Uint8Array = await ctx.stub.getPrivateDataHash(`_implicit_org_${mspid}`, <%= assetCamelCase %>Id);
        if (pdHashBytes.length === 0) {
            throw new Error(`No private data hash with the Key: ${<%= assetCamelCase %>Id}`);
        }

        const actualHash: string = Buffer.from(pdHashBytes).toString('hex');

        // Compare the hash calculated (from object provided) and the hash stored on public ledger
        if (hashToVerify === actualHash) {
            return true;
        } else {
            return false;
        }
    }

}
