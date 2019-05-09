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

    function testGeneratedNetwork (version) {
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
        assert.fileContent('docker-compose.yml', /- 17051:17051/);
        assert.fileContent('docker-compose.yml', /- 17052:17052/);
        assert.fileContent('docker-compose.yml', /- FABRIC_CA_SERVER_PORT=17054/);
        assert.fileContent('docker-compose.yml', /- 17055:5984/);
        assert.fileContent('docker-compose.yml', /- 17056:80/);
        if (version === '2.0.0-alpha') {
            assert.fileContent('docker-compose.yml', /image: hyperledger\/fabric-orderer:2.0.0-alpha/);
            assert.fileContent('docker-compose.yml', /image: hyperledger\/fabric-peer:2.0.0-alpha/);
            assert.fileContent('docker-compose.yml', /image: hyperledger\/fabric-ca:2.0.0-alpha/);
            assert.fileContent('docker-compose.yml', /image: hyperledger\/fabric-couchdb:0.4.15/);
            assert.fileContent('docker-compose.yml', /CORE_CHAINCODE_GOLANG_RUNTIME=hyperledger\/fabric-baseos:2.0.0-alpha/);
            assert.fileContent('docker-compose.yml', /CORE_CHAINCODE_JAVA_RUNTIME=hyperledger\/fabric-javaenv:2.0.0-alpha/);
            assert.fileContent('docker-compose.yml', /CORE_CHAINCODE_BUILDER=hyperledger\/fabric-ccenv:2.0.0-alpha/);
            assert.fileContent('docker-compose.yml', /CORE_CHAINCODE_NODE_RUNTIME=hyperledger\/fabric-nodeenv:2.0.0-alpha/);
        } else {
            assert.fileContent('docker-compose.yml', /image: hyperledger\/fabric-orderer:1.4.1/);
            assert.fileContent('docker-compose.yml', /image: hyperledger\/fabric-peer:1.4.1/);
            assert.fileContent('docker-compose.yml', /image: hyperledger\/fabric-ca:1.4.1/);
            assert.fileContent('docker-compose.yml', /image: hyperledger\/fabric-couchdb:0.4.15/);
            assert.fileContent('docker-compose.yml', /CORE_CHAINCODE_GOLANG_RUNTIME=hyperledger\/fabric-baseos:0.4.15/);
            assert.fileContent('docker-compose.yml', /CORE_CHAINCODE_JAVA_RUNTIME=hyperledger\/fabric-javaenv:1.4.1/);
            assert.fileContent('docker-compose.yml', /CORE_CHAINCODE_BUILDER=hyperledger\/fabric-ccenv:1.4.1/);
            assert.fileContent('docker-compose.yml', /CORE_CHAINCODE_NODE_RUNTIME=hyperledger\/fabric-baseimage:0.4.15/);
        }
        assert.fileContent('gateways/local_fabric.json', /"url": "grpc:\/\/localhost:17051"/);
        assert.fileContent('gateways/local_fabric.json', /"url": "grpc:\/\/localhost:17051"/);
        assert.fileContent('generate.cmd', /for %%d in \(admin-msp configtx crypto-config wallets\\local_fabric_wallet\) do \(/);
        assert.fileContent('generate.cmd', /http:\/\/admin:adminpw@ca.org1.example.com:17054/);
        assert.fileContent('generate.js', /const identityPath = path.resolve\(__dirname, 'wallets', 'local_fabric_wallet', `\${identity.name}.json`\);/);
        assert.fileContent('generate.sh', /rm -fr admin-msp\/\* configtx\/\* crypto-config\/\* wallets\/local_fabric_wallet\/\*/);
        assert.fileContent('generate.sh', /http:\/\/admin:adminpw@ca.org1.example.com:17054/);

        if (version === '2.0.0-alpha') {
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:2.0.0-alpha chown -R \$\(id -u\):\$\(id -g\) .\/configtx .\/crypto-config .\/admin-msp/);
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:2.0.0-alpha cryptogen generate --config=.\/crypto-config.yaml/);
            assert.fileContent('generate.sh', /docker run --network localfabric_basic --rm -v \$PWD:\/etc\/hyperledger\/fabric hyperledger\/fabric-ca:2.0.0-alpha fabric-ca-client enroll -u http:\/\/admin:adminpw@ca.org1.example.com:17054 -M \/etc\/hyperledger\/fabric\/admin-msp/);
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:2.0.0-alpha configtxgen -profile OneOrgOrdererGenesis -outputBlock .\/configtx\/genesis.block -channelID ordererchannel/);
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:2.0.0-alpha configtxgen -profile OneOrgChannel -outputCreateChannelTx .\/configtx\/channel.tx -channelID \$CHANNEL_NAME/);
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:2.0.0-alpha configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate .\/configtx\/Org1MSPanchors.tx -channelID \$CHANNEL_NAME -asOrg Org1MSP/);
        } else {
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:1.4.1 chown -R \$\(id -u\):\$\(id -g\) .\/configtx .\/crypto-config .\/admin-msp/);
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:1.4.1 cryptogen generate --config=.\/crypto-config.yaml/);
            assert.fileContent('generate.sh', /docker run --network localfabric_basic --rm -v \$PWD:\/etc\/hyperledger\/fabric hyperledger\/fabric-ca:1.4.1 fabric-ca-client enroll -u http:\/\/admin:adminpw@ca.org1.example.com:17054 -M \/etc\/hyperledger\/fabric\/admin-msp/);
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:1.4.1 configtxgen -profile OneOrgOrdererGenesis -outputBlock .\/configtx\/genesis.block -channelID ordererchannel/);
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:1.4.1 configtxgen -profile OneOrgChannel -outputCreateChannelTx .\/configtx\/channel.tx -channelID \$CHANNEL_NAME/);
            assert.fileContent('generate.sh', /docker run --rm -v \$PWD:\/etc\/hyperledger\/fabric -w \/etc\/hyperledger\/fabric hyperledger\/fabric-tools:1.4.1 configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate .\/configtx\/Org1MSPanchors.tx -channelID \$CHANNEL_NAME -asOrg Org1MSP/);
        }
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
                subgenerator : 'network',
                name : 'local_fabric',
                dockerName : 'localfabric',
                orderer : '17050',
                peerRequest : '17051',
                peerChaincode : '17052',
                certificateAuthority : '17054',
                couchDB : '17055',
                logspout : '17056',
                version : '1.4.1'
            });
        testGeneratedNetwork('1.4.1');
    }).timeout(os.platform === 'win32' ? 60 * 1000 : undefined);

    it('should generate a network using options into a specified directory', async () => {
        const tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));
        fs.mkdirSync(tmpdir, {recursive : true});
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withOptions({
                subgenerator : 'network',
                name : 'local_fabric',
                dockerName : 'localfabric',
                orderer : '17050',
                peerRequest : '17051',
                peerChaincode : '17052',
                certificateAuthority : '17054',
                couchDB : '17055',
                logspout : '17056',
                destination : tmpdir,
                version : '2.0.0-alpha'
            });
        const cwd = process.cwd();
        process.chdir(tmpdir);
        try {
            testGeneratedNetwork('2.0.0-alpha');
        } finally {
            process.chdir(cwd);
        }
    }).timeout(os.platform === 'win32' ? 60 * 1000 : undefined);

});
