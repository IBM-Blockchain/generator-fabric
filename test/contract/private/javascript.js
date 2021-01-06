/*
 * SPDX-License-Identifier: WTFPL
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const Mocha = require('mocha');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
chai.should();
chai.use(sinonChai);

describe('Contract (JavaScript)', () => {
    let dir;
    const sandbox = sinon.createSandbox();
    afterEach(() => {
        sandbox.restore();
    });

    let genericPDC = [
        {
            name: 'CollectionOne',
            policy: 'OR(\'Org1MSP.member\')',
            requiredPeerCount: 0,
            maxPeerCount: 1,
            blockToLive: 0,
            memberOnlyRead: true
        }
    ];

    it('should generate a JavaScript project using prompts', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.file([
            '.vscode/extensions.json',
            'lib/my-private-conga-contract.js',
            'test/my-private-conga-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json',
            'collections.json',
            'transaction_data/my-private-conga-transactions.txdata'
        ]);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            dependencies: {
                'fabric-contract-api': '^2.2.0',
                'fabric-shim': '^2.2.0'
            }
        });
    });

    it('should generate a JavaScript project using options', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/contract'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions({
                contractType: 'private',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.file([
            'lib/my-private-conga-contract.js',
            'test/my-private-conga-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json',
            'collections.json',
            'transaction_data/my-private-conga-transactions.txdata'
        ]);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            dependencies: {
                'fabric-contract-api': '^2.2.0',
                'fabric-shim': '^2.2.0'
            }
        });
    });

    it('should generate a private data collection file', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        const pdcJSON = require(path.join(dir, 'collections.json'));
        console.log('pdc variable' + pdcJSON);
        pdcJSON.should.deep.equal(genericPDC);
    });

    it('should generate a node package file', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-javascript-contract',
            version: '0.0.1',
            description: 'My JavaScript Contract',
            author: 'James Conga',
            license: 'WTFPL'
        });
    });

    it('should generate a private data contract', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.fileContent('lib/my-private-conga-contract.js', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('lib/my-private-conga-contract.js', /class MyPrivateCongaContract extends Contract {/);
        assert.fileContent('lib/my-private-conga-contract.js', /async myPrivateCongaExists\(ctx, myPrivateCongaId\) {/);
        assert.fileContent('lib/my-private-conga-contract.js', /async createMyPrivateConga\(ctx, myPrivateCongaId\) {/);
        assert.fileContent('lib/my-private-conga-contract.js', /async readMyPrivateConga\(ctx, myPrivateCongaId\) {/);
        assert.fileContent('lib/my-private-conga-contract.js', /async updateMyPrivateConga\(ctx, myPrivateCongaId\) {/);
        assert.fileContent('lib/my-private-conga-contract.js', /async deleteMyPrivateConga\(ctx, myPrivateCongaId\) {/);
        assert.fileContent('lib/my-private-conga-contract.js', /async verifyMyPrivateConga\(ctx, myPrivateCongaId, objectToVerify\) {/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "myPrivateCongaExists",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "createMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "readMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "updateMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "deleteMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "verifyMyPrivateConga",/);
    });

    it('should throw an error if an incorrect contract type is provided', async () => {
        const errorStub = sandbox.stub(Mocha.Runner.prototype, 'uncaught');
        const promise = new Promise((resolve) => {
            errorStub.callsFake(resolve);
        });
        helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'penguin',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My Typescript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        await promise;
        errorStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Error));
        const error = errorStub.args[0][0];
        error.message.should.match(/Sorry the contract type 'penguin' does not exist./);
    });

    it('should throw error if language is not recognised', async () => {
        const errorStub = sandbox.stub(Mocha.Runner.prototype, 'uncaught');
        const promise = new Promise((resolve) => {
            errorStub.callsFake(resolve);
        });
        helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'penguin',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My Typescript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        await promise;
        errorStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Error));
        const error = errorStub.args[0][0];
        error.message.should.match(/Sorry the language 'penguin' is not recognized/);
    });

});
