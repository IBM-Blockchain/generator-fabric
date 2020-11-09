/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const findFreePort = require('find-free-port');
const Generator = require('yeoman-generator');
const path = require('path');

module.exports = class extends Generator {

    async prompting() {
        const ports = await findFreePort(8080, null, null, 20);
        let port = ports[0];
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
            name : 'port',
            message : 'Please specify the port:',
            default : port,
            when : () => !this.options.port
        }, {
            type: 'list',
            name: 'fabricCapabilities',
            message: 'Please select the Fabric channel capabilities version:',
            choices: [
                {
                    name: 'V1_4_2',
                    value: 'V1_4_2',
                },{
                    name: 'V2_0',
                    value: 'V2_0'
                }
            ],
            default : 'V2_0',
            when : () => !this.options.fabricCapabilities
        }];
        const answers = await this.prompt(questions);
        Object.assign(this.options, answers);
        let capabilities = ''; // Microfab will use V2_0 capabilities by default.
        if(this.options.fabricCapabilities === 'V1_4_2'){
            capabilities = `"capability_level": "${this.options.fabricCapabilities}",`;
        }


        if(this.options.numOrganizations === 1){
            this.options.microfabConfig = `{"port":${this.options.port}, ${capabilities} "endorsing_organizations": [{"name": "Org1"}],"channels": [{"name": "mychannel","endorsing_organizations": ["Org1"]}]}`;
        } else {
            // Only support maximum of 2 orgs for now.
            this.options.microfabConfig = `{"port":${this.options.port}, ${capabilities} "endorsing_organizations": [{"name": "Org1"},{"name": "Org2"}],"channels": [{"name": "mychannel","endorsing_organizations": ["Org1", "Org2"]}]}`;
        }

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
