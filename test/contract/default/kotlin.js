/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const g2js = require('gradle-to-js/lib/parser');
const fs = require('fs');
const Mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai');

chai.should();
chai.use(require('chai-as-promised'));

describe('Contract (Kotlin)', () => {
    let dir;

    const sandbox = sinon.createSandbox();
    afterEach(() => {
        sandbox.restore();
    });

    it('should not create a rockstar project',async () => {
        const errorStub = sandbox.stub(Mocha.Runner.prototype, 'uncaught');
        const promise = new Promise((resolve) => {
            errorStub.callsFake(resolve);
        });
        helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir(() => {
            }).withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v2',
                contractType: 'default',
                language: 'rockstar',
                name: 'JamesKotlinContract',
                version: '0.0.1',
                description: 'James Kotlin Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga',
            }).then();
        await promise;
        errorStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Error));
        const error = errorStub.args[0][0];
        error.message.should.match(/Sorry the language 'rockstar' is not recognized/);
    });

    it('should generate a v1 Kotlin project using prompts (custom asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v1',
                contractType: 'default',
                language: 'kotlin',
                name: 'JamesKotlinContract',
                version: '0.0.1',
                description: 'James Kotlin Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            });
        assert.file([
            'build.gradle',
            'gradle/wrapper/gradle-wrapper.jar',
            'gradle/wrapper/gradle-wrapper.properties',
            'gradlew',
            'gradlew.bat',
            'settings.gradle',
            '.fabricignore',
            '.gitignore',
            'src/main/kotlin/org/example/Conga.kt',
            'src/main/kotlin/org/example/CongaContract.kt',
            'src/test/kotlin/org/example/CongaContractTest.kt',
            'transaction_data/conga-transactions.txdata'

        ]);
        let contractFile = 'src/main/kotlin/org/example/CongaContract.kt';
        assert.fileContent('src/main/kotlin/org/example/Conga.kt', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/kotlin/org/example/Conga.kt', /class Conga\(@Property\(\) var value: String\?\) {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /class CongaContract : ContractInterface {/);
        assert.fileContent(contractFile, /fun congaExists\(ctx: Context, congaId: String\): Boolean {/);
        assert.fileContent(contractFile, /fun createConga\(ctx: Context, congaId: String, value: String\) {/);
        assert.fileContent(contractFile, /fun readConga\(ctx: Context, congaId: String\): Conga {/);
        assert.fileContent(contractFile, /fun updateConga\(ctx: Context, congaId: String, newValue: String\) {/);
        assert.fileContent(contractFile, /fun deleteConga\(ctx: Context, congaId: String\) {/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "congaExists",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "createConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "readConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "updateConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "deleteConga",/);
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');

    });

    it('should generate a v1 Kotlin project using prompts (default asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v1',
                contractType: 'default',
                language: 'kotlin',
                name: 'JamesKotlinContract',
                version: '0.0.1',
                description: 'James Kotlin Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'MyAsset'
            });

        assert.file([
            'build.gradle',
            'gradle/wrapper/gradle-wrapper.jar',
            'gradle/wrapper/gradle-wrapper.properties',
            'gradlew',
            'gradlew.bat',
            'settings.gradle',
            '.fabricignore',
            '.gitignore',
            'src/main/kotlin/org/example/MyAsset.kt',
            'src/main/kotlin/org/example/MyAssetContract.kt',
            'src/test/kotlin/org/example/MyAssetContractTest.kt',
            'transaction_data/my-asset-transactions.txdata'

        ]);
        let contractFile = 'src/main/kotlin/org/example/MyAssetContract.kt';
        assert.fileContent('src/main/kotlin/org/example/MyAsset.kt', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/kotlin/org/example/MyAsset.kt', /class MyAsset\(@Property\(\) var value: String\?\) {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /class MyAssetContract : ContractInterface {/);
        assert.fileContent(contractFile, /fun myAssetExists\(ctx: Context, myAssetId: String\): Boolean {/);
        assert.fileContent(contractFile, /fun createMyAsset\(ctx: Context, myAssetId: String, value: String\) {/);
        assert.fileContent(contractFile, /fun readMyAsset\(ctx: Context, myAssetId: String\): MyAsset {/);
        assert.fileContent(contractFile, /fun updateMyAsset\(ctx: Context, myAssetId: String, newValue: String\) {/);
        assert.fileContent(contractFile, /fun deleteMyAsset\(ctx: Context, myAssetId: String\) {/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "myAssetExists",/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "createMyAsset",/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "readMyAsset",/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "updateMyAsset",/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "deleteMyAsset",/);
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');
    });

    it('should generate a v2 Kotlin project using prompts (custom asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v2',
                contractType: 'default',
                language: 'kotlin',
                name: 'JamesKotlinContract',
                version: '0.0.1',
                description: 'James Kotlin Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            });
        assert.file([
            'build.gradle',
            'gradle/wrapper/gradle-wrapper.jar',
            'gradle/wrapper/gradle-wrapper.properties',
            'gradlew',
            'gradlew.bat',
            'settings.gradle',
            '.fabricignore',
            '.gitignore',
            'src/main/kotlin/org/example/Conga.kt',
            'src/main/kotlin/org/example/CongaContract.kt',
            'src/test/kotlin/org/example/CongaContractTest.kt',
            'transaction_data/conga-transactions.txdata'

        ]);
        let contractFile = 'src/main/kotlin/org/example/CongaContract.kt';
        assert.fileContent('src/main/kotlin/org/example/Conga.kt', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/kotlin/org/example/Conga.kt', /class Conga\(@Property\(\) var value: String\?\) {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /class CongaContract : ContractInterface {/);
        assert.fileContent(contractFile, /fun congaExists\(ctx: Context, congaId: String\): Boolean {/);
        assert.fileContent(contractFile, /fun createConga\(ctx: Context, congaId: String, value: String\) {/);
        assert.fileContent(contractFile, /fun readConga\(ctx: Context, congaId: String\): Conga {/);
        assert.fileContent(contractFile, /fun updateConga\(ctx: Context, congaId: String, newValue: String\) {/);
        assert.fileContent(contractFile, /fun deleteConga\(ctx: Context, congaId: String\) {/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "congaExists",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "createConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "readConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "updateConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "deleteConga",/);
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');

    });

    it('should generate a v2 Kotlin project using prompts (default asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v2',
                contractType: 'default',
                language: 'kotlin',
                name: 'JamesKotlinContract',
                version: '0.0.1',
                description: 'James Kotlin Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'MyAsset'
            });

        assert.file([
            'build.gradle',
            'gradle/wrapper/gradle-wrapper.jar',
            'gradle/wrapper/gradle-wrapper.properties',
            'gradlew',
            'gradlew.bat',
            'settings.gradle',
            '.fabricignore',
            '.gitignore',
            'src/main/kotlin/org/example/MyAsset.kt',
            'src/main/kotlin/org/example/MyAssetContract.kt',
            'src/test/kotlin/org/example/MyAssetContractTest.kt',
            'transaction_data/my-asset-transactions.txdata'

        ]);
        let contractFile = 'src/main/kotlin/org/example/MyAssetContract.kt';
        assert.fileContent('src/main/kotlin/org/example/MyAsset.kt', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/kotlin/org/example/MyAsset.kt', /class MyAsset\(@Property\(\) var value: String\?\) {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /class MyAssetContract : ContractInterface {/);
        assert.fileContent(contractFile, /fun myAssetExists\(ctx: Context, myAssetId: String\): Boolean {/);
        assert.fileContent(contractFile, /fun createMyAsset\(ctx: Context, myAssetId: String, value: String\) {/);
        assert.fileContent(contractFile, /fun readMyAsset\(ctx: Context, myAssetId: String\): MyAsset {/);
        assert.fileContent(contractFile, /fun updateMyAsset\(ctx: Context, myAssetId: String, newValue: String\) {/);
        assert.fileContent(contractFile, /fun deleteMyAsset\(ctx: Context, myAssetId: String\) {/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "myAssetExists",/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "createMyAsset",/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "readMyAsset",/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "updateMyAsset",/);
        assert.fileContent('transaction_data/my-asset-transactions.txdata', /"transactionName": "deleteMyAsset",/);
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');
    });

    it('should throw an error if an incorrect contract type is provided', async () => {
        const errorStub = sandbox.stub(Mocha.Runner.prototype, 'uncaught');
        const promise = new Promise((resolve) => {
            errorStub.callsFake(resolve);
        });
        helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v2',
                contractType: 'penguin',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My Typescript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        await promise;
        errorStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Error));
        const error = errorStub.args[0][0];
        error.message.should.match(/Sorry the contract type 'penguin' does not exist./);
    });

});
