/*
 * SPDX-License-Identifier: Apache License 2.0
 */

package org.example;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;


public final class <%= assetPascalCase %>ContractTest {

    @Nested
    class AssetExists {
        @Test
        public void noProperAsset() {

            <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
            Context ctx = mock(Context.class);
            ChaincodeStub stub = mock(ChaincodeStub.class);
            when(ctx.getStub()).thenReturn(stub);
            
            when(stub.getState("10001")).thenReturn(new byte[] {});
            boolean result = contract.<%= assetCamelCase %>Exists(ctx,"10001");

            assertFalse(result);
        }

        @Test
        public void assetExists() {

            <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
            Context ctx = mock(Context.class);
            ChaincodeStub stub = mock(ChaincodeStub.class);
            when(ctx.getStub()).thenReturn(stub);
            
            when(stub.getState("10001")).thenReturn(new byte[] {42});
            boolean result = contract.<%= assetCamelCase %>Exists(ctx,"10001");

            assertTrue(result);

        }

        @Test
        public void noKey() {
            <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
            Context ctx = mock(Context.class);
            ChaincodeStub stub = mock(ChaincodeStub.class);
            when(ctx.getStub()).thenReturn(stub);           
            
            when(stub.getState("10002")).thenReturn(null);
            boolean result = contract.<%= assetCamelCase %>Exists(ctx,"10002");

            assertFalse(result);

        }

    }

    @Nested
    class AssetCreates {

        @Test
        public void newAssetCreate() {
            <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
            Context ctx = mock(Context.class);
            ChaincodeStub stub = mock(ChaincodeStub.class);
            when(ctx.getStub()).thenReturn(stub);

            String json = "{\"value\":\"TheAsset\"}";

            contract.create<%= assetPascalCase %>(ctx, "10001", "TheAsset");

            verify(stub).putState("10001", json.getBytes(UTF_8));
        }

        @Test
        public void alreadyExists() {
            <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
            Context ctx = mock(Context.class);
            ChaincodeStub stub = mock(ChaincodeStub.class);
            when(ctx.getStub()).thenReturn(stub);

            when(stub.getState("10002")).thenReturn(new byte[] { 42 });

            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.create<%= assetPascalCase %>(ctx, "10002", "TheAsset");
            });

            assertEquals(thrown.getMessage(), "The asset 10002 already exists");

        }

    }

    @Test
    public void assetRead() {
        <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
        Context ctx = mock(Context.class);
        ChaincodeStub stub = mock(ChaincodeStub.class);
        when(ctx.getStub()).thenReturn(stub);

        <%= assetPascalCase %> asset = new  <%= assetPascalCase %>();
        asset.setValue("Valuable");

        String json = asset.toJSONString();
        when(stub.getState("10001")).thenReturn(json.getBytes(StandardCharsets.UTF_8));

        <%= assetPascalCase %> returnedAsset = contract.read<%= assetPascalCase %>(ctx, "10001");
        assertEquals(returnedAsset.getValue(), asset.getValue());
    }

    @Nested
    class AssetUpdates {
        @Test
        public void updateExisting() {
            <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
            Context ctx = mock(Context.class);
            ChaincodeStub stub = mock(ChaincodeStub.class);
            when(ctx.getStub()).thenReturn(stub);
            when(stub.getState("10001")).thenReturn(new byte[] { 42 });

            contract.update<%= assetPascalCase %>(ctx, "10001", "updates");

            String json = "{\"value\":\"updates\"}";
            verify(stub).putState("10001", json.getBytes(UTF_8));
        }

        @Test
        public void updateMissing() {
            <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
            Context ctx = mock(Context.class);
            ChaincodeStub stub = mock(ChaincodeStub.class);
            when(ctx.getStub()).thenReturn(stub);

            when(stub.getState("10001")).thenReturn(null);

            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.update<%= assetPascalCase %>(ctx, "10001", "TheAsset");
            });

            assertEquals(thrown.getMessage(), "The asset 10001 does not exist");
        }

    }

    @Test
    public void assetDelete() {
        <%= assetPascalCase %>Contract contract = new  <%= assetPascalCase %>Contract();
        Context ctx = mock(Context.class);
        ChaincodeStub stub = mock(ChaincodeStub.class);
        when(ctx.getStub()).thenReturn(stub);
        when(stub.getState("10001")).thenReturn(null);

        Exception thrown = assertThrows(RuntimeException.class, () -> {
            contract.delete<%= assetPascalCase %>(ctx, "10001");
        });

        assertEquals(thrown.getMessage(), "The asset 10001 does not exist");
    }

}