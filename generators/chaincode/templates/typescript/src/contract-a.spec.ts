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

import { ChaincodeStub } from 'fabric-shim';
import { Chaincode } from '.';

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

describe('Chaincode', () => {

    describe('#Init', () => {

        it('should work', async () => {
            const cc = new Chaincode();
            const stub = sinon.createStubInstance(ChaincodeStub);
            stub.getFunctionAndParameters.returns({ fcn: 'initFunc', params: [] });
            const res = await cc.Init(stub);
            res.status.should.equal(ChaincodeStub.RESPONSE_CODE.OK);
        });

    });

    describe('#Invoke', async () => {

        it('should work', async () => {
            const cc = new Chaincode();
            const stub = sinon.createStubInstance(ChaincodeStub);
            stub.getFunctionAndParameters.returns({ fcn: 'initFunc', params: [] });
            let res = await cc.Init(stub);
            res.status.should.equal(ChaincodeStub.RESPONSE_CODE.OK);
            stub.getFunctionAndParameters.returns({ fcn: 'invokeFunc', params: [] });
            res = await cc.Invoke(stub);
            res.status.should.equal(ChaincodeStub.RESPONSE_CODE.OK);
        });

    });

});
