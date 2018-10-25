/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

package org.example

import org.hyperledger.fabric.shim.Chaincode.Response
import org.hyperledger.fabric.shim.ChaincodeBase
import org.hyperledger.fabric.shim.ChaincodeStub

class Chaincode : ChaincodeBase() {

    override fun init(stub: ChaincodeStub): Response {
        val fcn = stub.getFunction()
        val params = stub.getParameters()
        println("init() ${fcn} ${params}")
        return ChaincodeBase.newSuccessResponse()
    }

    override fun invoke(stub: ChaincodeStub): Response {
        val fcn = stub.getFunction()
        val params = stub.getParameters()
        println("invoke() ${fcn} ${params}")
        return ChaincodeBase.newSuccessResponse()
    }

}
