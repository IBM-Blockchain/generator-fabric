/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const sinon = require('sinon');

require('chai').should();

describe('Contract (TypeScript)', () => {
    let dir;

    const sandbox = sinon.createSandbox();
    afterEach(() => {
        sandbox.restore();
    });

    it('should generate a TypeScript project using prompts (custom asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'default',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            });
        assert.file([
            '.vscode/extensions.json',
            'src/conga.ts',
            'src/conga-contract.spec.ts',
            'src/conga-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json',
            'transaction_data/conga-transactions.txdata'
        ]);
        assert.fileContent('src/conga.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/conga.ts', /export class Conga {/);
        assert.fileContent('src/conga-contract.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/conga-contract.ts', /export class CongaContract extends Contract {/);
        assert.fileContent('src/conga-contract.ts', /public async congaExists\(ctx: Context, congaId: string\): Promise<boolean> {/);
        assert.fileContent('src/conga-contract.ts', /public async createConga\(ctx: Context, congaId: string, value: string\): Promise<void> {/);
        assert.fileContent('src/conga-contract.ts', /public async readConga\(ctx: Context, congaId: string\): Promise<Conga> {/);
        assert.fileContent('src/conga-contract.ts', /public async updateConga\(ctx: Context, congaId: string, newValue: string\): Promise<void> {/);
        assert.fileContent('src/conga-contract.ts', /public async deleteConga\(ctx: Context, congaId: string\): Promise<void> {/);
        assert.JSONFileContent('transaction_data/conga-transactions.txdata', [
            {
                transactionName: 'congaExists',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'createConga',
                arguments: ['001', 'some value'],
                transientData: {}
            },
            {
                transactionName: 'readConga',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'updateConga',
                arguments: ['001', 'some other value'],
                transientData: {}
            },
            {
                transactionName: 'deleteConga',
                arguments: ['001'],
                transientData: {}
            }
        ]);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-typescript-contract',
            version: '0.0.1',
            description: 'My TypeScript Contract',
            author: 'James Conga',
            license: 'WTFPL'
        });
        packageJSON.should.containSubset({
            dependencies: {
                'fabric-contract-api': '^2.4.1',
                'fabric-shim': '^2.4.1'
            }
        });
        const tsconfigJSON = require(path.join(dir, 'tsconfig.json'));
        tsconfigJSON.should.deep.equal({
            compilerOptions: {
                outDir: 'dist',
                target: 'es2017',
                moduleResolution: 'node',
                module: 'commonjs',
                declaration: true,
                sourceMap: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true
            },
            include: [
                './src/**/*'
            ],
            exclude: [
                './src/**/*.spec.ts'
            ]
        });
    });

    it('should generate a TypeScript project using prompts (default asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'default',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'MyAsset'
            });
        assert.file([
            '.vscode/extensions.json',
            'src/my-asset.ts',
            'src/my-asset-contract.spec.ts',
            'src/my-asset-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json',
            'transaction_data/my-asset-transactions.txdata'
        ]);
        assert.fileContent('src/my-asset.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/my-asset.ts', /export class MyAsset {/);
        assert.fileContent('src/my-asset-contract.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/my-asset-contract.ts', /export class MyAssetContract extends Contract {/);
        assert.fileContent('src/my-asset-contract.ts', /public async myAssetExists\(ctx: Context, myAssetId: string\): Promise<boolean> {/);
        assert.fileContent('src/my-asset-contract.ts', /public async createMyAsset\(ctx: Context, myAssetId: string, value: string\): Promise<void> {/);
        assert.fileContent('src/my-asset-contract.ts', /public async readMyAsset\(ctx: Context, myAssetId: string\): Promise<MyAsset> {/);
        assert.fileContent('src/my-asset-contract.ts', /public async updateMyAsset\(ctx: Context, myAssetId: string, newValue: string\): Promise<void> {/);
        assert.fileContent('src/my-asset-contract.ts', /public async deleteMyAsset\(ctx: Context, myAssetId: string\): Promise<void> {/);
        assert.JSONFileContent('transaction_data/my-asset-transactions.txdata', [
            {
                transactionName: 'myAssetExists',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'createMyAsset',
                arguments: ['001', 'some value'],
                transientData: {}
            },
            {
                transactionName: 'readMyAsset',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'updateMyAsset',
                arguments: ['001', 'some other value'],
                transientData: {}
            },
            {
                transactionName: 'deleteMyAsset',
                arguments: ['001'],
                transientData: {}
            }
        ]);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-typescript-contract',
            version: '0.0.1',
            description: 'My TypeScript Contract',
            author: 'James Conga',
            license: 'WTFPL'
        });
        packageJSON.should.containSubset({
            dependencies: {
                'fabric-contract-api': '^2.4.1',
                'fabric-shim': '^2.4.1'
            }
        });
        const tsconfigJSON = require(path.join(dir, 'tsconfig.json'));
        tsconfigJSON.should.deep.equal({
            compilerOptions: {
                outDir: 'dist',
                target: 'es2017',
                moduleResolution: 'node',
                module: 'commonjs',
                declaration: true,
                sourceMap: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true
            },
            include: [
                './src/**/*'
            ],
            exclude: [
                './src/**/*.spec.ts'
            ]
        });
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
