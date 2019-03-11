/*
 * SPDX-License-Identifier: Apache-2.0
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
                license: 'WTFPL'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            '.editorconfig',
            '.gitignore',
            'chaincode_test.go',
            'chaincode.go',
            'main.go'
        ]);
        assert.fileContent('chaincode.go', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('chaincode.go', /func \(cc \*Chaincode\) Init\(stub shim\.ChaincodeStubInterface\) sc\.Response {/);
        assert.fileContent('chaincode.go', /func \(cc \*Chaincode\) Invoke\(stub shim\.ChaincodeStubInterface\) sc\.Response {/);
        assert.fileContent('main.go', /err := shim\.Start\(new\(Chaincode\)\)/);
    });

});
