/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const camelcase = require('camelcase');
const decamelize = require('decamelize');
const Generator = require('yeoman-generator');
const path = require('path');
const process = require('process');

module.exports = class extends Generator {

    async prompting () {
        const questions = [{
            type : 'list',
            name : 'language',
            message : 'Please specify the contract language:',
            choices : [
                {name : 'JavaScript', value : 'javascript'},
                {name : 'TypeScript', value : 'typescript'}
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
            when: () => !this.options.asset
        }];
        const answers = await this.prompt(questions);
        Object.assign(this.options, answers);
        this.options.spdxAndLicense = `SPDX-License-Identifier: ${this.options.license}`;
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
        this.fs.copyTpl(this.templatePath(this.options.language), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
        if (this.options.language === 'javascript') {
            this._rename(this.destinationPath('lib/my-contract.js'), this.destinationPath(`lib/${this.options.assetDashSeparator}-contract.js`));
            this._rename(this.destinationPath('test/my-contract.js'), this.destinationPath(`test/${this.options.assetDashSeparator}-contract.js`));
        }
        if (this.options.language === 'typescript') {
            this._rename(this.destinationPath('src/my-asset.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}.ts`));
            this._rename(this.destinationPath('src/my-contract.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}-contract.ts`));
            this._rename(this.destinationPath('src/my-contract.spec.ts'), this.destinationPath(`src/${this.options.assetDashSeparator}-contract.spec.ts`));
        }
        // npm install does dumb stuff and renames our gitignore to npmignore, so rename it back!
        this._rename(this.destinationPath('.gitignore-hidefromnpm'), this.destinationPath('.gitignore'));
        this._rename(this.destinationPath('.npmignore-hidefromnpm'), this.destinationPath('.npmignore'));
    }

    async install () {
        if (this.options['skip-install'] !== true) {
            this.installDependencies({bower : false, npm : true});
        }
    }

    _getDestination () {
        return (this.options.destination) ? (this.destinationRoot(this.options.destination)) : ((this.destinationRoot()));
    }

    end () {
        console.log('Finished generating contract');
    }
};
