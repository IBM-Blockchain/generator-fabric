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

    let genericPackage = {
        name: 'my-javascript-contract',
        version: '0.0.1',
        description: 'My JavaScript Contract',
        main: 'index.js',
        engines: {
            node: '>=8',
            npm: '>=5'
        },
        scripts: {
            lint: 'eslint .',
            pretest: 'npm run lint',
            test: 'nyc mocha --recursive',
            start: 'fabric-chaincode-node start'
        },
        engineStrict: true,
        author: 'James Conga',
        license: 'WTFPL',
        dependencies: {
            'fabric-contract-api': '^1.4.5',
            'fabric-shim': '^1.4.5'
        },
        devDependencies: {
            chai: '^4.2.0',
            'chai-as-promised': '^7.1.1',
            eslint: '^6.3.0',
            mocha: '^6.2.0',
            nyc: '^14.1.1',
            sinon: '^7.4.1',
            'sinon-chai': '^3.3.0',
            winston: '^3.2.1'
        },
        nyc: {
            exclude: [
                '.eslintrc.js',
                'coverage/**',
                'test/**'
            ],
            reporter: [
                'text-summary',
                'html'
            ],
            all: true,
            'check-coverage': true,
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100
        }
    };

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
            '.vscode/launch.json',
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
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "congaExists",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "createConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "readConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "updateConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "deleteConga",/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);
    });

    it('should generate a JavaScript project given options', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/contract'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions({contractType: 'default',
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
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "congaExists",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "createConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "readConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "updateConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "deleteConga",/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);
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
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "congaExists",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "createConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "readConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "updateConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "deleteConga",/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);

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
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "congaExists",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "createConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "readConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "updateConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "deleteConga",/);
        const packageJSON = require(path.join(tmpdir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);
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
