/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');
const myCollectionName = 'CollectionOne';

class <%= assetPascalCase %>Contract extends Contract {

    async <%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id) {
        const data = await ctx.stub.getPrivateDataHash(myCollectionName, <%= assetCamelCase %>Id);
        return (!!data && data.length > 0);
    }

    async create<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} already exists`);
        }

        const privateAsset = {};

        const transientData = ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.privateValue = transientData.get('privateValue').toString();

        await ctx.stub.putPrivateData(myCollectionName, <%= assetCamelCase %>Id, Buffer.from(JSON.stringify(privateAsset)));
    }

    async read<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        let privateDataString;
        const privateData = await ctx.stub.getPrivateData(myCollectionName, <%= assetCamelCase %>Id);
        privateDataString = JSON.parse(privateData.toString());
        return privateDataString;
    }

    async update<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        const privateAsset = {};

        const transientData = ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.privateValue = transientData.get('privateValue').toString();

        await ctx.stub.putPrivateData(myCollectionName, <%= assetCamelCase %>Id, Buffer.from(JSON.stringify(privateAsset)));
    }

    async delete<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        await ctx.stub.deletePrivateData(myCollectionName, <%= assetCamelCase %>Id);
    }

    async verify<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id, objectToVerify) {

        // Convert provided object into a hash
        const hashToVerify = crypto.createHash('sha256').update(objectToVerify).digest('hex');
        const pdHashBytes = await ctx.stub.getPrivateDataHash(myCollectionName, <%= assetCamelCase %>Id);
        if (pdHashBytes.length === 0) {
            throw new Error('No private data hash with the key: ' + <%= assetCamelCase %>Id);
        }

        const actualHash = Buffer.from(pdHashBytes).toString('hex');

        // Compare the hash calculated (from object provided) and the hash stored on public ledger
        if (hashToVerify === actualHash) {
            return true;
        } else {
            return false;
        }
    }


}

module.exports = <%= assetPascalCase %>Contract;
