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


    let genericPDC = [
        {
            name: 'CollectionOne',
            policy: 'OR(\'Org1MSP.member\')',
            requiredPeerCount: 0,
            maxPeerCount: 1,
            blockToLive: 0,
            memberOnlyRead: true
        }
    ];

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

    it('should generate a v1 Java project using prompts (default asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v1',
                contractType: 'private',
                language: 'java',
                name: 'JamesJavaContract',
                version: '0.0.1',
                description: 'James Java Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateAsset',
                mspId: 'Org1MSP'
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
            'src/main/java/org/example/MyPrivateAsset.java',
            'src/main/java/org/example/MyPrivateAssetContract.java',
            'src/test/java/org/example/MyPrivateAssetContractTest.java',
            'collections.json',
            'transaction_data/my-private-asset-transactions.txdata'

        ]);
        let contractFile = 'src/main/java/org/example/MyPrivateAssetContract.java';
        assert.fileContent('src/main/java/org/example/MyPrivateAsset.java', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/java/org/example/MyPrivateAsset.java', /public class MyPrivateAsset {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /public class MyPrivateAssetContract implements ContractInterface {/);
        assert.fileContent(contractFile, /public boolean myPrivateAssetExists\(Context ctx, String myPrivateAssetId\) {/);
        assert.fileContent(contractFile, /public void createMyPrivateAsset\(Context ctx, String myPrivateAssetId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public String readMyPrivateAsset\(Context ctx, String myPrivateAssetId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public void updateMyPrivateAsset\(Context ctx, String myPrivateAssetId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public void deleteMyPrivateAsset\(Context ctx, String myPrivateAssetId\) {/);
        assert.fileContent(contractFile, /public boolean verifyMyPrivateAsset\(Context ctx, String myPrivateAssetId, MyPrivateAsset objectToVerify\) throws NoSuchAlgorithmException {/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "myPrivateAssetExists",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "createMyPrivateAsset",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "readMyPrivateAsset",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "updateMyPrivateAsset",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "deleteMyPrivateAsset",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "verifyMyPrivateAsset",/);
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');

    });

    it('should generate a v1 Java project using prompts (custom asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v1',
                contractType: 'private',
                language: 'java',
                name: 'JamesJavaContract',
                version: '0.0.1',
                description: 'James Java Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
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
            'src/main/java/org/example/MyPrivateConga.java',
            'src/main/java/org/example/MyPrivateCongaContract.java',
            'src/test/java/org/example/MyPrivateCongaContractTest.java',
            'collections.json',
            'transaction_data/my-private-conga-transactions.txdata'

        ]);
        let contractFile = 'src/main/java/org/example/MyPrivateCongaContract.java';
        assert.fileContent('src/main/java/org/example/MyPrivateConga.java', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/java/org/example/MyPrivateConga.java', /public class MyPrivateConga {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /public class MyPrivateCongaContract implements ContractInterface {/);
        assert.fileContent(contractFile, /public boolean myPrivateCongaExists\(Context ctx, String myPrivateCongaId\) {/);
        assert.fileContent(contractFile, /public void createMyPrivateConga\(Context ctx, String myPrivateCongaId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public String readMyPrivateConga\(Context ctx, String myPrivateCongaId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public void updateMyPrivateConga\(Context ctx, String myPrivateCongaId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public void deleteMyPrivateConga\(Context ctx, String myPrivateCongaId\) {/);
        assert.fileContent(contractFile, /public boolean verifyMyPrivateConga\(Context ctx, String myPrivateCongaId, MyPrivateConga objectToVerify\) throws NoSuchAlgorithmException {/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "myPrivateCongaExists",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "createMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "readMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "updateMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "deleteMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "verifyMyPrivateConga",/);
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');
    });

    it('should generate a v2 Java project using prompts (default asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v2',
                contractType: 'private',
                language: 'java',
                name: 'JamesJavaContract',
                version: '0.0.1',
                description: 'James Java Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateAsset',
                mspId: 'Org1MSP'
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
            'src/main/java/org/example/MyPrivateAsset.java',
            'src/main/java/org/example/MyPrivateAssetContract.java',
            'src/test/java/org/example/MyPrivateAssetContractTest.java',
            'collections.json',
            'transaction_data/my-private-asset-transactions.txdata'

        ]);
        let contractFile = 'src/main/java/org/example/MyPrivateAssetContract.java';
        assert.fileContent('src/main/java/org/example/MyPrivateAsset.java', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/java/org/example/MyPrivateAsset.java', /public class MyPrivateAsset {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /public class MyPrivateAssetContract implements ContractInterface {/);
        assert.fileContent(contractFile, /public boolean myPrivateAssetExists\(Context ctx, String myPrivateAssetId\) {/);
        assert.fileContent(contractFile, /public void createMyPrivateAsset\(Context ctx, String myPrivateAssetId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public String readMyPrivateAsset\(Context ctx, String myPrivateAssetId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public void updateMyPrivateAsset\(Context ctx, String myPrivateAssetId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public void deleteMyPrivateAsset\(Context ctx, String myPrivateAssetId\) {/);
        assert.fileContent(contractFile, /public boolean verifyMyPrivateAsset\(Context ctx, String myPrivateAssetId, MyPrivateAsset objectToVerify\) throws NoSuchAlgorithmException {/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "myPrivateAssetExists",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "createMyPrivateAsset",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "readMyPrivateAsset",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "updateMyPrivateAsset",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "deleteMyPrivateAsset",/);
        assert.fileContent('transaction_data/my-private-asset-transactions.txdata', /"transactionName": "verifyMyPrivateAsset",/);
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');

    });

    it('should generate a v2 Java project using prompts (custom asset)', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v2',
                contractType: 'private',
                language: 'java',
                name: 'JamesJavaContract',
                version: '0.0.1',
                description: 'James Java Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
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
            'src/main/java/org/example/MyPrivateConga.java',
            'src/main/java/org/example/MyPrivateCongaContract.java',
            'src/test/java/org/example/MyPrivateCongaContractTest.java',
            'collections.json',
            'transaction_data/my-private-conga-transactions.txdata'

        ]);
        let contractFile = 'src/main/java/org/example/MyPrivateCongaContract.java';
        assert.fileContent('src/main/java/org/example/MyPrivateConga.java', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/java/org/example/MyPrivateConga.java', /public class MyPrivateConga {/);
        assert.fileContent(contractFile, /SPDX-License-Identifier: WTFPL/);
        assert.fileContent(contractFile, /public class MyPrivateCongaContract implements ContractInterface {/);
        assert.fileContent(contractFile, /public boolean myPrivateCongaExists\(Context ctx, String myPrivateCongaId\) {/);
        assert.fileContent(contractFile, /public void createMyPrivateConga\(Context ctx, String myPrivateCongaId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public String readMyPrivateConga\(Context ctx, String myPrivateCongaId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public void updateMyPrivateConga\(Context ctx, String myPrivateCongaId\) throws UnsupportedEncodingException {/);
        assert.fileContent(contractFile, /public void deleteMyPrivateConga\(Context ctx, String myPrivateCongaId\) {/);
        assert.fileContent(contractFile, /public boolean verifyMyPrivateConga\(Context ctx, String myPrivateCongaId, MyPrivateConga objectToVerify\) throws NoSuchAlgorithmException {/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "myPrivateCongaExists",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "createMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "readMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "updateMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "deleteMyPrivateConga",/);
        assert.fileContent('transaction_data/my-private-conga-transactions.txdata', /"transactionName": "verifyMyPrivateConga",/);
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

    it('should generate a private data collection file', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                fabricVersion: 'v2',
                contractType: 'private',
                language: 'java',
                name: 'JamesJavaContract',
                version: '0.0.1',
                description: 'James Java Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
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
            'src/main/java/org/example/MyPrivateConga.java',
            'src/main/java/org/example/MyPrivateCongaContract.java',
            'src/test/java/org/example/MyPrivateCongaContractTest.java',
            'collections.json',
            'transaction_data/my-private-conga-transactions.txdata'

        ]);
        const pdcJSON = require(path.join(dir, 'collections.json'));
        console.log('pdc variable' + pdcJSON);
        pdcJSON.should.deep.equal(genericPDC);
    });

});
