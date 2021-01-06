/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const os = require('os');

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

describe('Contract (Go)', () => {
    it ('should generate a Go project using prompts (custom asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir()
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'default',
                language: 'go',
                name: 'AndysGoContract',
                version: '0.0.1',
                description: 'Andys Go Contract',
                author: 'Andy Conga',
                license: 'Beerware',
                asset: 'conga'
            });

        assert.file([
            '.vscode/extensions.json',
            'go.mod',
            'go.sum',
            'main.go',
            'conga-contract.go',
            'conga-contract_test.go',
            'conga.go'
        ]);



        assert.fileContent('main.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('main.go', /package main/);
        assert.fileContent('main.go', /congaContract := new\(CongaContract\)/);
        assert.fileContent('main.go', /contractapi.NewChaincode\(congaContract\)/);
        assert.fileContent('main.go', /Version = "0.0.1"/);
        assert.fileContent('main.go', /Description = "Andys Go Contract"/);
        assert.fileContent('main.go', /License.Name = "Beerware"/);
        assert.fileContent('main.go', /Contact.Name = "Andy Conga"/);
        assert.fileContent('main.go', /Title = "AndysGoContract chaincode"/);

        assert.fileContent('conga.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('conga.go', /package main/);
        assert.fileContent('conga.go', new RegExp(`type Conga struct {${os.EOL}\tValue string \`json:"value"\`${os.EOL}}`));

        assert.fileContent('conga-contract.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('conga-contract.go', /package main/);
        assert.fileContent('conga-contract.go', new RegExp(`type CongaContract struct {${os.EOL}\tcontractapi.Contract${os.EOL}}`));
        assert.fileContent('conga-contract.go', /func \(c \*CongaContract\) CongaExists\(ctx contractapi.TransactionContextInterface, congaID string\) \(bool, error\)/);
        assert.fileContent('conga-contract.go', /func \(c \*CongaContract\) CreateConga\(ctx contractapi.TransactionContextInterface, congaID string, value string\) error/);
        assert.fileContent('conga-contract.go', /func \(c \*CongaContract\) ReadConga\(ctx contractapi.TransactionContextInterface, congaID string\) \(\*Conga, error\)/);
        assert.fileContent('conga-contract.go', /func \(c \*CongaContract\) UpdateConga\(ctx contractapi.TransactionContextInterface, congaID string, newValue string\) error/);
        assert.fileContent('conga-contract.go', /func \(c \*CongaContract\) DeleteConga\(ctx contractapi.TransactionContextInterface, congaID string\) error/);
    });

    it ('should generate a Go project using prompts (default asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir()
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'default',
                language: 'go',
                name: 'AndysGoContract',
                version: '0.0.1',
                description: 'Andys Go Contract',
                author: 'Andy Conga',
                license: 'Beerware',
                asset: 'MyAsset'
            });

        assert.file([
            '.vscode/extensions.json',
            'go.mod',
            'go.sum',
            'main.go',
            'my-asset-contract.go',
            'my-asset-contract_test.go',
            'my-asset.go'
        ]);



        assert.fileContent('main.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('main.go', /package main/);
        assert.fileContent('main.go', /myAssetContract := new\(MyAssetContract\)/);
        assert.fileContent('main.go', /contractapi.NewChaincode\(myAssetContract\)/);
        assert.fileContent('main.go', /Version = "0.0.1"/);
        assert.fileContent('main.go', /Description = "Andys Go Contract"/);
        assert.fileContent('main.go', /License.Name = "Beerware"/);
        assert.fileContent('main.go', /Contact.Name = "Andy Conga"/);
        assert.fileContent('main.go', /Title = "AndysGoContract chaincode"/);

        assert.fileContent('my-asset.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('my-asset.go', /package main/);
        assert.fileContent('my-asset.go', new RegExp(`type MyAsset struct {${os.EOL}\tValue string \`json:"value"\`${os.EOL}}`));

        assert.fileContent('my-asset-contract.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('my-asset-contract.go', /package main/);
        assert.fileContent('my-asset-contract.go', new RegExp(`type MyAssetContract struct {${os.EOL}\tcontractapi.Contract${os.EOL}}`));
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) MyAssetExists\(ctx contractapi.TransactionContextInterface, myAssetID string\) \(bool, error\)/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) CreateMyAsset\(ctx contractapi.TransactionContextInterface, myAssetID string, value string\) error/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) ReadMyAsset\(ctx contractapi.TransactionContextInterface, myAssetID string\) \(\*MyAsset, error\)/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) UpdateMyAsset\(ctx contractapi.TransactionContextInterface, myAssetID string, newValue string\) error/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) DeleteMyAsset\(ctx contractapi.TransactionContextInterface, myAssetID string\) error/);
    });
});
