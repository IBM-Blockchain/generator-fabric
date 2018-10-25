/*
 * SPDX-License-Identifier: Apache-2.0
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
