/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const findFreePort = require('find-free-port');
const Generator = require('yeoman-generator');
const path = require('path');

module.exports = class extends Generator {

    async prompting() {
        const ports = await findFreePort(17050, null, null, 20);
        let startPort = ports[0];
        let endPort = ports[ports.length - 1];
        const questions = [{
            type : 'input',
            name : 'name',
            message : 'Please specify the network name:',
            default : path.basename(process.cwd()),
            when : () => !this.options.name
        }, {
            type : 'input',
            name : 'dockerName',
            message : 'Please specify the Docker name:',
            default : path.basename(process.cwd()).replace(/[^A-Za-z0-9]/g, ''),
            when : () => !this.options.dockerName
        }, {
            type : 'input',
            name : 'numOrganizations',
            message : 'Please specify the number of organizations:',
            default : 1,
            when : () => !this.options.numOrganizations
        }, {
            type : 'input',
            name : 'startPort',
            message : 'Please specify the start port:',
            default : startPort,
            when : () => !this.options.startPort
        }, {
            type : 'input',
            name : 'endPort',
            message : 'Please specify the end port:',
            default : endPort,
            when : () => !this.options.endPort
        }];
        const answers = await this.prompt(questions);
        Object.assign(this.options, answers);
        this.options.currentPort = null;
        this.options.allocatePort = () => {
            if (!this.options.currentPort) {
                this.options.currentPort = this.options.startPort;
                return this.options.currentPort;
            }
            this.options.currentPort++;
            if (this.options.currentPort > this.options.endPort) {
                throw new Error(`Could not allocate port as port range ${this.options.startPort}-${this.options.endPort} exceeded`);
            }
            return this.options.currentPort;
        };
    }

    async writing() {
        console.log('Generating files...');
        this.fs.copyTpl(this.templatePath(), this._getDestination(), this.options, undefined, {globOptions : {dot : true}});
    }

    async install() {

    }

    _getDestination() {
        return (this.options.destination) ? (this.destinationRoot(this.options.destination)) : ((this.destinationRoot()));
    }

    end() {
        console.log('Finished generating network');
    }
};
