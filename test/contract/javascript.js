/*
 * SPDX-License-Identifier: WTFPL
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const generator = require(path.join(__dirname, '../../generators/contract/index'));
const os = require('os');
const crypto = require('crypto');
const chai = require('chai');
chai.should();
chai.use(sinonChai);

describe('Contract (JavaScript)', () => {

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
            'fabric-contract-api': '1.4.0',
            'fabric-shim': '1.4.0'
        },
        devDependencies: {
            chai: '^4.2.0',
            eslint: '^5.9.0',
            mocha: '^5.2.0',
            nyc: '^13.1.0',
            sinon: '^7.1.1',
            'sinon-chai': '^3.3.0'
        },
        nyc: {
            exclude: [
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
        let dir;
        await helpers.run(path.join(__dirname, '../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'lib/my-contract.js',
            'test/my-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json'
        ]);
        assert.fileContent('lib/my-contract.js', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('lib/my-contract.js', /class MyContract extends Contract {/);
        assert.fileContent('lib/my-contract.js', /async instantiate\(ctx\) {/);
        assert.fileContent('lib/my-contract.js', /async transaction1\(ctx, arg1\) {/);
        assert.fileContent('lib/my-contract.js', /async transaction2\(ctx, arg1, arg2\) {/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);
    });

    it('should generate a JavaScript project given options', async () => {
        let dir;
        await helpers.run(path.join(__dirname, '../../generators/contract'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions({language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL'
            });
        assert.file([
            'lib/my-contract.js',
            'test/my-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json'
        ]);
        assert.fileContent('lib/my-contract.js', /class MyContract extends Contract {/);
        assert.fileContent('lib/my-contract.js', /async instantiate\(ctx\) {/);
        assert.fileContent('lib/my-contract.js', /async transaction1\(ctx, arg1\) {/);
        assert.fileContent('lib/my-contract.js', /async transaction2\(ctx, arg1, arg2\) {/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);
    });

    it('should detect if no skip-install option is passed', async () => {
        let dir;

        let installStub = sinon.stub(generator.prototype,'installDependencies');

        let options = {
            language: 'javascript',
            name: 'my-javascript-contract',
            version: '0.0.1',
            description: 'My JavaScript Contract',
            author: 'James Conga',
            license: 'WTFPL',
            dependencies: {
                'fabric-contract-api': '1.4.0',
                'fabric-shim': '1.4.0'
            },
            devDependencies: {
                chai: '^4.2.0',
                eslint: '^5.9.0',
                mocha: '^5.2.0',
                nyc: '^13.1.0',
                sinon: '^7.1.1',
                'sinon-chai': '^3.3.0'
            },
            nyc: {
                exclude: [
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

        options['skip-install'] = false;

        await helpers.run(path.join(__dirname, '../../generators/contract'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions(options);
        assert.file([
            'lib/my-contract.js',
            'test/my-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json'
        ]);

        assert.fileContent('lib/my-contract.js', /class MyContract extends Contract {/);
        assert.fileContent('lib/my-contract.js', /async instantiate\(ctx\) {/);
        assert.fileContent('lib/my-contract.js', /async transaction1\(ctx, arg1\) {/);
        assert.fileContent('lib/my-contract.js', /async transaction2\(ctx, arg1, arg2\) {/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);

        installStub.should.have.been.called;

    });

    it('should detect if given a destination option', async () => {
        let tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));


        await helpers.run(path.join(__dirname, '../../generators/contract'))
            .withOptions({
                language: 'javascript',
                name: 'my-javascript-contract',
                version: '0.0.1',
                description: 'My JavaScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                destination: tmpdir
            });

        process.chdir(tmpdir);


        assert.file([
            'lib/my-contract.js',
            'test/my-contract.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json'
        ]);
        assert.fileContent('lib/my-contract.js', /class MyContract extends Contract {/);
        assert.fileContent('lib/my-contract.js', /async instantiate\(ctx\) {/);
        assert.fileContent('lib/my-contract.js', /async transaction1\(ctx, arg1\) {/);
        assert.fileContent('lib/my-contract.js', /async transaction2\(ctx, arg1, arg2\) {/);
        const packageJSON = require(path.join(tmpdir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);
    });
});
