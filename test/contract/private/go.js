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

describe('Contract (Go, private)', () => {
    let dir;

    it('should generate a Go project using prompts (custom asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'go',
                name: 'AndysGoContract',
                version: '0.0.1',
                description: 'Andys Go Contract',
                author: 'Andy Conga',
                license: 'Beerware',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });

        assert.file([
            '.vscode/extensions.json',
            'go.mod',
            'go.sum',
            'main.go',
            'my-private-conga-contract.go',
            'my-private-conga-contract_test.go',
            'my-private-conga.go',
            'transaction_data/my-private-conga-transactions.txdata'
        ]);



        assert.fileContent('main.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('main.go', /package main/);
        assert.fileContent('main.go', /myPrivateCongaContract := new\(MyPrivateCongaContract\)/);
        assert.fileContent('main.go', /contractapi.NewChaincode\(myPrivateCongaContract\)/);
        assert.fileContent('main.go', /Version = "0.0.1"/);
        assert.fileContent('main.go', /Description = "Andys Go Contract"/);
        assert.fileContent('main.go', /License.Name = "Beerware"/);
        assert.fileContent('main.go', /Contact.Name = "Andy Conga"/);
        assert.fileContent('main.go', /Title = "AndysGoContract chaincode"/);

        assert.fileContent('my-private-conga.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('my-private-conga.go', /package main/);
        assert.fileContent('my-private-conga.go', new RegExp(`type MyPrivateConga struct {${os.EOL}\tPrivateValue string \`json:"privateValue"\`${os.EOL}}`));

        assert.fileContent('my-private-conga-contract.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('my-private-conga-contract.go', /package main/);
        assert.fileContent('my-private-conga-contract.go', new RegExp(`type MyPrivateCongaContract struct {${os.EOL}\tcontractapi.Contract${os.EOL}}`));
        assert.fileContent('my-private-conga-contract.go', /func \(c \*MyPrivateCongaContract\) MyPrivateCongaExists\(ctx contractapi.TransactionContextInterface, myPrivateCongaID string\) \(bool, error\)/);
        assert.fileContent('my-private-conga-contract.go', /func \(c \*MyPrivateCongaContract\) CreateMyPrivateConga\(ctx contractapi.TransactionContextInterface, myPrivateCongaID string\) error/);
        assert.fileContent('my-private-conga-contract.go', /func \(c \*MyPrivateCongaContract\) ReadMyPrivateConga\(ctx contractapi.TransactionContextInterface, myPrivateCongaID string\) \(\*MyPrivateConga, error\)/);
        assert.fileContent('my-private-conga-contract.go', /func \(c \*MyPrivateCongaContract\) UpdateMyPrivateConga\(ctx contractapi.TransactionContextInterface, myPrivateCongaID string\) error/);
        assert.fileContent('my-private-conga-contract.go', /func \(c \*MyPrivateCongaContract\) DeleteMyPrivateConga\(ctx contractapi.TransactionContextInterface, myPrivateCongaID string\) error/);
        assert.fileContent('my-private-conga-contract.go', /func \(c \*MyPrivateCongaContract\) DeleteMyPrivateConga\(ctx contractapi.TransactionContextInterface, myPrivateCongaID string\) error/);
        assert.fileContent('my-private-conga-contract.go', /func \(c \*MyPrivateCongaContract\) VerifyMyPrivateConga\(ctx contractapi.TransactionContextInterface, mspid string, myPrivateCongaID string, objectToVerify \*MyPrivateConga\) \(bool, error\)/);

        assert.JSONFileContent('transaction_data/my-private-conga-transactions.txdata', [
            {
                transactionName: 'MyPrivateCongaExists',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'CreateMyPrivateConga',
                arguments: ['001'],
                transientData: {
                    privateValue: 'some value'
                }
            },
            {
                transactionName: 'ReadMyPrivateConga',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'UpdateMyPrivateConga',
                arguments: ['001'],
                transientData: {
                    privateValue: 'some other value'
                }
            },
            {
                transactionName: 'DeleteMyPrivateConga',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'VerifyMyPrivateConga',
                arguments: ['Org1MSP', '001', {privateValue: 'some other value'}]
            }
        ]);

        const pdcJSON = require(path.join(dir, 'collections.json'));
        console.log('pdc variable' + pdcJSON);
        pdcJSON.should.deep.equal([]);
    });

    it ('should generate a Go project using prompts (default asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir()
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'go',
                name: 'AndysGoContract',
                version: '0.0.1',
                description: 'Andys Go Contract',
                author: 'Andy Conga',
                license: 'Beerware',
                asset: 'MyAsset',
            });

        assert.file([
            '.vscode/extensions.json',
            'go.mod',
            'go.sum',
            'main.go',
            'my-asset-contract.go',
            'my-asset-contract_test.go',
            'my-asset.go',
            'transaction_data/my-asset-transactions.txdata'
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
        assert.fileContent('my-asset.go', new RegExp(`type MyAsset struct {${os.EOL}\tPrivateValue string \`json:"privateValue"\`${os.EOL}}`));

        assert.fileContent('my-asset-contract.go', /SPDX-License-Identifier: Beerware/);
        assert.fileContent('my-asset-contract.go', /package main/);
        assert.fileContent('my-asset-contract.go', new RegExp(`type MyAssetContract struct {${os.EOL}\tcontractapi.Contract${os.EOL}}`));
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) MyAssetExists\(ctx contractapi.TransactionContextInterface, myAssetID string\) \(bool, error\)/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) CreateMyAsset\(ctx contractapi.TransactionContextInterface, myAssetID string\) error/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) ReadMyAsset\(ctx contractapi.TransactionContextInterface, myAssetID string\) \(\*MyAsset, error\)/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) UpdateMyAsset\(ctx contractapi.TransactionContextInterface, myAssetID string\) error/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) DeleteMyAsset\(ctx contractapi.TransactionContextInterface, myAssetID string\) error/);
        assert.fileContent('my-asset-contract.go', /func \(c \*MyAssetContract\) VerifyMyAsset\(ctx contractapi.TransactionContextInterface, mspid string, myAssetID string, objectToVerify \*MyAsset\) \(bool, error\)/);

        assert.JSONFileContent('transaction_data/my-asset-transactions.txdata', [
            {
                transactionName: 'MyAssetExists',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'CreateMyAsset',
                arguments: ['001'],
                transientData: {
                    privateValue: 'some value'
                }
            },
            {
                transactionName: 'ReadMyAsset',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'UpdateMyAsset',
                arguments: ['001'],
                transientData: {
                    privateValue: 'some other value'
                }
            },
            {
                transactionName: 'DeleteMyAsset',
                arguments: ['001'],
                transientData: {}
            },
            {
                transactionName: 'VerifyMyAsset',
                arguments: ['Org1MSP', '001', {privateValue: 'some other value'}]
            }
        ]);
    });
});
