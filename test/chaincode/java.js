/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');

describe('Chaincode (Java)', () => {

    it('should generate a Java project using prompts', async () => {
        await helpers.run(path.join(__dirname, '../../generators/app'))
            .withPrompts({
                subgenerator: 'chaincode',
                language: 'java',
                name: 'my-java-chaincode',
                version: '0.0.1',
                description: 'My Java Chaincode',
                author: 'James Conga',
                license: 'WTFPL'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'gradle/wrapper/gradle-wrapper.jar',
            'gradle/wrapper/gradle-wrapper.properties',
            'src/main/java/org/example/Chaincode.java',
            'src/main/java/org/example/Start.java',
            'src/test/java/org/example/ChaincodeTest.java',
            '.fabricignore',
            '.gitignore',
            'build.gradle',
            'gradlew',
            'gradlew.bat',
            'settings.gradle'
        ]);
        assert.fileContent('src/main/java/org/example/Chaincode.java', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/main/java/org/example/Chaincode.java', /public class Chaincode extends ChaincodeBase \{/);
        assert.fileContent('src/main/java/org/example/Chaincode.java', /public Response init\(ChaincodeStub stub\) \{/);
        assert.fileContent('src/main/java/org/example/Chaincode.java', /public Response invoke\(ChaincodeStub stub\) \{/);
        assert.fileContent('src/main/java/org/example/Start.java', /public static void main\(String\[\] args\) \{/);
    });

    it('should not run npm install', async () => {

        let options = {
            subgenerator: 'chaincode',
            language: 'java',
            name: 'my-java-chaincode',
            version: '0.0.1',
            description: 'My Java Chaincode',
            author: 'James Conga',
            license: 'Apache-2.0'
        };

        options['skip-install'] = false;

        await helpers.run(path.join(__dirname, '../../generators/app'))
            .withOptions(options);


        assert.file([
            'gradle/wrapper/gradle-wrapper.jar',
            'gradle/wrapper/gradle-wrapper.properties',
            'src/main/java/org/example/Chaincode.java',
            'src/main/java/org/example/Start.java',
            'src/test/java/org/example/ChaincodeTest.java',
            '.fabricignore',
            '.gitignore',
            'build.gradle',
            'gradlew',
            'gradlew.bat',
            'settings.gradle'
        ]);
        assert.fileContent('src/main/java/org/example/Chaincode.java', /public class Chaincode extends ChaincodeBase \{/);
        assert.fileContent('src/main/java/org/example/Chaincode.java', /public Response init\(ChaincodeStub stub\) \{/);
        assert.fileContent('src/main/java/org/example/Chaincode.java', /public Response invoke\(ChaincodeStub stub\) \{/);
        assert.fileContent('src/main/java/org/example/Start.java', /public static void main\(String\[\] args\) \{/);


        assert.noFile('node_modules');


    });
});
