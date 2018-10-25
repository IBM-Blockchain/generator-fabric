/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

package org.example;

import org.junit.Test;
import org.junit.Assert.*;
import com.nhaarman.mockitokotlin2.*;

import java.util.ArrayList;

import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.Chaincode.Response;
import org.hyperledger.fabric.shim.Chaincode.Response.Status;

class ChaincodeTest {

    @Test
    fun testInit() {
        val cc = Chaincode()
        val stub: ChaincodeStub = mock()
        whenever(stub.getFunction()).thenReturn("initFunc")
        whenever(stub.getParameters()).thenReturn(ArrayList<String>())
        val res = cc.init(stub)
        assertEquals(Status.SUCCESS, res.getStatus())
    }

    @Test
    fun testInvoke() {
        val cc = Chaincode()
        val stub: ChaincodeStub = mock()
        whenever(stub.getFunction()).thenReturn("initFunc")
        whenever(stub.getParameters()).thenReturn(ArrayList<String>())
        var res = cc.init(stub)
        assertEquals(Status.SUCCESS, res.getStatus())
        whenever(stub.getFunction()).thenReturn("invokeFunc")
        whenever(stub.getParameters()).thenReturn(ArrayList<String>())
        res = cc.invoke(stub)
        assertEquals(Status.SUCCESS, res.getStatus())
    }

}
