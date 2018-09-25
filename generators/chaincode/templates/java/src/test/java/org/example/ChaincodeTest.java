/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.example;

import org.junit.Test;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;

import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.Chaincode.Response;
import org.hyperledger.fabric.shim.Chaincode.Response.Status;

public class ChaincodeTest {

    @Test
    public void testInit() {
        Chaincode cc = new Chaincode();
        ChaincodeStub stub = mock(ChaincodeStub.class);
        when(stub.getFunction()).thenReturn("initFunc");
        when(stub.getParameters()).thenReturn(new ArrayList<String>());
        Response res = cc.init(stub);
        assertEquals(Status.SUCCESS, res.getStatus());
    }

    @Test
    public void testInvoke() {
        Chaincode cc = new Chaincode();
        ChaincodeStub stub = mock(ChaincodeStub.class);
        when(stub.getFunction()).thenReturn("initFunc");
        when(stub.getParameters()).thenReturn(new ArrayList<String>());
        Response res = cc.init(stub);
        assertEquals(Status.SUCCESS, res.getStatus());
        when(stub.getFunction()).thenReturn("invokeFunc");
        when(stub.getParameters()).thenReturn(new ArrayList<String>());
        res = cc.invoke(stub);
        assertEquals(Status.SUCCESS, res.getStatus());
    }

}
