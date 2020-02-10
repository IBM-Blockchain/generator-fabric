/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const g2js = require('gradle-to-js/lib/parser');
const fs = require('fs');

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

describe('Contract (Java)', () => {
    it('should not create a rockstart project',async () => {

        await helpers.run(path.join(__dirname, '../../../generators/app'))
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

    });
    
    it('should generate a Java project using prompts (custom asset)', async () => {

        let dir;
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
            'src/test/java/org/example/CongaContractTest.java'

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
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');

    });

    it('should generate a Java project using prompts (default asset)', async () => {
        let dir;
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
            'src/test/java/org/example/MyAssetContractTest.java'

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
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');
    });

});
