/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');

require('chai').should();

describe('Contract (TypeScript)', () => {

    it('should generate a TypeScript project using prompts', async () => {
        let dir;
        await helpers.run(path.join(__dirname, '../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'Apache-2.0'
            });
        assert.file([
            'src/my-contract.spec.ts',
            'src/my-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            'package.json',
            'tsconfig.json',
            'tslint.json'
        ]);
        assert.fileContent('src/my-contract.ts', /export class MyContract extends Contract {/);
        assert.fileContent('src/my-contract.ts', /public async instantiate\(ctx: Context\): Promise<any> {/);
        assert.fileContent('src/my-contract.ts', /public async transaction1\(ctx: Context, arg1: string\): Promise<any> {/);
        assert.fileContent('src/my-contract.ts', /public async transaction2\(ctx: Context, arg1: string, arg2: string\): Promise<any> {/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal({
            name: 'my-typescript-contract',
            version: '0.0.1',
            description: 'My TypeScript Contract',
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
                start: 'fabric-chaincode-node start',
                build: 'tsc',
                'build:watch': 'tsc -w',
                prepublishOnly: 'npm run build'
            },
            engineStrict: true,
            author: 'James Conga',
            license: 'Apache-2.0',
            dependencies: {
                'fabric-shim': '1.4.0-snapshot.27',
                'fabric-contract-api': '1.4.0-snapshot.17'
            },
            devDependencies: {
                '@types/chai': '^4.1.4',
                '@types/mocha': '^5.2.3',
                '@types/node': '^10.3.6',
                '@types/sinon': '^5.0.1',
                '@types/sinon-chai': '^3.2.0',
                chai: '^4.1.2',
                mocha: '^5.2.0',
                nyc: '^12.0.2',
                sinon: '^6.0.0',
                'sinon-chai': '^3.2.0',
                'ts-node': '^7.0.0',
                tslint: '^5.10.0',
                typescript: '^2.9.2'
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
    });

});
