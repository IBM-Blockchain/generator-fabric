/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const findFreePort = require('find-free-port');
const Generator = require('yeoman-generator');
const path = require('path');

module.exports = class extends Generator {

    async prompting() {
        const [
            orderer,
            peerRequest,
            peerChaincode,
            ,
            certificateAuthority,
            couchDB,
            logspout
        ] = await findFreePort(17050, null, null, 7);
        const questions = [{
            type : 'input',
            name : 'name',
            message : 'Please specify the network name:',
            default : path.basename(process.cwd()),
            when : () => !this.options.name
        }, {
            type : 'input',
            name : 'orderer',
            message : 'Please specify the orderer port:',
            default : orderer,
            when : () => !this.options.orderer
        }, {
            type : 'input',
            name : 'peerRequest',
            message : 'Please specify the peer request port:',
            default : peerRequest,
            when : () => !this.options.peerRequest
        }, {
            type : 'input',
            name : 'peerChaincode',
            message : 'Please specify the peer chaincode port:',
            default : peerChaincode,
            when : () => !this.options.peerChaincode
        }, {
            type : 'input',
            name : 'certificateAuthority',
            message : 'Please specify the certificate authority port:',
            default : certificateAuthority,
            when : () => !this.options.certificateAuthority
        }, {
            type : 'input',
            name : 'couchDB',
            message : 'Please specify the CouchDB port:',
            default : couchDB,
            when : () => !this.options.couchDB
        }, {
            type : 'input',
            name : 'logspout',
            message : 'Please specify the Logspout port:',
            default : logspout,
            when : () => !this.options.logspout
        }];
        const answers = await this.prompt(questions);
        Object.assign(this.options, answers);
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
