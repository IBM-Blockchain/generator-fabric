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

describe('Chaincode (Go)', () => {

    it('should generate a Go project using prompts', async () => {
        await helpers.run(path.join(__dirname, '../../generators/app'))
            .withPrompts({
                subgenerator: 'chaincode',
                language: 'go',
                name: 'my-go-chaincode',
                version: '0.0.1',
                description: 'My Go Chaincode',
                author: 'James Conga',
                license: 'Apache-2.0'
            });
        assert.file([
            '.vscode/extensions.json',
            '.editorconfig',
            '.gitignore',
            'chaincode_test.go',
            'chaincode.go',
            'main.go'
        ]);
        assert.fileContent('chaincode.go', /func \(cc \*Chaincode\) Init\(stub shim\.ChaincodeStubInterface\) sc\.Response {/);
        assert.fileContent('chaincode.go', /func \(cc \*Chaincode\) Invoke\(stub shim\.ChaincodeStubInterface\) sc\.Response {/);
        assert.fileContent('main.go', /err := shim\.Start\(new\(Chaincode\)\)/);
    });

});
