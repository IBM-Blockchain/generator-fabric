/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyContract extends Contract {

    async assetExists(ctx, assetId) {
        const buffer = await ctx.stub.getState(assetId);
        return (!!buffer && buffer.length > 0);
    }

    async createAsset(ctx, assetId, value) {
        const exists = await this.assetExists(ctx, assetId);
        if (exists) {
            throw new Error(`The asset ${assetId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(assetId, buffer);
    }

    async readAsset(ctx, assetId) {
        const exists = await this.assetExists(ctx, assetId);
        if (!exists) {
            throw new Error(`The asset ${assetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(assetId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateAsset(ctx, assetId, newValue) {
        const exists = await this.assetExists(ctx, assetId);
        if (!exists) {
            throw new Error(`The asset ${assetId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(assetId, buffer);
    }

    async deleteAsset(ctx, assetId) {
        const exists = await this.assetExists(ctx, assetId);
        if (!exists) {
            throw new Error(`The asset ${assetId} does not exist`);
        }
        await ctx.stub.deleteState(assetId);
    }

}

module.exports = MyContract;
