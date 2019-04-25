/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class <%= assetPascalCase %>Contract extends Contract {

    async <%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id) {
        const buffer = await ctx.stub.getState(<%= assetCamelCase %>Id);
        return (!!buffer && buffer.length > 0);
    }

    async create<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id, value) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (exists) {
            throw new Error(`The <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(<%= assetCamelCase %>Id, buffer);
    }

    async read<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        const buffer = await ctx.stub.getState(<%= assetCamelCase %>Id);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async update<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id, newValue) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(<%= assetCamelCase %>Id, buffer);
    }

    async delete<%= assetPascalCase %>(ctx, <%= assetCamelCase %>Id) {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        await ctx.stub.deleteState(<%= assetCamelCase %>Id);
    }

}

module.exports = <%= assetPascalCase %>Contract;
