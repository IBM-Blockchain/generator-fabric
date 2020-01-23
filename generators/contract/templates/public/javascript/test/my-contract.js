/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { <%= assetPascalCase %>Contract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('<%= assetPascalCase %>Contract', () => {

    let contract;
    let ctx;

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