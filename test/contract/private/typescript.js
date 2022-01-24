/*
 * SPDX-License-Identifier: WTFPL
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const chai = require('chai');
chai.should();
chai.use(sinonChai);

describe('Contract (TypeScript, private)', () => {
    let dir;

    const sandbox = sinon.createSandbox();
    afterEach(() => {
        sandbox.restore();
    });

    it('should generate a TypeScript project using prompts', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My Typescript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.file([
            '.vscode/extensions.json',
            'src/my-private-conga.ts',
            'src/my-private-conga-contract.spec.ts',
            'src/my-private-conga-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json',
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

    it('should generate a TypeScript project using options', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/contract'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions({
                contractType: 'private',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.file([
            '.vscode/extensions.json',
            'src/my-private-conga.ts',
            'src/my-private-conga-contract.spec.ts',
            'src/my-private-conga-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json',
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
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga',
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
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-typescript-contract',
            version: '0.0.1',
            description: 'My TypeScript Contract',
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
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.fileContent('src/my-private-conga.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/my-private-conga.ts', /export class MyPrivateConga {/);
        assert.fileContent('src/my-private-conga-contract.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/my-private-conga-contract.ts', /export class MyPrivateCongaContract extends Contract {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async myPrivateCongaExists\(ctx: Context, myPrivateCongaId: string\): Promise<boolean> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async createMyPrivateConga\(ctx: Context, myPrivateCongaId: string\): Promise<void> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async readMyPrivateConga\(ctx: Context, myPrivateCongaId: string\): Promise<string> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async updateMyPrivateConga\(ctx: Context, myPrivateCongaId: string\): Promise<void> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async deleteMyPrivateConga\(ctx: Context, myPrivateCongaId: string\): Promise<void> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async verifyMyPrivateConga\(ctx: Context, mspid: string, myPrivateCongaId: string, objectToVerify: MyPrivateConga\): Promise<boolean> {/);
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
