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
const sinon = require('sinon');

describe('Network', () => {

    const sandbox = sinon.createSandbox();

    afterEach(() => {
        sandbox.restore();
    });

    function testGeneratedNetwork() {
        assert.file([
            'is_running.cmd',
            'is_running.sh',
            'kill_chaincode.cmd',
            'kill_chaincode.sh',
            'start.cmd',
            'start.sh',
            'stop.cmd',
            'stop.sh',
            'teardown.cmd',
            'teardown.sh'
        ]);
        assert.fileContent('is_running.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric Microfab" -q/);
        assert.fileContent('is_running.sh', /docker ps -f label=fabric-environment-name="local_fabric Microfab" -q/);
        // assert.fileContent('kill_chaincode.sh', /docker stop localfabric-peer0.org1.example.com/);
        // assert.fileContent('kill_chaincode.cmd', /docker stop localfabric-peer0.org1.example.com/);
        assert.fileContent('start.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric Microfab" -q -a/);
        assert.fileContent('start.sh', /docker ps -f label=fabric-environment-name="local_fabric Microfab" -q -a/);
        assert.fileContent('stop.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric Microfab" -q/);
        assert.fileContent('stop.sh', /docker ps -f label=fabric-environment-name="local_fabric Microfab" -q/);
        assert.fileContent('teardown.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric Microfab" -q -a/);
        assert.fileContent('teardown.cmd', /docker volume ls -f label\^=fabric-environment-name\^="local_fabric Microfab" -q/);
        assert.fileContent('teardown.sh', /docker ps -f label=fabric-environment-name="local_fabric Microfab" -q -a/);
        assert.fileContent('teardown.sh', /docker volume ls -f label=fabric-environment-name="local_fabric Microfab" -q/);
    }

    it('should generate a one organization network using prompts into a test directory', async () => {
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                subgenerator: 'network',
                name: 'local_fabric',
                dockerName: 'localfabric',
                port: 8080,
                numOrganizations: 1,
                fabricCapabilities: 'V2_0'
            });
        testGeneratedNetwork();
    }).timeout(os.platform === 'win32' ? 60 * 1000 : 10 * 1000);

    it('should generate a one organization network using options into a specified directory (v2)', async () => {
        const tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));
        fs.mkdirSync(tmpdir, { recursive: true });
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withOptions({
                subgenerator: 'network',
                destination: tmpdir,
                name: 'local_fabric',
                dockerName: 'localfabric',
                port: 8080,
                numOrganizations: 1,
                fabricCapabilities: 'V2_0'
            });
        const cwd = process.cwd();
        process.chdir(tmpdir);
        try {
            testGeneratedNetwork();
            // eslint-disable-next-line no-regex-spaces
            assert.fileContent('start.sh', /export MICROFAB_CONFIG='{"port":8080,  "endorsing_organizations": \[{"name": "Org1"}],"channels": \[{"name": "mychannel","endorsing_organizations": \["Org1"]}]}'/);
        } finally {
            process.chdir(cwd);
        }
    }).timeout(os.platform === 'win32' ? 60 * 1000 : 10 * 1000);


    it('should generate a one organization network using options into a specified directory (v1)', async () => {
        const tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));
        fs.mkdirSync(tmpdir, { recursive: true });
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withOptions({
                subgenerator: 'network',
                destination: tmpdir,
                name: 'local_fabric',
                dockerName: 'localfabric',
                port: 8080,
                numOrganizations: 1,
                fabricCapabilities: 'V1_4_2'
            });
        const cwd = process.cwd();
        process.chdir(tmpdir);
        try {
            testGeneratedNetwork();
            // eslint-disable-next-line no-regex-spaces
            assert.fileContent('start.sh', /export MICROFAB_CONFIG='{"port":8080, "capability_level": "V1_4_2", "endorsing_organizations": \[{"name": "Org1"}],"channels": \[{"name": "mychannel","endorsing_organizations": \["Org1"]}]}'/);
        } finally {
            process.chdir(cwd);
        }
    }).timeout(os.platform === 'win32' ? 60 * 1000 : 10 * 1000);

    it('should generate a two organization network using prompts into a test directory', async () => {
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                subgenerator: 'network',
                name: 'local_fabric',
                dockerName: 'localfabric',
                port: 8080,
                numOrganizations: 2,
                fabricCapabilities: 'V2_0'
            });
        testGeneratedNetwork();
    }).timeout(os.platform === 'win32' ? 60 * 1000 : 10 * 1000);
});
