/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { <%= assetPascalCase %>Contract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('<%= assetPascalCase %>Contract', () => {

    let contract: <%= assetPascalCase %>Contract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new <%= assetPascalCase %>Contract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"<%= assetSpaceSeparator %> 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"<%= assetSpaceSeparator %> 1002 value"}'));
    });

    describe('#<%= assetCamelCase %>Exists', () => {

        it('should return true for a <%= assetSpaceSeparator %>', async () => {
            await contract.<%= assetCamelCase %>Exists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a <%= assetSpaceSeparator %> that does not exist', async () => {
            await contract.<%= assetCamelCase %>Exists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#create<%= assetPascalCase %>', () => {

        it('should create a <%= assetSpaceSeparator %>', async () => {
            await contract.create<%= assetPascalCase %>(ctx, '1003', '<%= assetSpaceSeparator %> 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"<%= assetSpaceSeparator %> 1003 value"}'));
        });

        it('should throw an error for a <%= assetSpaceSeparator %> that already exists', async () => {
            await contract.create<%= assetPascalCase %>(ctx, '1001', 'myvalue').should.be.rejectedWith(/The <%= assetSpaceSeparator %> 1001 already exists/);
        });

    });

    describe('#read<%= assetPascalCase %>', () => {

        it('should return a <%= assetSpaceSeparator %>', async () => {
            await contract.read<%= assetPascalCase %>(ctx, '1001').should.eventually.deep.equal({ value: '<%= assetSpaceSeparator %> 1001 value' });
        });

        it('should throw an error for a <%= assetSpaceSeparator %> that does not exist', async () => {
            await contract.read<%= assetPascalCase %>(ctx, '1003').should.be.rejectedWith(/The <%= assetSpaceSeparator %> 1003 does not exist/);
        });

    });

    describe('#update<%= assetPascalCase %>', () => {

        it('should update a <%= assetSpaceSeparator %>', async () => {
            await contract.update<%= assetPascalCase %>(ctx, '1001', '<%= assetSpaceSeparator %> 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"<%= assetSpaceSeparator %> 1001 new value"}'));
        });

        it('should throw an error for a <%= assetSpaceSeparator %> that does not exist', async () => {
            await contract.update<%= assetPascalCase %>(ctx, '1003', '<%= assetSpaceSeparator %> 1003 new value').should.be.rejectedWith(/The <%= assetSpaceSeparator %> 1003 does not exist/);
        });

    });

    describe('#delete<%= assetPascalCase %>', () => {

        it('should delete a <%= assetSpaceSeparator %>', async () => {
            await contract.delete<%= assetPascalCase %>(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a <%= assetSpaceSeparator %> that does not exist', async () => {
            await contract.delete<%= assetPascalCase %>(ctx, '1003').should.be.rejectedWith(/The <%= assetSpaceSeparator %> 1003 does not exist/);
        });

    });

});
