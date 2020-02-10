/*
 * SPDX-License-Identifier: Apache License 2.0
 */

package org.example;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;


public final class <%= assetPascalCase %>ContractTest {

    Context ctx;
    ChaincodeStub stub;
    MyPrivateAssetContract contract;

    String collection = "CollectionOne";

    @BeforeEach
    void beforeEach() {
        ctx = mock(Context.class);
        stub = mock(ChaincodeStub.class);
        when(ctx.getStub()).thenReturn(stub);

        contract = new <%= assetPascalCase %>Contract();

        byte[] someAsset = ("{\"privateValue\":\"125\"}").getBytes(StandardCharsets.UTF_8);
        when(stub.getPrivateData(collection, "001")).thenReturn(someAsset);
    }

    @Nested
    class AssetExists {
        @Test
        public void noProperAsset() {
            when(stub.getPrivateData(collection, "002")).thenReturn(("").getBytes(StandardCharsets.UTF_8));
            boolean result = contract.<%= assetCamelCase %>Exists(ctx, "002");
            assertFalse(result);
        }

        @Test
        public void assetExists() {
            boolean result = contract.<%= assetCamelCase %>Exists(ctx, "001");
            assertTrue(result);
        }

        @Test
        public void noKey() {
            boolean result = contract.<%= assetCamelCase %>Exists(ctx,"10002");
            assertFalse(result);
        }
    }

    @Nested
    class AssetCreates {

        @Test
        public void newPrivateAssetCreate() throws UnsupportedEncodingException {
            Map<String, byte[]> transientMap = new HashMap<>();

            transientMap.put("privateValue", "150".getBytes(StandardCharsets.UTF_8));

            when(stub.getTransient()).thenReturn(transientMap);
            contract.create<%= assetPascalCase %>(ctx, "002");

            verify(stub).putPrivateData(collection, "002",
                    ("{\"privateValue\":\"150\"}").getBytes(StandardCharsets.UTF_8));
        }

        @Test
        public void alreadyExists() throws UnsupportedEncodingException {
            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.create<%= assetPascalCase %>(ctx, "001");
            });

            assertEquals(thrown.getMessage(), "The asset <%= assetSpaceSeparator %> 001 already exists");
        }

        @Test
        public void noTransient() {
            Map<String, byte[]> transientMap = new HashMap<>();

            when(stub.getTransient()).thenReturn(transientMap);
            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.create<%= assetPascalCase %>(ctx, "002");
            });

            assertEquals(thrown.getMessage(),
                    "The privateValue key was not specified in transient data. Please try again.");
        }

        @Test
        public void incorrectKeyTransient() throws UnsupportedEncodingException {
            Map<String, byte[]> transientMap = new HashMap<>();

            transientMap.put("someValue", "125".getBytes(StandardCharsets.UTF_8));

            when(stub.getTransient()).thenReturn(transientMap);
            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.create<%= assetPascalCase %>(ctx, "002");
            });

            assertEquals(thrown.getMessage(),
                    "The privateValue key was not specified in transient data. Please try again.");
        }

    }

    @Nested
    class AssetReads {
        @Test
        public void privateAssetRead() throws UnsupportedEncodingException {

            when(stub.getPrivateData(collection, "001"))
                    .thenReturn(("{\"privateValue\":\"125\"}").getBytes(StandardCharsets.UTF_8));
            String expectedString = "{\"privateValue\":\"125\"}";

            String returnedAssetString = contract.read<%= assetPascalCase %>(ctx, "001");
            assertEquals(expectedString, returnedAssetString);
        }

        @Test
        public void noSuchPrivateAsset() {
            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.read<%= assetPascalCase %>(ctx, "002");
            });

            assertEquals(thrown.getMessage(), "The asset <%= assetSpaceSeparator %> 002 does not exist");
        }
    }

    @Nested
    class AssetUpdates {
        @Test
        public void updateExisting() throws UnsupportedEncodingException {
            when(stub.getPrivateData(collection, "001"))
                    .thenReturn(("{\"privateValue\":\"125\"}").getBytes(StandardCharsets.UTF_8));
            Map<String, byte[]> transientMap = new HashMap<>();

            transientMap.put("privateValue", "150".getBytes(StandardCharsets.UTF_8));

            when(stub.getTransient()).thenReturn(transientMap);

            contract.update<%= assetPascalCase %>(ctx, "001");

            verify(stub).putPrivateData(collection, "001",
                    ("{\"privateValue\":\"150\"}").getBytes(StandardCharsets.UTF_8));
        }

        @Test
        public void updateMissing() {
            when(stub.getPrivateData(collection, "002")).thenReturn(null);

            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.update<%= assetPascalCase %>(ctx, "002");
            });

            assertEquals(thrown.getMessage(), "The asset <%= assetSpaceSeparator %> 002 does not exist");
        }

    }

    @Nested
    class AssetDelete {
        @Test
        public void deleteExisting() {
            contract.delete<%= assetPascalCase %>(ctx, "001");
            verify(stub).delPrivateData(collection, "001");
        }

        @Test
        public void deleteMissing() {
            when(stub.getPrivateData(collection, "002")).thenReturn(null);

            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.delete<%= assetPascalCase %>(ctx, "002");
            });
            assertEquals(thrown.getMessage(), "The asset <%= assetSpaceSeparator %> 002 does not exist");
        }
    }

    @Nested
    class AssetVerify {
        @Test
        public void verifyExistingCorrect() throws NoSuchAlgorithmException {
            <%= assetPascalCase %> someAsset = new <%= assetPascalCase %>();
            someAsset.privateValue = "125";

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashByte = digest.digest(someAsset.toJSONString().getBytes(StandardCharsets.UTF_8));

            when(stub.getPrivateDataHash(collection, "001")).thenReturn(hashByte);

            boolean result = contract.verify<%= assetPascalCase %>(ctx, "001", someAsset);

            assertTrue(result);
        }

        @Test
        public void verifyExistingIncorrect() throws NoSuchAlgorithmException {
            <%= assetPascalCase %> someAsset = new <%= assetPascalCase %>();
            someAsset.privateValue = "125";

            when(stub.getPrivateDataHash(collection, "001")).thenReturn(("someAsset").getBytes(StandardCharsets.UTF_8));

            boolean result = contract.verify<%= assetPascalCase %>(ctx, "001", someAsset);

            assertFalse(result);   
        }

        @Test
        public void verifyMissing() throws NoSuchAlgorithmException {
            <%= assetPascalCase %> someAsset = new <%= assetPascalCase %>();

            when(stub.getPrivateDataHash(collection, "002")).thenReturn(("").getBytes(StandardCharsets.UTF_8));

            Exception thrown = assertThrows(RuntimeException.class, () -> {
                contract.verify<%= assetPascalCase %>(ctx, "002", someAsset);
            });

            assertEquals(thrown.getMessage(), "No private data hash with the key: 002");

        }
    }

}
