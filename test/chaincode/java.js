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
                license: 'Apache-2.0'
            });
        assert.file([
            '.vscode/extensions.json',
            'gradle/wrapper/gradle-wrapper.jar',
            'gradle/wrapper/gradle-wrapper.properties',
            'src/main/java/org/example/Chaincode.java',
            'src/main/java/org/example/Start.java',
            'src/test/java/org/example/ChaincodeTest.java',
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
