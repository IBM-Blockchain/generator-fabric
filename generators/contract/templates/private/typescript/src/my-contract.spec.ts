/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

 // tslint:disable: no-unused-expression
import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { <%= assetPascalCase %>Contract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import crypto = require('crypto');
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
    const myCollectionName: string = 'CollectionOne';

    beforeEach(() => {
        contract = new <%= assetPascalCase %>Contract();
        ctx = new TestContext();
        ctx.stub.getPrivateData.withArgs(myCollectionName, '001').resolves(Buffer.from('{"privateValue":"150"}'));
    });

    describe('#<%= assetCamelCase %>Exists', () => {

        it('should return true for a <%= assetSpaceSeparator %>', async () => {
            await contract.<%= assetCamelCase %>Exists(ctx, '001').should.eventually.be.true;
        });

        it('should return false for a <%= assetSpaceSeparator %> that does not exist', async () => {
            await contract.<%= assetCamelCase %>Exists(ctx, '003').should.eventually.be.false;
        });

    });

    describe('#create<%= assetPascalCase %>', () => {

        it('should throw an error for a <%= assetSpaceSeparator %> that already exists', async () => {
            await contract.create<%= assetPascalCase %>(ctx, '001').should.be.rejectedWith(/The asset <%= assetSpaceSeparator %> 001 already exists/);
        });

        it('should throw an error if transient data is not provided when creating a <%= assetSpaceSeparator %>', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            ctx.stub.getTransient.returns(transientMap);
            await contract.create<%= assetPascalCase %>(ctx, '002').should.be.rejectedWith(`The privateValue key was not specified in transient data. Please try again.`);
        });

        it('should throw an error if transient data key is not privateValue', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('prVal', Buffer.from('125'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.create<%= assetPascalCase %>(ctx, '002').should.be.rejectedWith(`The privateValue key was not specified in transient data. Please try again.`);
        });

        it('should create a <%= assetSpaceSeparator %> if transient data key is privateValue', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('privateValue', Buffer.from('1500'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.create<%= assetPascalCase %>(ctx, '002');
            ctx.stub.putPrivateData.should.have.been.calledOnceWithExactly(myCollectionName, '002', Buffer.from('{"privateValue":"1500"}'));
        });

    });

    describe('#readPrivate<%= assetPascalCase %>', () => {

        it('should throw an error for a <%= assetSpaceSeparator %> that does not exist', async () => {
            await contract.read<%= assetPascalCase %>(ctx, '003').should.be.rejectedWith(/The asset <%= assetSpaceSeparator %> 003 does not exist/);
        });

        it('should return a <%= assetSpaceSeparator %>', async () => {
            await contract.read<%= assetPascalCase %>(ctx, '001').should.eventually.deep.equal({ privateValue: '150' });
            ctx.stub.getPrivateData.should.have.been.calledWithExactly(myCollectionName, '001');
        });

    });

    describe('#update<%= assetPascalCase %>', () => {

        it('should throw an error for a <%= assetSpaceSeparator %> that does not exist', async () => {
            await contract.update<%= assetPascalCase %>(ctx, '003').should.be.rejectedWith(/The asset <%= assetSpaceSeparator %> 003 does not exist/);
        });

        it('should throw an error if transient data is not provided when updating a <%= assetSpaceSeparator %>', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            ctx.stub.getTransient.returns(transientMap);
            await contract.update<%= assetPascalCase %>(ctx, '001').should.be.rejectedWith(`The privateValue key was not specified in transient data. Please try again.`);
        });

        it('should update my private asset if transient data key is privateValue', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('privateValue', Buffer.from('99'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.update<%= assetPascalCase %>(ctx, '001');
            ctx.stub.putPrivateData.should.have.been.calledOnceWithExactly(myCollectionName, '001', Buffer.from('{"privateValue":"99"}'));
        });

        it('should throw an error if transient data key is not privateValue', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('prVal', Buffer.from('125'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.update<%= assetPascalCase %>(ctx, '001').should.be.rejectedWith(`The privateValue key was not specified in transient data. Please try again.`);
        });

    });

    describe('#delete<%= assetPascalCase %>', () => {

        it('should throw an error for a <%= assetSpaceSeparator %> that does not exist', async () => {
            await contract.delete<%= assetPascalCase %>(ctx, '003').should.be.rejectedWith(/The asset <%= assetSpaceSeparator %> 003 does not exist/);
        });

        it('should delete a <%= assetSpaceSeparator %>', async () => {
            await contract.delete<%= assetPascalCase %>(ctx, '001');
            ctx.stub.deletePrivateData.should.have.been.calledOnceWithExactly(myCollectionName, '001');
        });

    });

    describe('#verify<%= assetPascalCase %>', () => {

        it('should return true if hash calculated from object provided matches the hash of the private data', async () => {
            const privateObj: string = '{"privateValue":"125"}';
            const hashToVerify: string = crypto.createHash('sha256').update(privateObj).digest('hex');
            ctx.stub.getPrivateDataHash.resolves(Buffer.from(hashToVerify, 'hex'));
            const result: boolean = await contract.verify<%= assetPascalCase %>(ctx, '001', {privateValue: '125'});
            result.should.equal(true);
        });

        it('should return false if hash calculated from object provided does not match the hash of the private data', async () => {
            ctx.stub.getPrivateDataHash.resolves(Buffer.from('someHash'));
            const result: boolean = await contract.verify<%= assetPascalCase %>(ctx, '001', {privateValue: 'someValue'});
            result.should.equal(false);
        });

        it('should throw an error when user tries to verify an asset that doesnt exist', async () => {
            ctx.stub.getPrivateDataHash.resolves(Buffer.from(''));
            await contract.verify<%= assetPascalCase %>(ctx, '001', {privateValue: 'someValue'}).should.be.rejectedWith('No private data hash with the Key: 001');
        });

    });

});
