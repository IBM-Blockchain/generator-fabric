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

describe('Chaincode (TypeScript)', () => {

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
                license: 'Apache-2.0'
            });
        assert.file([
            'src/chaincode.spec.ts',
            'src/chaincode.ts',
            'src/index.ts',
            'src/start.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json'
        ]);
        assert.fileContent('src/chaincode.ts', /export class Chaincode implements ChaincodeInterface {/);
        assert.fileContent('src/chaincode.ts', /public async Init\(stub: Stub\): Promise<any> {/);
        assert.fileContent('src/chaincode.ts', /public async Invoke\(stub: Stub\): Promise<any> {/);
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
                test: 'mocha -r ts-node/register src/**/*.spec.ts',
                start: 'node dist/start.js',
                build: 'tsc',
                'build:watch': 'tsc -w',
                prepublishOnly: 'npm run build'
            },
            engineStrict: true,
            author: 'James Conga',
            license: 'Apache-2.0',
            dependencies: {
                'fabric-shim': '^1.1.2'
            },
            devDependencies: {
                '@types/chai': '^4.1.4',
                '@types/mocha': '^5.2.3',
                '@types/node': '^10.3.6',
                '@types/sinon': '^5.0.1',
                chai: '^4.1.2',
                mocha: '^5.2.0',
                sinon: '^6.0.0',
                'ts-node': '^7.0.0',
                tslint: '^5.10.0',
                typescript: '^2.9.2'
            }
        });
    });

});
