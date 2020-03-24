/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const generator = require(path.join(__dirname, '../../generators/chaincode/index'));

chai.should();
chai.use(sinonChai);
chai.use(require('chai-subset'));

describe('Chaincode (JavaScript)', () => {

    let mySandBox;

    beforeEach(() => {
        mySandBox = sinon.createSandbox();
    });

    afterEach(() => {
        mySandBox.restore();
    });

    it('should generate a JavaScript project using prompts', async () => {
        let dir;
        await helpers.run(path.join(__dirname, '../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'chaincode',
                language: 'javascript',
                name: 'my-javascript-chaincode',
                version: '0.0.1',
                description: 'My JavaScript Chaincode',
                author: 'James Conga',
                license: 'WTFPL'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'lib/chaincode.js',
            'lib/start.js',
            'test/chaincode.js',
            'test/start.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json'
        ]);
        assert.fileContent('lib/chaincode.js', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('lib/chaincode.js', /class Chaincode extends ChaincodeInterface {/);
        assert.fileContent('lib/chaincode.js', /async Init\(stub\) {/);
        assert.fileContent('lib/chaincode.js', /async Invoke\(stub\) {/);
        assert.fileContent('lib/start.js', /Shim\.start\(new Chaincode\(\)\);/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-javascript-chaincode',
            version: '0.0.1',
            description: 'My JavaScript Chaincode',
            author: 'James Conga',
            license: 'WTFPL'
        });
    });


    it('should detect if given a destination option', async () => {
        let tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));


        await helpers.run(path.join(__dirname, '../../generators/app'))
            .withOptions({
                subgenerator: 'chaincode',
                language: 'javascript',
                name: 'my-javascript-chaincode',
                version: '0.0.1',
                description: 'My JavaScript Chaincode',
                author: 'James Conga',
                license: 'Apache-2.0',
                destination: tmpdir
            });

        process.chdir(tmpdir);


        assert.file([
            'lib/chaincode.js',
            'lib/start.js',
            'test/chaincode.js',
            'test/start.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json'
        ]);
        assert.fileContent('lib/chaincode.js', /class Chaincode extends ChaincodeInterface {/);
        assert.fileContent('lib/chaincode.js', /async Init\(stub\) {/);
        assert.fileContent('lib/chaincode.js', /async Invoke\(stub\) {/);
        assert.fileContent('lib/start.js', /Shim\.start\(new Chaincode\(\)\);/);
        const packageJSON = require(path.join(tmpdir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-javascript-chaincode',
            version: '0.0.1',
            description: 'My JavaScript Chaincode',
            author: 'James Conga',
            license: 'Apache-2.0'
        });
    });

    it('should detect if no skip-install option is passed with javascript language', async () => {
        let dir;

        let installStub = mySandBox.stub(generator.prototype,'installDependencies');

        let options = {
            subgenerator: 'chaincode',
            language: 'javascript',
            name: 'my-javascript-chaincode',
            version: '0.0.1',
            description: 'My JavaScript Chaincode',
            author: 'James Conga',
            license: 'Apache-2.0'
        };

        options['skip-install'] = false;


        await helpers.run(path.join(__dirname, '../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions(options);
        assert.file([
            'lib/chaincode.js',
            'lib/start.js',
            'test/chaincode.js',
            'test/start.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json'
        ]);
        assert.fileContent('lib/chaincode.js', /class Chaincode extends ChaincodeInterface {/);
        assert.fileContent('lib/chaincode.js', /async Init\(stub\) {/);
        assert.fileContent('lib/chaincode.js', /async Invoke\(stub\) {/);
        assert.fileContent('lib/start.js', /Shim\.start\(new Chaincode\(\)\);/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-javascript-chaincode',
            version: '0.0.1',
            description: 'My JavaScript Chaincode',
            author: 'James Conga',
            license: 'Apache-2.0'
        });

        installStub.should.have.been.called;


    });

    it('should generate a JavaScript project using options', async () => {
        let dir;
        await helpers.run(path.join(__dirname, '../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions({
                subgenerator: 'chaincode',
                language: 'javascript',
                name: 'my-javascript-chaincode',
                version: '0.0.1',
                description: 'My JavaScript Chaincode',
                author: 'James Conga',
                license: 'Apache-2.0'
            });
        assert.file([
            'lib/chaincode.js',
            'lib/start.js',
            'test/chaincode.js',
            'test/start.js',
            '.editorconfig',
            '.eslintignore',
            '.eslintrc.js',
            '.gitignore',
            '.npmignore',
            'index.js',
            'package.json'
        ]);
        assert.fileContent('lib/chaincode.js', /class Chaincode extends ChaincodeInterface {/);
        assert.fileContent('lib/chaincode.js', /async Init\(stub\) {/);
        assert.fileContent('lib/chaincode.js', /async Invoke\(stub\) {/);
        assert.fileContent('lib/start.js', /Shim\.start\(new Chaincode\(\)\);/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-javascript-chaincode',
            version: '0.0.1',
            description: 'My JavaScript Chaincode',
            author: 'James Conga',
            license: 'Apache-2.0'
        });
    });


});
