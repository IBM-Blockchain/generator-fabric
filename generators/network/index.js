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
            name : 'dockerName',
            message : 'Please specify the Docker name:',
            default : path.basename(process.cwd()).replace(/[^A-Za-z0-9]/g, ''),
            when : () => !this.options.dockerName
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
        this.fs.write(this.destinationPath(`wallets/${this.options.name}_wallet/.gitkeep`), '');
        this.fs.writeJSON(this.destinationPath('nodes/orderer.example.com.json'), {
            short_name: 'orderer.example.com',
            name: 'orderer.example.com',
            url: `grpc://localhost:${this.options.orderer}`,
            type: 'fabric-orderer',
            wallet: `${this.options.name}_wallet`,
            identity: 'admin',
            msp_id: 'OrdererMSP',
            container_name: `${this.options.dockerName}_orderer.example.com`
        }, null, 4);
        this.fs.writeJSON(this.destinationPath('nodes/peer0.org1.example.com.json'), {
            short_name: 'peer0.org1.example.com',
            name: 'peer0.org1.example.com',
            url: `grpc://localhost:${this.options.peerRequest}`,
            chaincode_url: `grpc://localhost:${this.options.peerChaincode}`,
            type: 'fabric-peer',
            wallet: `${this.options.name}_wallet`,
            identity: 'admin',
            msp_id: 'Org1MSP',
            container_name: `${this.options.dockerName}_peer0.org1.example.com`
        }, null, 4);
        this.fs.writeJSON(this.destinationPath('nodes/ca.org1.example.com.json'), {
            short_name: 'ca.org1.example.com',
            name: 'ca.org1.example.com',
            url: `http://localhost:${this.options.certificateAuthority}`,
            type: 'fabric-ca',
            ca_name: 'ca.org1.example.com',
            wallet: `${this.options.name}_wallet`,
            identity: 'admin',
            msp_id: 'Org1MSP',
            container_name: `${this.options.dockerName}_ca.org1.example.com`
        }, null, 4);
        this.fs.writeJSON(this.destinationPath('nodes/couchdb.json'), {
            short_name: 'couchdb',
            name: 'couchdb',
            url: `http://localhost:${this.options.couchDB}`,
            type: 'couchdb',
            container_name: `${this.options.dockerName}_couchdb`
        }, null, 4);
        this.fs.writeJSON(this.destinationPath('nodes/logspout.json'), {
            short_name: 'logspout',
            name: 'logspout',
            url: `http://localhost:${this.options.logspout}`,
            type: 'logspout',
            container_name: `${this.options.dockerName}_logspout`
        }, null, 4);
        this.fs.writeJSON(this.destinationPath(`gateways/${this.options.name}.json`), {
            name: this.options.name,
            version: '1.0.0',
            wallet: `${this.options.name}_wallet`,
            client: {
                organization: 'Org1',
                connection: {
                    timeout: {
                        peer: {
                            endorser: '300'
                        },
                        orderer: '300'
                    }
                }
            },
            organizations: {
                Org1: {
                    mspid: 'Org1MSP',
                    peers: [
                        'peer0.org1.example.com'
                    ],
                    certificateAuthorities: [
                        'ca.org1.example.com'
                    ]
                }
            },
            peers: {
                'peer0.org1.example.com': {
                    url: `grpc://localhost:${this.options.peerRequest}`
                }
            },
            certificateAuthorities: {
                'ca.org1.example.com': {
                    url: `http://localhost:${this.options.certificateAuthority}`,
                    caName: 'ca.org1.example.com'
                }
            }
        }, null, 4);
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
