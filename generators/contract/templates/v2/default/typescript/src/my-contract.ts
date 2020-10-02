/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { <%= assetPascalCase %> } from './<%= assetDashSeparator %>';

@Info({title: '<%= assetPascalCase %>Contract', description: '<%= description %>' })
export class <%= assetPascalCase %>Contract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async <%= assetCamelCase %>Exists(ctx: Context, <%= assetCamelCase %>Id: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(<%= assetCamelCase %>Id);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async create<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string, value: string): Promise<void> {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (exists) {
            throw new Error(`The <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} already exists`);
        }
        const <%= assetCamelCase %> = new <%= assetPascalCase %>();
        <%= assetCamelCase %>.value = value;
        const buffer = Buffer.from(JSON.stringify(<%= assetCamelCase %>));
        await ctx.stub.putState(<%= assetCamelCase %>Id, buffer);
    }

    @Transaction(false)
    @Returns('<%= assetPascalCase %>')
    public async read<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<<%= assetPascalCase %>> {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        const buffer = await ctx.stub.getState(<%= assetCamelCase %>Id);
        const <%= assetCamelCase %> = JSON.parse(buffer.toString()) as <%= assetPascalCase %>;
        return <%= assetCamelCase %>;
    }

    @Transaction()
    public async update<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string, newValue: string): Promise<void> {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        const <%= assetCamelCase %> = new <%= assetPascalCase %>();
        <%= assetCamelCase %>.value = newValue;
        const buffer = Buffer.from(JSON.stringify(<%= assetCamelCase %>));
        await ctx.stub.putState(<%= assetCamelCase %>Id, buffer);
    }

    @Transaction()
    public async delete<%= assetPascalCase %>(ctx: Context, <%= assetCamelCase %>Id: string): Promise<void> {
        const exists = await this.<%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new Error(`The <%= assetSpaceSeparator %> ${<%= assetCamelCase %>Id} does not exist`);
        }
        await ctx.stub.deleteState(<%= assetCamelCase %>Id);
    }

}
