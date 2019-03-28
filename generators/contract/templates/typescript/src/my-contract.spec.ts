/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { MyContract } from '.';

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(sinonChai);

class TestContext implements Context {
    public stub: ChaincodeStub = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: ClientIdentity = sinon.createStubInstance(ClientIdentity);
    public logging: object = {
        getLogger: sinon.createStubInstance(winston.createLogger().constructor),
        setLevel: sinon.stub(),
     };
}

describe('MyContract', () => {

    describe('#instantiate', () => {

        it('should work', async () => {
            const contract = new MyContract();
            const ctx = new TestContext();
            await contract.instantiate(ctx);
        });

    });

    describe('#transaction1', () => {

        it('should work', async () => {
            const contract = new MyContract();
            const ctx = new TestContext();
            await contract.transaction1(ctx, 'hello');
        });

    });

    describe('#transaction2', () => {

        it('should work', async () => {
            const contract = new MyContract();
            const ctx = new TestContext();
            await contract.transaction2(ctx, 'hello', 'world');
        });

    });

});
