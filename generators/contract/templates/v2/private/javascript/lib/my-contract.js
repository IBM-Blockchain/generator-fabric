/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

async function getCollectionName(ctx) {
    const mspid = ctx.clientIdentity.getMSPID();
    const collectionName = `_implicit_org_${mspid}`;
    return collectionName;
}

class <%= assetPascalCase %>Contract extends Contract {

    async <%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id) {
        const collectionName = await getCollectionName(ctx);
        const data = await ctx.stub.getPrivateDataHash(collectionName, <%= assetCamelCase %>Id);
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

        const collectionName = await getCollectionName(ctx);
        await ctx.stub.putPrivateData(collectionName, <%= assetCamelCase %>Id, Buffer.from(JSON.stringify(privateAsset)));
    }

    async read<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        let privateDataString;
        const collectionName = await getCollectionName(ctx);
        const privateData = await ctx.stub.getPrivateData(collectionName, <%= assetCamelCase %>Id);
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

        const collectionName = await getCollectionName(ctx);
        await ctx.stub.putPrivateData(collectionName, <%= assetCamelCase %>Id, Buffer.from(JSON.stringify(privateAsset)));
    }

    async delete<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The asset <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        const collectionName = await getCollectionName(ctx);
        await ctx.stub.deletePrivateData(collectionName, <%= assetCamelCase %>Id);
    }

    async verify<%= assetPascalCase %>(ctx, mspid, <%= assetCamelCase %>Id, objectToVerify) {

        // Convert provided object into a hash
        const hashToVerify = crypto.createHash('sha256').update(objectToVerify).digest('hex');
        const pdHashBytes = await ctx.stub.getPrivateDataHash(`_implicit_org_${mspid}`, <%= assetCamelCase %>Id);
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
