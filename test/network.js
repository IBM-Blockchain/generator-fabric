/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const crypto = require('crypto');
const fs = require('fs');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('Network', () => {

    function testGeneratedNetwork() {
        assert.file([
            '.env',
            'admin-msp/.gitkeep',
            'configtx.yaml',
            'configtx/.gitkeep',
            'crypto-config.yaml',
            'crypto-config/.gitkeep',
            'docker-compose.yml',
            'gateways/.gitkeep',
            'gateways/local_fabric.json',
            'generate.cmd',
            'generate.js',
            'generate.sh',
            'nodes/.gitkeep',
            'nodes/orderer.example.com.json',
            'nodes/peer0.org1.example.com.json',
            'nodes/ca.org1.example.com.json',
            'nodes/couchdb.json',
            'nodes/logspout.json',
            'start.cmd',
            'start.sh',
            'stop.cmd',
            'stop.sh',
            'teardown.cmd',
            'teardown.sh',
            'wallets/local_fabric_wallet/.gitkeep'
        ]);
        assert.fileContent('.env', /COMPOSE_PROJECT_NAME=localfabric/);
        assert.fileContent('configtx.yaml', /Port: 17051/);
        assert.fileContent('configtx.yaml', /- orderer.example.com:17050/);
        assert.fileContent('docker-compose.yml', /- ORDERER_GENERAL_LISTENPORT=17050/);
        assert.fileContent('docker-compose.yml', /- 17050:17050/);
        assert.fileContent('docker-compose.yml', /- CORE_PEER_ADDRESS=peer0.org1.example.com:17051/);
        assert.fileContent('docker-compose.yml', /- CORE_PEER_LISTENADDRESS=0.0.0.0:17051/);
        assert.fileContent('docker-compose.yml', /- CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:17052/);
        assert.fileContent('docker-compose.yml', /- CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.example.com:17051/);
        assert.fileContent('docker-compose.yml', /- CORE_CHAINCODE_MODE=dev/);
        assert.fileContent('docker-compose.yml', /- CORE_CHAINCODE_EXECUTETIMEOUT=99999s/);
        assert.fileContent('docker-compose.yml', /- 17051:17051/);
        assert.fileContent('docker-compose.yml', /- 17052:17052/);
        assert.fileContent('docker-compose.yml', /- FABRIC_CA_SERVER_PORT=17054/);
        assert.fileContent('docker-compose.yml', /- 17055:5984/);
        assert.fileContent('docker-compose.yml', /- 17056:80/);
        assert.fileContent('gateways/local_fabric.json', /"url": "grpc:\/\/localhost:17051"/);
        assert.fileContent('gateways/local_fabric.json', /"url": "grpc:\/\/localhost:17051"/);
        assert.fileContent('generate.cmd', /http:\/\/admin:adminpw@ca.org1.example.com:17054/);
        assert.fileContent('generate.js', /const identityPath = path.resolve\(__dirname, 'wallets', 'local_fabric_wallet', `\${identity.name}.json`\);/);
        assert.fileContent('generate.sh', /http:\/\/admin:adminpw@ca.org1.example.com:17054/);
        assert.fileContent('is_generated.cmd', /localfabric_orderer.example.com localfabric_ca.org1.example.com localfabric_peer0.org1.example.com localfabric_couchdb/);
        assert.fileContent('is_generated.sh', /localfabric_orderer.example.com localfabric_ca.org1.example.com localfabric_peer0.org1.example.com localfabric_couchdb/);
        assert.fileContent('is_running.cmd', /localfabric_orderer.example.com localfabric_ca.org1.example.com localfabric_peer0.org1.example.com localfabric_couchdb localfabric_logspout/);
        assert.fileContent('is_running.sh', /localfabric_orderer.example.com localfabric_ca.org1.example.com localfabric_peer0.org1.example.com localfabric_couchdb localfabric_logspout/);
        assert.fileContent('nodes/orderer.example.com.json', /"api_url": "grpc:\/\/localhost:17050"/);
        assert.fileContent('nodes/peer0.org1.example.com.json', /"api_url": "grpc:\/\/localhost:17051"/);
        assert.fileContent('nodes/peer0.org1.example.com.json', /"chaincode_url": "grpc:\/\/localhost:17052"/);
        assert.fileContent('nodes/ca.org1.example.com.json', /"api_url": "http:\/\/localhost:17054"/);
        assert.fileContent('nodes/couchdb.json', /"api_url": "http:\/\/localhost:17055"/);
        assert.fileContent('nodes/logspout.json', /"api_url": "http:\/\/localhost:17056"/);
        assert.fileContent('start.cmd', /localfabric_peer0.org1.example.com/);
        assert.fileContent('start.cmd', /orderer.example.com:17050/);
        assert.fileContent('start.sh', /localfabric_peer0.org1.example.com/);
        assert.fileContent('start.sh', /orderer.example.com:17050/);
        assert.fileContent('teardown.cmd', /for %%d in \(admin-msp configtx crypto-config wallets\\local_fabric_wallet\) do \(/);
        assert.fileContent('teardown.cmd', /for \/f "tokens=\*" %%i in \('docker ps -aq --filter "name=localfabric-\*"'\) do docker rm -f %%i/);
        assert.fileContent('teardown.sh', /rm -fr admin-msp\/\* configtx\/\* crypto-config\/\* wallets\/local_fabric_wallet\/\*/);
        assert.fileContent('teardown.sh', /docker ps -aq --filter "name=localfabric-*" | xargs docker rm -f/);
    }

    it('should generate a network using prompts into a test directory', async () => {
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                subgenerator: 'network',
                name: 'local_fabric',
                dockerName: 'localfabric',
                orderer: '17050',
                peerRequest: '17051',
                peerChaincode: '17052',
                certificateAuthority: '17054',
                couchDB: '17055',
                logspout: '17056'
            });
        testGeneratedNetwork();
    }).timeout(os.platform === 'win32' ? 60 * 1000 : undefined);

    it('should generate a network using options into a specified directory', async () => {
        const tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));
        fs.mkdirSync(tmpdir, { recursive: true });
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withOptions({
                subgenerator: 'network',
                name: 'local_fabric',
                dockerName: 'localfabric',
                orderer: '17050',
                peerRequest: '17051',
                peerChaincode: '17052',
                certificateAuthority: '17054',
                couchDB: '17055',
                logspout: '17056',
                destination: tmpdir
            });
        const cwd = process.cwd();
        process.chdir(tmpdir);
        try {
            testGeneratedNetwork();
        } finally {
            process.chdir(cwd);
        }
    }).timeout(os.platform === 'win32' ? 60 * 1000 : undefined);

});
