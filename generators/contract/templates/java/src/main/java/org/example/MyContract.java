/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */
package org.example;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.contract.annotation.Contact;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.License;
import static java.nio.charset.StandardCharsets.UTF_8;

@Contract(name = "<%= assetPascalCase %>Contract", 
    info = @Info(title = "<%= assetPascalCase %> contract", 
                description = "<%= description %>", 
                version = "<%= version %>", 
                license = 
                        @License(name = "<%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>", 
                                url = ""), 
                                contact =  @Contact(email = "<%= name %>@example.com", 
                                                name = "<%= name %>", 
                                                url = "http://<%= name %>.me")))
@Default
public class <%= assetPascalCase %>Contract implements ContractInterface {
    public  <%= assetPascalCase %>Contract() {

    }
    @Transaction()
    public boolean <%= assetCamelCase %>Exists(Context ctx, String <%= assetCamelCase %>Id) {
        byte[] buffer = ctx.getStub().getState(<%= assetCamelCase %>Id);
        return (buffer != null && buffer.length > 0);
    }

    @Transaction()
    public void create<%= assetPascalCase %>(Context ctx, String <%= assetCamelCase %>Id, String value) {
        boolean exists = <%= assetCamelCase %>Exists(ctx,<%= assetCamelCase %>Id);
        if (exists) {
            throw new RuntimeException("The asset "+<%= assetCamelCase %>Id+" already exists");
        }
        <%= assetPascalCase %> asset = new <%= assetPascalCase %>();
        asset.setValue(value);
        ctx.getStub().putState(<%= assetCamelCase %>Id, asset.toJSONString().getBytes(UTF_8));
    }

    @Transaction()
    public <%= assetPascalCase %> read<%= assetPascalCase %>(Context ctx, String <%= assetCamelCase %>Id) {
        boolean exists = <%= assetCamelCase %>Exists(ctx,<%= assetCamelCase %>Id);
        if (!exists) {
            throw new RuntimeException("The asset "+<%= assetCamelCase %>Id+" does not exist");
        }

        <%= assetPascalCase %> newAsset = <%= assetPascalCase %>.fromJSONString(new String(ctx.getStub().getState(<%= assetCamelCase %>Id),UTF_8));
        return newAsset;
    }

    @Transaction()
    public void update<%= assetPascalCase %>(Context ctx, String <%= assetCamelCase %>Id, String newValue) {
        boolean exists = <%= assetCamelCase %>Exists(ctx,<%= assetCamelCase %>Id);
        if (!exists) {
            throw new RuntimeException("The asset "+<%= assetCamelCase %>Id+" does not exist");
        }
        <%= assetPascalCase %> asset = new <%= assetPascalCase %>();
        asset.setValue(newValue);
        
        ctx.getStub().putState(<%= assetCamelCase %>Id, asset.toJSONString().getBytes(UTF_8));
    }

    @Transaction()
    public void delete<%= assetPascalCase %>(Context ctx, String <%= assetCamelCase %>Id) {
        boolean exists = <%= assetCamelCase %>Exists(ctx,<%= assetCamelCase %>Id);
        if (!exists) {
            throw new RuntimeException("The asset "+<%= assetCamelCase %>Id+" does not exist");
        }
        ctx.getStub().delState(<%= assetCamelCase %>Id);
    }
    
}