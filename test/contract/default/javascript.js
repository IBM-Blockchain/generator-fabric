/*
 * SPDX-License-Identifier: WTFPL
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const generator = require(path.join(__dirname, '../../../generators/contract/index'));
const os = require('os');
const crypto = require('crypto');
const chai = require('chai');
chai.should();
chai.use(sinonChai);

describe('Contract (JavaScript)', () => {
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
                contractType: 'default',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            });
        assert.file([
            '.vscode/extensions.json',
            'lib/conga-contract.js',
            'test/conga-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json',
            'transaction_data/conga-transactions.txdata'
        ]);
        assert.fileContent('lib/conga-contract.js', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('lib/conga-contract.js', /class CongaContract extends Contract {/);
        assert.fileContent('lib/conga-contract.js', /async congaExists\(ctx, congaId\) {/);
        assert.fileContent('lib/conga-contract.js', /async createConga\(ctx, congaId, value\) {/);
        assert.fileContent('lib/conga-contract.js', /async readConga\(ctx, congaId\) {/);
        assert.fileContent('lib/conga-contract.js', /async updateConga\(ctx, congaId, newValue\) {/);
        assert.fileContent('lib/conga-contract.js', /async deleteConga\(ctx, congaId\) {/);
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
            name: 'my-javascript-contract',
            version: '0.0.1',
            description: 'My JavaScript Contract',
            author: 'James Conga',
            license: 'WTFPL'
        });
        packageJSON.should.containSubset({
            dependencies: {
                'fabric-contract-api': '^2.2.0',
                'fabric-shim': '^2.2.0'
            }
        });
    });

    it('should generate a JavaScript project given options', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/contract'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions({
                contractType: 'default',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            });
        assert.file([
            'lib/conga-contract.js',
            'test/conga-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json',
            'transaction_data/conga-transactions.txdata'
        ]);
        assert.fileContent('lib/conga-contract.js', /class CongaContract extends Contract {/);
        assert.fileContent('lib/conga-contract.js', /async congaExists\(ctx, congaId\) {/);
        assert.fileContent('lib/conga-contract.js', /async createConga\(ctx, congaId, value\) {/);
        assert.fileContent('lib/conga-contract.js', /async readConga\(ctx, congaId\) {/);
        assert.fileContent('lib/conga-contract.js', /async updateConga\(ctx, congaId, newValue\) {/);
        assert.fileContent('lib/conga-contract.js', /async deleteConga\(ctx, congaId\) {/);
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
            name: 'my-javascript-contract',
            version: '0.0.1',
            description: 'My JavaScript Contract',
            author: 'James Conga',
            license: 'WTFPL'
        });
        packageJSON.should.containSubset({
            dependencies: {
                'fabric-contract-api': '^2.2.0',
                'fabric-shim': '^2.2.0'
            }
        });
    });

    it('should detect if no skip-install option is passed', async () => {
        let installStub = sinon.stub(generator.prototype,'installDependencies');

        let options = {
            contractType: 'default',
            language: 'javascript',
            name: 'my-javascript-contract',
            version: '0.0.1',
            description: 'My JavaScript Contract',
            author: 'James Conga',
            license: 'WTFPL',
            asset: 'conga'
        };

        options['skip-install'] = false;

        await helpers.run(path.join(__dirname, '../../../generators/contract'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions(options);
        assert.file([
            'lib/conga-contract.js',
            'test/conga-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json',
            'transaction_data/conga-transactions.txdata'
        ]);

        assert.fileContent('lib/conga-contract.js', /class CongaContract extends Contract {/);
        assert.fileContent('lib/conga-contract.js', /async congaExists\(ctx, congaId\) {/);
        assert.fileContent('lib/conga-contract.js', /async createConga\(ctx, congaId, value\) {/);
        assert.fileContent('lib/conga-contract.js', /async readConga\(ctx, congaId\) {/);
        assert.fileContent('lib/conga-contract.js', /async updateConga\(ctx, congaId, newValue\) {/);
        assert.fileContent('lib/conga-contract.js', /async deleteConga\(ctx, congaId\) {/);
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
            name: 'my-javascript-contract',
            version: '0.0.1',
            description: 'My JavaScript Contract',
            author: 'James Conga',
            license: 'WTFPL'
        });

        installStub.should.have.been.called;

    });

    it('should detect if given a destination option', async () => {
        let tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));

        await helpers.run(path.join(__dirname, '../../../generators/contract'))
            .withOptions({
                contractType: 'default',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                destination: tmpdir,
                asset: 'conga'
            });

        process.chdir(tmpdir);


        assert.file([
            'lib/conga-contract.js',
            'test/conga-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json',
            'transaction_data/conga-transactions.txdata'
        ]);
        assert.fileContent('lib/conga-contract.js', /class CongaContract extends Contract {/);
        assert.fileContent('lib/conga-contract.js', /async congaExists\(ctx, congaId\) {/);
        assert.fileContent('lib/conga-contract.js', /async createConga\(ctx, congaId, value\) {/);
        assert.fileContent('lib/conga-contract.js', /async readConga\(ctx, congaId\) {/);
        assert.fileContent('lib/conga-contract.js', /async updateConga\(ctx, congaId, newValue\) {/);
        assert.fileContent('lib/conga-contract.js', /async deleteConga\(ctx, congaId\) {/);
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
        const packageJSON = require(path.join(tmpdir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-javascript-contract',
            version: '0.0.1',
            description: 'My JavaScript Contract',
            author: 'James Conga',
            license: 'WTFPL'
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
