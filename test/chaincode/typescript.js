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
        packageJSON.should.deep.equal({
            name: 'my-typescript-chaincode',
            version: '0.0.1',
            description: 'My TypeScript Chaincode',
            main: 'dist/index.js',
            typings: 'dist/index.d.ts',
            engines: {
                node: '>=8',
                npm: '>=5'
            },
            scripts: {
                lint: 'tslint -c tslint.json \'src/**/*.ts\'',
                pretest: 'npm run lint',
                test: 'nyc mocha -r ts-node/register src/**/*.spec.ts',
                start: 'node dist/start.js',
                build: 'tsc',
                'build:watch': 'tsc -w',
                prepublishOnly: 'npm run build'
            },
            engineStrict: true,
            author: 'James Conga',
            license: 'WTFPL',
            dependencies: {
                'fabric-shim': '1.4.0-snapshot.51'
            },
            devDependencies: {
                '@types/chai': '^4.1.7',
                '@types/mocha': '^5.2.5',
                '@types/node': '^10.12.10',
                '@types/sinon': '^5.0.7',
                '@types/sinon-chai': '^3.2.1',
                chai: '^4.2.0',
                mocha: '^5.2.0',
                nyc: '^13.1.0',
                sinon: '^7.1.1',
                'sinon-chai': '^3.3.0',
                'ts-node': '^7.0.1',
                tslint: '^5.11.0',
                typescript: '^3.1.6'
            },
            nyc: {
                extension: [
                    '.ts',
                    '.tsx'
                ],
                exclude: [
                    'coverage/**',
                    'dist/**'
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
            license: 'Apache-2.0'
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
            'package.json',
            'tsconfig.json',
            'tslint.json'
        ]);
        assert.fileContent('src/chaincode.ts', /export class Chaincode implements ChaincodeInterface {/);
        assert.fileContent('src/chaincode.ts', /public async Init\(stub: ChaincodeStub\): Promise<any> {/);
        assert.fileContent('src/chaincode.ts', /public async Invoke\(stub: ChaincodeStub\): Promise<any> {/);
        assert.fileContent('src/start.ts', /Shim\.start\(new Chaincode\(\)\);/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal({
            name: 'my-typescript-chaincode',
            version: '0.0.1',
            description: 'My TypeScript Chaincode',
            main: 'dist/index.js',
            typings: 'dist/index.d.ts',
            engines: {
                node: '>=8',
                npm: '>=5'
            },
            scripts: {
                lint: 'tslint -c tslint.json \'src/**/*.ts\'',
                pretest: 'npm run lint',
                test: 'nyc mocha -r ts-node/register src/**/*.spec.ts',
                start: 'node dist/start.js',
                build: 'tsc',
                'build:watch': 'tsc -w',
                prepublishOnly: 'npm run build'
            },
            engineStrict: true,
            author: 'James Conga',
            license: 'Apache-2.0',
            dependencies: {
                'fabric-shim': '1.4.0-snapshot.51'
            },
            devDependencies: {
                '@types/chai': '^4.1.7',
                '@types/mocha': '^5.2.5',
                '@types/node': '^10.12.10',
                '@types/sinon': '^5.0.7',
                '@types/sinon-chai': '^3.2.1',
                chai: '^4.2.0',
                mocha: '^5.2.0',
                nyc: '^13.1.0',
                sinon: '^7.1.1',
                'sinon-chai': '^3.3.0',
                'ts-node': '^7.0.1',
                tslint: '^5.11.0',
                typescript: '^3.1.6'
            },
            nyc: {
                extension: [
                    '.ts',
                    '.tsx'
                ],
                exclude: [
                    'coverage/**',
                    'dist/**'
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
        });

        installStub.should.have.been.called;


    });

});
