/*
 * SPDX-License-Identifier: WTFPL
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Contract (JavaScript, private)', () => {
    let dir;
    const sandbox = sinon.createSandbox();
    afterEach(() => {
        sandbox.restore();
    });

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
                'fabric-contract-api': '^2.4.1',
                'fabric-shim': '^2.4.1'
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
                'fabric-contract-api': '^2.4.1',
                'fabric-shim': '^2.4.1'
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
        pdcJSON.should.deep.equal([]);
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
        assert.fileContent('lib/my-private-conga-contract.js', /async verifyMyPrivateConga\(ctx, mspid, myPrivateCongaId, objectToVerify\) {/);
        assert.JSONFileContent('transaction_data/my-private-conga-transactions.txdata', [
            {
                transactionName: 'myPrivateCongaExists',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'createMyPrivateConga',
                arguments: ['001'],
                transientData: {
                    privateValue: 'some value'
                }
            },
            {
                transactionName: 'readMyPrivateConga',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'updateMyPrivateConga',
                arguments: ['001'],
                transientData: {
                    privateValue: 'some other value'
                }
            },
            {
                transactionName: 'deleteMyPrivateConga',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'verifyMyPrivateConga',
                arguments: ['Org1MSP', '001', {privateValue: 'some other value'}]
            }
        ]);
    });

    it('should throw an error if an incorrect contract type is provided', async () => {
        const errorStub = sandbox.stub();
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
            })
            .on('error', errorStub);
        await promise;
        errorStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Error));
        const error = errorStub.args[0][0];
        error.message.should.match(/Sorry the contract type 'penguin' does not exist./);
    });

    it('should throw error if language is not recognised', async () => {
        const errorStub = sandbox.stub();
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
            })
            .on('error', errorStub);
        await promise;
        errorStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Error));
        const error = errorStub.args[0][0];
        error.message.should.match(/Sorry the language 'penguin' is not recognized/);
    });

});
