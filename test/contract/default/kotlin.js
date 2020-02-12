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

describe('Contract (Kotlin)', () => {
    it('should not create a rockstart project',async () => {

        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir(() => {
            }).withPrompts({
                subgenerator: 'contract',
                contractType: 'default',
                language: 'rockstar',
                name: 'JamesKotlinContract',
                version: '0.0.1',
                description: 'James Kotlin Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            }).then();

    });

    it('should generate a Kotlin project using prompts (custom asset)', async () => {

        let dir;
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
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
            'src/test/kotlin/org/example/CongaContractTest.kt'

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
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');

    });

    it('should generate a Kotlin project using prompts (default asset)', async () => {
        let dir;
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
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
            'src/test/kotlin/org/example/MyAssetContractTest.kt'

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
        let str = fs.readFileSync(path.join(dir, 'build.gradle'),'utf8');
        let gradleBuildFile = await g2js.parseText(str.replace(/\r\n/g,'\n'));
        gradleBuildFile.version.should.equal('0.0.1');
    });

});
