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

const Generator = require('yeoman-generator');
module.exports = class extends Generator {

    async prompting() {
        const questions = [{
            type: 'list',
            name: 'subgenerator',
            message: 'Please specify the generator to run:',
            choices: [
                { name: 'Chaincode', value: 'chaincode' },
                { name: 'Contract', value: 'contract' }
            ],
            store: true,
            when: () => !this.options.subgenerator
        }];
        const answers = await this.prompt(questions);
        Object.assign(this.options, answers);
    }

    async configuring() {
        const { subgenerator } = this.options;
        this.log(`This generator can also be run with: yo fabric:${subgenerator}`);
        this.composeWith(require.resolve(`../${subgenerator}`), this.options);
    }

};
