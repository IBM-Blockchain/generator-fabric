/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const generator = require(path.join(__dirname, '../../generators/chaincode/index'));

chai.should();
chai.use(sinonChai);

describe('Chaincode (TypeScript)', () => {

    let mySandBox;

    beforeEach(() => {
        mySandBox = sinon.createSandbox();
    });

    afterEach(() => {
        mySandBox.restore();
    });

    it('should generate a TypeScript project using prompts', async () => {
        let dir;
        await helpers.run(path.join(__dirname, '../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'chaincode',
                language: 'typescript',
                name: 'my-typescript-chaincode',
                version: '0.0.1',
                description: 'My TypeScript Chaincode',
                author: 'James Conga',
                license: 'WTFPL'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'src/chaincode.spec.ts',
            'src/chaincode.ts',
            'src/index.ts',
            'src/start.spec.ts',
            'src/start.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json'
        ]);
        assert.fileContent('src/chaincode.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/chaincode.ts', /export class Chaincode implements ChaincodeInterface {/);
        assert.fileContent('src/chaincode.ts', /public async Init\(stub: ChaincodeStub\): Promise<any> {/);
        assert.fileContent('src/chaincode.ts', /public async Invoke\(stub: ChaincodeStub\): Promise<any> {/);
        assert.fileContent('src/start.ts', /Shim\.start\(new Chaincode\(\)\);/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-typescript-chaincode',
            version: '0.0.1',
            description: 'My TypeScript Chaincode',
            author: 'James Conga',
            license: 'WTFPL'
        });
        const tsconfigJSON = require(path.join(dir, 'tsconfig.json'));
        tsconfigJSON.should.deep.equal({
            compilerOptions: {
                outDir: 'dist',
                target: 'es2017',
                moduleResolution: 'node',
                module: 'commonjs',
                declaration: true,
                sourceMap: true
            },
            include: [
                './src/**/*'
            ],
            exclude: [
                './src/**/*.spec.ts'
            ]
        });
    });

    it('should detect if no skip-install option is passed with typescript language', async () => {
        let dir;

        let installStub = mySandBox.stub(generator.prototype,'installDependencies');

        let options = {
            subgenerator: 'chaincode',
            language: 'typescript',
            name: 'my-typescript-chaincode',
            version: '0.0.1',
            description: 'My TypeScript Chaincode',
            author: 'James Conga',
            license: 'WTFPL'
        };

        options['skip-install'] = false;

        await helpers.run(path.join(__dirname, '../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions(options);

        assert.file([
            'src/chaincode.spec.ts',
            'src/chaincode.ts',
            'src/index.ts',
            'src/start.spec.ts',
            'src/start.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json'
        ]);
        assert.fileContent('src/chaincode.ts', /export class Chaincode implements ChaincodeInterface {/);
        assert.fileContent('src/chaincode.ts', /public async Init\(stub: ChaincodeStub\): Promise<any> {/);
        assert.fileContent('src/chaincode.ts', /public async Invoke\(stub: ChaincodeStub\): Promise<any> {/);
        assert.fileContent('src/start.ts', /Shim\.start\(new Chaincode\(\)\);/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.containSubset({
            name: 'my-typescript-chaincode',
            version: '0.0.1',
            description: 'My TypeScript Chaincode',
            author: 'James Conga',
            license: 'WTFPL'
        });

        installStub.should.have.been.called;


    });

});
