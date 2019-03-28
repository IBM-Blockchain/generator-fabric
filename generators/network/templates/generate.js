/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ordererNode = {
    short_name: 'orderer.example.com',
    name: 'orderer.example.com',
    url: 'grpc://localhost:<%= orderer %>',
    type: 'fabric-orderer',
    wallet: 'local_wallet',
    identity: 'admin',
    msp_id: 'OrdererMSP'
};

const peerNode = {
    short_name: 'peer0.org1.example.com',
    name: 'peer0.org1.example.com',
    url: 'grpc://localhost:<%= peerRequest %>',
    type: 'fabric-peer',
    wallet: 'local_wallet',
    identity: 'admin',
    msp_id: 'Org1MSP'
};

const certificateAuthorityNode = {
    short_name: 'ca.org1.example.com',
    name: 'ca.org1.example.com',
    url: 'http://localhost:<%= certificateAuthority %>',
    type: 'fabric-ca',
    ca_name: 'ca.org1.example.com',
    wallet: 'local_wallet',
    identity: 'admin',
    msp_id: 'Org1MSP'
};

const nodes = [
    ordererNode,
    peerNode,
    certificateAuthorityNode
];

for (const node of nodes) {
    const nodePath = path.resolve(__dirname, 'nodes', `${node.name}.json`);
    const nodeData = JSON.stringify(node, null, 4);
    fs.writeFileSync(nodePath, nodeData);
}

const wallets = [
    'local_wallet'
];

for (const wallet of wallets) {
    const walletPath = path.resolve(__dirname, 'wallets', wallet);
    fs.mkdirSync(walletPath);
}

const adminIdentityMspPath = path.resolve(__dirname, 'admin-msp');
const adminIdentityCertificatePath = path.resolve(adminIdentityMspPath, 'signcerts', 'cert.pem');
const adminIdentityKeystorePath = path.resolve(adminIdentityMspPath, 'keystore');
const adminIdentityKeyPath = fs.readdirSync(adminIdentityKeystorePath).filter(key => !key.startsWith('.')).map(key => path.resolve(adminIdentityKeystorePath, key))[0];
const adminIdentity = {
    name: 'admin',
    certificate: fs.readFileSync(adminIdentityCertificatePath, 'base64'),
    private_key: fs.readFileSync(adminIdentityKeyPath, 'base64'),
    msp_id: 'Org1MSP'
};

const identities = [
    adminIdentity
];

for (const identity of identities) {
    const identityPath = path.resolve(__dirname, 'wallets', 'local_wallet', `${identity.name}.json`);
    const identityData = JSON.stringify(identity, null, 4);
    fs.writeFileSync(identityPath, identityData);
}

const gateway = {
    name: '<%= name %>',
    version: '1.0.0',
    wallet: 'local_wallet',
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
            url: 'grpc://localhost:<%= peerRequest %>'
        }
    },
    certificateAuthorities: {
        'ca.org1.example.com': {
            url: 'http://localhost:<%= certificateAuthority %>',
            caName: 'ca.org1.example.com'
        }
    }
};

const gatewayPath = path.resolve(__dirname, 'gateways', '<%= name %>.json');
const gatewayData = JSON.stringify(gateway, null, 4);
fs.writeFileSync(gatewayPath, gatewayData);
