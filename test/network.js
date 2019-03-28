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
            'generate.cmd',
            'generate.js',
            'generate.sh',
            'nodes/.gitkeep',
            'start.cmd',
            'start.sh',
            'stop.cmd',
            'stop.sh',
            'teardown.cmd',
            'teardown.sh',
            'wallets/.gitkeep'
        ]);
        assert.fileContent('.env', /COMPOSE_PROJECT_NAME=local_fabric/);
        assert.fileContent('configtx.yaml', /Port: 17051/);
        assert.fileContent('configtx.yaml', /- orderer.example.com:17050/);
        assert.fileContent('docker-compose.yml', /- ORDERER_GENERAL_LISTENPORT=17050/);
        assert.fileContent('docker-compose.yml', /- 17050:17050/);
        assert.fileContent('docker-compose.yml', /- CORE_PEER_ADDRESS=peer0.org1.example.com:17051/);
        assert.fileContent('docker-compose.yml', /- CORE_PEER_LISTENADDRESS=0.0.0.0:17051/);
        assert.fileContent('docker-compose.yml', /- CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:17052/);
        assert.fileContent('docker-compose.yml', /- CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.example.com:17051/);
        assert.fileContent('docker-compose.yml', /- 17051:17051/);
        assert.fileContent('docker-compose.yml', /- 17052:17052/);
        assert.fileContent('docker-compose.yml', /- FABRIC_CA_SERVER_PORT=17054/);
        assert.fileContent('docker-compose.yml', /- 17055:5984/);
        assert.fileContent('docker-compose.yml', /- 17056:80/);
        assert.fileContent('generate.js', /url: 'grpc:\/\/localhost:17050'/);
        assert.fileContent('generate.js', /url: 'grpc:\/\/localhost:17051'/);
        assert.fileContent('generate.js', /url: 'http:\/\/localhost:17054'/);
        assert.fileContent('generate.js', /name: 'local_fabric'/);
        assert.fileContent('generate.js', /wallet: 'local_wallet'/);
        assert.fileContent('generate.cmd', /http:\/\/admin:adminpw@ca.org1.example.com:17054/);
        assert.fileContent('generate.sh', /http:\/\/admin:adminpw@ca.org1.example.com:17054/);
        assert.fileContent('start.cmd', /local_fabric_peer0.org1.example.com/);
        assert.fileContent('start.cmd', /orderer.example.com:17050/);
        assert.fileContent('start.sh', /local_fabric_peer0.org1.example.com/);
        assert.fileContent('start.sh', /orderer.example.com:17050/);
        assert.fileContent('teardown.cmd', /for \/f "tokens=\*" %%i in \('docker ps -aq --filter "name=local_fabric-\*"'\) do docker rm -f %%i/);
        assert.fileContent('teardown.sh', /docker ps -aq --filter "name=local_fabric-*" | xargs docker rm -f/);
    }

    it('should generate a network using prompts into a test directory', async () => {
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                subgenerator: 'network',
                name: 'local_fabric',
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
