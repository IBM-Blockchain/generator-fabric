/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */
package org.example;

import org.hyperledger.fabric.contract.ClientIdentity;
import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.contract.annotation.Contact;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.License;

import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@Contract(name = "<%= assetPascalCase %>Contract",
    info = @Info(title = "<%= assetPascalCase %> contract",
                description = "<%= description %>",
                version = "<%= version %>",
                license =
                        @License(name = "<%= license %>",
                                url = ""),
                                contact =  @Contact(email = "<%= name %>@example.com",
                                                name = "<%= name %>",
                                                url = "http://<%= name %>.me")))
@Default
public class <%= assetPascalCase %>Contract implements ContractInterface {
    private String getCollectionName(Context ctx) {
        ClientIdentity clientIdentity = ctx.getClientIdentity();
        String mspid = clientIdentity.getMSPID();
        String collectionName = "_implicit_org_" + mspid;
        return collectionName;
    }

    public  <%= assetPascalCase %>Contract() {

    }
    @Transaction()
    public boolean <%= assetCamelCase %>Exists(Context ctx, String <%= assetCamelCase %>Id) {
        String collection = this.getCollectionName(ctx);
        byte[] buffer = ctx.getStub().getPrivateDataHash(collection, <%= assetCamelCase %>Id);
        return (buffer != null && buffer.length > 0);
    }

    @Transaction()
    public void create<%= assetPascalCase %>(Context ctx, String <%= assetCamelCase %>Id) throws UnsupportedEncodingException {
        boolean exists = <%= assetCamelCase %>Exists(ctx,<%= assetCamelCase %>Id);
        if (exists) {
            throw new RuntimeException("The asset <%= assetSpaceSeparator %> "+<%= assetCamelCase %>Id+" already exists");
        }
        <%= assetPascalCase %> privateAsset = new <%= assetPascalCase %>();
        Map<String, byte[]> transientData = ctx.getStub().getTransient();

        if (transientData.size() == 0 | !transientData.containsKey("privateValue")) {
            throw new RuntimeException("The privateValue key was not specified in transient data. Please try again.");
        }
        privateAsset.privateValue = new String(transientData.get("privateValue"), "UTF-8");

        String collection = this.getCollectionName(ctx);
        ctx.getStub().putPrivateData(collection, <%= assetCamelCase %>Id, privateAsset.toJSONString().getBytes(StandardCharsets.UTF_8));
    }

    @Transaction()
    public String read<%= assetPascalCase %>(Context ctx, String <%= assetCamelCase %>Id) throws UnsupportedEncodingException {
        boolean exists = <%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new RuntimeException("The asset <%= assetSpaceSeparator %> " + <%= assetCamelCase %>Id + " does not exist");
        }

        String collection = this.getCollectionName(ctx);
        byte[] privateData = ctx.getStub().getPrivateData(collection, <%= assetCamelCase %>Id);
        String privateDataString = new String(privateData, "UTF-8");

        return privateDataString;
    }

    @Transaction()
    public void update<%= assetPascalCase %>(Context ctx, String <%= assetCamelCase %>Id) throws UnsupportedEncodingException {
        boolean exists = <%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new RuntimeException("The asset <%= assetSpaceSeparator %> " + <%= assetCamelCase %>Id + " does not exist");
        }
        <%= assetPascalCase %> privateAsset = new <%= assetPascalCase %>();

        Map<String, byte[]> transientData = ctx.getStub().getTransient();

        if (transientData.size() == 0 | !transientData.containsKey("privateValue")) {
            throw new RuntimeException("The privateValue key was not specified in transient data. Please try again.");
        }
        privateAsset.privateValue = new String(transientData.get("privateValue"), "UTF-8");

        String collection = this.getCollectionName(ctx);
        ctx.getStub().putPrivateData(collection, <%= assetCamelCase %>Id, privateAsset.toJSONString().getBytes(StandardCharsets.UTF_8));
    }

    @Transaction()
    public void delete<%= assetPascalCase %>(Context ctx, String <%= assetCamelCase %>Id) {
        boolean exists = <%= assetCamelCase %>Exists(ctx, <%= assetCamelCase %>Id);
        if (!exists) {
            throw new RuntimeException("The asset <%= assetSpaceSeparator %> " + <%= assetCamelCase %>Id + " does not exist");
        }

        String collection = this.getCollectionName(ctx);
        ctx.getStub().delPrivateData(collection, <%= assetCamelCase %>Id);
    }

    @Transaction()
    public boolean verify<%= assetPascalCase %>(Context ctx, String mspid, String <%= assetCamelCase %>Id, <%= assetPascalCase %> objectToVerify) throws NoSuchAlgorithmException {

        // Convert user provided object into hash
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashByte = digest.digest(objectToVerify.toJSONString().getBytes(StandardCharsets.UTF_8));

        String hashToVerify = new BigInteger(1, hashByte).toString(16);

        // Get hash stored on the public ledger
        byte[] pdHashBytes = ctx.getStub().getPrivateDataHash("_implicit_org_" + mspid, <%= assetCamelCase %>Id);
        if (pdHashBytes.length == 0) {
            throw new RuntimeException("No private data hash with the key: " + <%= assetCamelCase %>Id);
        }

        String actualHash = new BigInteger(1, pdHashBytes).toString(16);

        if (hashToVerify.equals(actualHash)) {
            return true;
        } else {
            return false;
        }
    }

}
