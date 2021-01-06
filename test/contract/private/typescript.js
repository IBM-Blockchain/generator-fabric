/*
 * SPDX-License-Identifier: WTFPL
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const sinonChai = require('sinon-chai');
const Mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai');
chai.should();
chai.use(sinonChai);

describe('Contract (TypeScript)', () => {
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
                'fabric-contract-api': '^2.2.0',
                'fabric-shim': '^2.2.0'
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
        assert.fileContent('src/my-private-conga-contract.ts', /public async verifyMyPrivateConga\(ctx: Context, myPrivateCongaId: string, objectToVerify: MyPrivateConga\): Promise<boolean> {/);
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
