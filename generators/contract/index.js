/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const camelcase = require('camelcase');
const decamelize = require('decamelize');
const Generator = require('yeoman-generator');
const path = require('path');
const process = require('process');

let typeAnswer, answers;
module.exports = class extends Generator {

    async prompting () {

        const typeQuestion = [{
            type : 'list',
            name : 'contractType',
            message : 'Please specify the type of contract to generate:',
            choices : [
                {name : 'With private data', value : 'private'},
                {name : 'Without private data', value : 'default'}
            ],
            when : () => !this.options.contractType
        }];

        const questions = [{
            type : 'input',
            name : 'mspId',
            message : 'Please specify your mspId (you will need this for the Private Data Collection file):',
            when : () => !this.options.mspId
        }, {
            type : 'list',
            name : 'language',
            message : 'Please specify the contract language:',
            choices : [
                {name : 'JavaScript', value : 'javascript'},
                {name : 'TypeScript', value : 'typescript'},
                {name : 'Java', value : 'java'},
                {name : 'Go', value : 'go'},
                {name : 'Kotlin', value : 'kotlin'}
            ],
            when : () => !this.options.language
        }, {
            type : 'input',
            name : 'name',
            message : 'Please specify the contract name:',
            default : path.basename(process.cwd()),
            when : () => !this.options.name
        }, {
            type : 'input',
            name : 'version',
            message : 'Please specify the contract version:',
            default : '0.0.1',
            when : () => !this.options.version
        }, {
            type : 'input',
            name : 'description',
            message : 'Please specify the contract description:',
            when : () => !this.options.description
        }, {
            type : 'input',
            name : 'author',
            message : 'Please specify the contract author:',
            when : () => !this.options.author
        }, {
            type : 'input',
            name : 'license',
            message : 'Please specify the contract license:',
            when : () => !this.options.license
        }, {
            type: 'input',
            name: 'asset',
            message: 'Please specify the asset type:',
            default: 'MyAsset',
            when: () => !this.options.asset
        }];

        typeAnswer = await this.prompt(typeQuestion);
        Object.assign(this.options, typeAnswer);

        if (this.options.contractType === 'private') {
            questions[1].choices = [
                {name : 'JavaScript', value : 'javascript'},
                {name : 'TypeScript', value : 'typescript'},
                {name : 'Java', value : 'java'},
                {name : 'Go', value : 'go'},
            ];
            questions[7].default = 'MyPrivateAsset';

            answers = await this.prompt(questions);

        } else if (this.options.contractType === 'default') {
            questions[0].when = () => this.options.mspId;
            answers = await this.prompt(questions);
        } else {
            throw new Error(`Sorry the contract type '${this.options.contractType}' does not exist.`);
        }

        Object.assign(this.options, answers);
        this.options.spdxAndLicense = `SPDX-License-Identifier: ${this.options.license}`;
        this.options.camelcase = camelcase;
        this.options.assetCamelCase = camelcase(this.options.asset);
        this.options.assetPascalCase = camelcase(this.options.asset, { pascalCase: true });
        this.options.assetDashSeparator = decamelize(this.options.assetCamelCase, '-');
        this.options.assetSpaceSeparator = decamelize(this.options.assetCamelCase, ' ');
    }

    _rename(from, to) {
        if (from === to) {
            return;
        }
        this.fs.move(from, to);
    }

    async writing () {
        console.log('Generating files...');

        if (this.options.contractType === 'default') {
            if (this.options.language.endsWith('script') ){
                this.fs.copyTpl(this.templatePath(`default/${this.options.language}`), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
                if (this.options.language === 'javascript') {
                    this._rename(this.destinationPath('lib/my-contract.js'), this.destinationPath(`lib/${this.options.assetDashSeparator}-contract.js`));
                    this._rename(this.destinationPath('test/my-contract.js'), this.destinationPath(`test/${this.options.assetDashSeparator}-contract.js`));
                    this._rename(this.destinationPath('transaction_data/my-transactions.txdata'), this.destinationPath((`transaction_data/${this.options.assetDashSeparator}-transactions.txdata`)));
                }
                if (this.options.language === 'typescript') {
                    this._rename(this.destinationPath('src/my-asset.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}.ts`));
                    this._rename(this.destinationPath('src/my-contract.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}-contract.ts`));
                    this._rename(this.destinationPath('src/my-contract.spec.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}-contract.spec.ts`));
                    this._rename(this.destinationPath('transaction_data/my-transactions.txdata'), this.destinationPath((`transaction_data/${this.options.assetDashSeparator}-transactions.txdata`)));
                }
                // npm install does dumb stuff and renames our gitignore to npmignore, so rename it back!
                this._rename(this.destinationPath('.gitignore-hidefromnpm'), this.destinationPath('.gitignore'));
                this._rename(this.destinationPath('.npmignore-hidefromnpm'), this.destinationPath('.npmignore'));
            } else if (this.options.language === 'java'){
                this.fs.copyTpl(this.templatePath(`default/${this.options.language}`), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
                this._rename(this.destinationPath('.gitignore-hidefromnpm'), this.destinationPath('.gitignore'));
                let root = 'src/main/java/org/example';
                this._rename(this.destinationPath(`${root}/MyAsset.java`), this.destinationPath(`${root}/${this.options.assetPascalCase}.java`));
                this._rename(this.destinationPath(`${root}/MyContract.java`), this.destinationPath(`${root}/${this.options.assetPascalCase}Contract.java`));
                root = 'src/test/java/org/example';
                this._rename(this.destinationPath(`${root}/MyContractTest.java`), this.destinationPath(`${root}/${this.options.assetPascalCase}ContractTest.java`));
                this._rename(this.destinationPath('transaction_data/my-transactions.txdata'), this.destinationPath((`transaction_data/${this.options.assetDashSeparator}-transactions.txdata`)));
            } else if (this.options.language === 'kotlin'){
                this.fs.copyTpl(this.templatePath(`default/${this.options.language}`), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
                this._rename(this.destinationPath('.gitignore-hidefromnpm'), this.destinationPath('.gitignore'));
                let root = 'src/main/kotlin/org/example';
                this._rename(this.destinationPath(`${root}/MyAsset.kt`), this.destinationPath(`${root}/${this.options.assetPascalCase}.kt`));
                this._rename(this.destinationPath(`${root}/MyContract.kt`), this.destinationPath(`${root}/${this.options.assetPascalCase}Contract.kt`));
                root = 'src/test/kotlin/org/example';
                this._rename(this.destinationPath(`${root}/MyContractTest.kt`), this.destinationPath(`${root}/${this.options.assetPascalCase}ContractTest.kt`));
                this._rename(this.destinationPath('transaction_data/my-transactions.txdata'), this.destinationPath((`transaction_data/${this.options.assetDashSeparator}-transactions.txdata`)));
            } else if (this.options.language === 'go') {
                this.fs.copyTpl(this.templatePath(`default/${this.options.language}`), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
                this._rename(this.destinationPath('my-contract.go'), this.destinationPath(`${this.options.assetDashSeparator}-contract.go`));
                this._rename(this.destinationPath('my-contract_test.go'), this.destinationPath(`${this.options.assetDashSeparator}-contract_test.go`));
                this._rename(this.destinationPath('my-asset.go'), this.destinationPath(`${this.options.assetDashSeparator}.go`));
            } else {
                // language not understood
                throw new Error(`Sorry the language '${this.options.language}' is not recognized`);
            }
        } else {
            if (this.options.language.endsWith('script') ){
                this.fs.copyTpl(this.templatePath(`private/${this.options.language}`), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
                if (this.options.language === 'javascript') {
                    this._rename(this.destinationPath('lib/my-contract.js'), this.destinationPath(`lib/${this.options.assetDashSeparator}-contract.js`));
                    this._rename(this.destinationPath('test/my-contract.js'), this.destinationPath(`test/${this.options.assetDashSeparator}-contract.js`));
                    this._rename(this.destinationPath('transaction_data/my-transactions.txdata'), this.destinationPath((`transaction_data/${this.options.assetDashSeparator}-transactions.txdata`)));
                }
                if (this.options.language === 'typescript') {
                    this._rename(this.destinationPath('src/my-private-asset.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}.ts`));
                    this._rename(this.destinationPath('src/my-contract.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}-contract.ts`));
                    this._rename(this.destinationPath('src/my-contract.spec.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}-contract.spec.ts`));
                    this._rename(this.destinationPath('transaction_data/my-transactions.txdata'), this.destinationPath((`transaction_data/${this.options.assetDashSeparator}-transactions.txdata`)));
                }
                // npm install does dumb stuff and renames our gitignore to npmignore, so rename it back!
                this._rename(this.destinationPath('.gitignore-hidefromnpm'), this.destinationPath('.gitignore'));
                this._rename(this.destinationPath('.npmignore-hidefromnpm'), this.destinationPath('.npmignore'));
            } else if (this.options.language === 'java'){
                this.fs.copyTpl(this.templatePath(`private/${this.options.language}`), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
                this._rename(this.destinationPath('.gitignore-hidefromnpm'), this.destinationPath('.gitignore'));
                let root = 'src/main/java/org/example';
                this._rename(this.destinationPath(`${root}/MyAsset.java`), this.destinationPath(`${root}/${this.options.assetPascalCase}.java`));
                this._rename(this.destinationPath(`${root}/MyContract.java`), this.destinationPath(`${root}/${this.options.assetPascalCase}Contract.java`));
                root = 'src/test/java/org/example';
                this._rename(this.destinationPath(`${root}/MyContractTest.java`), this.destinationPath(`${root}/${this.options.assetPascalCase}ContractTest.java`));
                this._rename(this.destinationPath('transaction_data/my-transactions.txdata'), this.destinationPath((`transaction_data/${this.options.assetDashSeparator}-transactions.txdata`)));
            } else if (this.options.language === 'go') {
                this.fs.copyTpl(this.templatePath(`private/${this.options.language}`), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
                this._rename(this.destinationPath('my-contract.go'), this.destinationPath(`${this.options.assetDashSeparator}-contract.go`));
                this._rename(this.destinationPath('my-contract_test.go'), this.destinationPath(`${this.options.assetDashSeparator}-contract_test.go`));
                this._rename(this.destinationPath('my-asset.go'), this.destinationPath(`${this.options.assetDashSeparator}.go`));
                this._rename(this.destinationPath('transaction_data/my-transactions.txdata'), this.destinationPath((`transaction_data/${this.options.assetDashSeparator}-transactions.txdata`)));
            } else {
                // language not understood
                throw new Error(`Sorry the language '${this.options.language}' is not recognized`);
            }
        }


    }

    async install () {
        if (this.options.language.endsWith('script') ){
            if (this.options['skip-install'] !== true) {
                this.installDependencies({bower : false, npm : true});
            }
        } else if (this.options.language.startsWith('go')) {
            console.log('Please run  \'go mod vendor\' to get the required go modules prior to installing on your peer');
        } else {
            console.log('Please run  \'./gradlew clean build shadowJar\' to build the Java/Kotlin Smart Contract');
        }
    }

    _getDestination () {
        return (this.options.destination) ? (this.destinationRoot(this.options.destination)) : ((this.destinationRoot()));
    }

    end () {
        console.log('Finished generating contract');
    }
};
