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

import { ChaincodeInterface, ChaincodeStub, Shim } from 'fabric-shim';

export class Chaincode implements ChaincodeInterface {

    public async Init(stub: ChaincodeStub): Promise<any> {
        const { fcn, params } = stub.getFunctionAndParameters();
        console.info('Init()', fcn, params);
        return Shim.success();
    }

    public async Invoke(stub: ChaincodeStub): Promise<any> {
        const { fcn, params } = stub.getFunctionAndParameters();
        console.info('Invoke()', fcn, params);
        return Shim.success();
    }

}
