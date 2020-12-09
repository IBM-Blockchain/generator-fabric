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

describe('Contract (Java)', () => {
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
                contractType: 'default',
                language: 'rockstar',
                name: 'JamesJavaContract',
                version: '0.0.1',
                description: 'James Java Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            }).then();
        await promise;
        errorStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Error));
        const error = errorStub.args[0][0];
        error.message.should.match(/Sorry the language 'rockstar' is not recognized/);
    });

    it('should generate a Java project using prompts (custom asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'default',
                language: 'java',
                name: 'JamesJavaContract',
                version: '0.0.1',
                description: 'James Java Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'build.gradle',
            'gradle/wrapper/gradle-wrapper.jar',
            'gradle/wrapper/gradle-wrapper.properties',
            'gradlew',
            'gradlew.bat',
            'settings.gradle',
            '.fabricignore',
            '.gitignore',
            'src/main/java/org/example/Conga.java',
            'src/main/java/org/example/CongaContract.java',
            'src/test/java/org/example/CongaContractTest.java',
            'transaction_data/conga-transactions.txdata'

        ]);
        let contractFile = 'src/main/java/org/example/CongaContract.java';
        assert.fileContent('src/main/java/org/example/Conga.java', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/java/org/example/Conga.java', /public class Conga {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /public class CongaContract implements ContractInterface {/);
        assert.fileContent(contractFile, /public boolean congaExists\(Context ctx, String congaId\) {/);
        assert.fileContent(contractFile, /public void createConga\(Context ctx, String congaId, String value\) {/);
        assert.fileContent(contractFile, /public Conga readConga\(Context ctx, String congaId\) {/);
        assert.fileContent(contractFile, /public void updateConga\(Context ctx, String congaId, String newValue\) {/);
        assert.fileContent(contractFile, /public void deleteConga\(Context ctx, String congaId\) {/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "congaExists",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "createConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "readConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "updateConga",/);
        assert.fileContent('transaction_data/conga-transactions.txdata', /"transactionName": "deleteConga",/);
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');

    });

    it('should generate a Java project using prompts (default asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'default',
                language: 'java',
                name: 'JamesJavaContract',
                version: '0.0.1',
                description: 'James Java Contract',
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
            'src/main/java/org/example/MyAsset.java',
            'src/main/java/org/example/MyAssetContract.java',
            'src/test/java/org/example/MyAssetContractTest.java',
            'transaction_data/my-asset-transactions.txdata'

        ]);
        let contractFile = 'src/main/java/org/example/MyAssetContract.java';
        assert.fileContent('src/main/java/org/example/MyAsset.java', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/java/org/example/MyAsset.java', /public class MyAsset {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /public class MyAssetContract implements ContractInterface {/);
        assert.fileContent(contractFile, /public boolean myAssetExists\(Context ctx, String myAssetId\) {/);
        assert.fileContent(contractFile, /public void createMyAsset\(Context ctx, String myAssetId, String value\) {/);
        assert.fileContent(contractFile, /public MyAsset readMyAsset\(Context ctx, String myAssetId\) {/);
        assert.fileContent(contractFile, /public void updateMyAsset\(Context ctx, String myAssetId, String newValue\) {/);
        assert.fileContent(contractFile, /public void deleteMyAsset\(Context ctx, String myAssetId\) {/);
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
