/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const Generator = require('yeoman-generator');
const path = require('path');
const process = require('process');

module.exports = class extends Generator {

    async prompting () {
        const questions = [{
            type: 'list',
            name: 'language',
            message: 'Please specify the chaincode language:',
            choices: [
                { name: 'Go', value: 'go' },
                { name: 'Java', value: 'java' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Kotlin', value: 'kotlin' },
                { name: 'TypeScript', value: 'typescript' }
            ],
            when: () => !this.options.language
        }, {
            type: 'input',
            name: 'name',
            message: 'Please specify the chaincode name:',
            default: path.basename(process.cwd()),
            when: () => !this.options.name
        }, {
            type: 'input',
            name: 'version',
            message: 'Please specify the chaincode version:',
            default: '0.0.1',
            when: () => !this.options.version
        }, {
            type: 'input',
            name: 'description',
            message: 'Please specify the chaincode description:',
            when: () => !this.options.description
        }, {
            type: 'input',
            name: 'author',
            message: 'Please specify the chaincode author:',
            when: () => !this.options.author
        }, {
            type: 'input',
            name: 'license',
            message: 'Please specify the chaincode license:',
            when: () => !this.options.license
        }];
        const answers = await this.prompt(questions);
        Object.assign(this.options, answers);
        this.options.spdxAndLicense = `SPDX-License-Identifier: ${this.options.license}`;
    }

    async writing () {
        console.log('Generating files...');
        this.fs.copyTpl(this.templatePath(this.options.language), this._getDestination(), this.options, undefined, { globOptions: { dot: true } });
        // npm install does dumb stuff and renames our gitignore to npmignore, so rename it back!
        this.fs.move(this.destinationPath('.gitignore-hidefromnpm'), this.destinationPath('.gitignore'));
    }

    async install() {
        if(this.options['skip-install'] !== true){
            if (this.options.language === 'javascript' || this.options.language === 'typescript') {
                this.installDependencies({ bower: false, npm: true });
            }
        }
    }

    _getDestination(){
        return (this.options.destination) ? (this.destinationRoot(this.options.destination)) : ((this.destinationRoot()));
    }

    end(){
        console.log('Finished generating chaincode');
    }
};
