/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const crypto = require('crypto');
const fs = require('fs');
const helpers = require('yeoman-test');
const Mocha = require('mocha');
const os = require('os');
const path = require('path');
const sinon = require('sinon');
const yaml = require('js-yaml');

const oneOrgNetwork = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'one-org-network.yml'), 'utf8'));
const twoOrgNetwork = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'two-org-network.yml'), 'utf8'));

describe('Network', () => {

    const sandbox = sinon.createSandbox();

    afterEach(() => {
        sandbox.restore();
    });

    function testGeneratedNetwork() {
        assert.file([
            'generate.cmd',
            'generate.sh',
            'is_generated.cmd',
            'is_generated.sh',
            'is_running.cmd',
            'is_running.sh',
            'kill_chaincode.cmd',
            'kill_chaincode.sh',
            'playbook.yml',
            'requirements.yml',
            'start.cmd',
            'start.sh',
            'stop.cmd',
            'stop.sh',
            'teardown.cmd',
            'teardown.sh'
        ]);
        assert.fileContent('is_generated.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric" -q -a/);
        assert.fileContent('is_generated.cmd', /docker volume ls -f label\^=fabric-environment-name\^="local_fabric" -q/);
        assert.fileContent('is_generated.sh', /docker ps -f label=fabric-environment-name="local_fabric" -q -a/);
        assert.fileContent('is_generated.sh', /docker volume ls -f label=fabric-environment-name="local_fabric" -q/);
        assert.fileContent('is_running.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric" -q/);
        assert.fileContent('is_running.sh', /docker ps -f label=fabric-environment-name="local_fabric" -q/);
        // assert.fileContent('kill_chaincode.sh', /docker stop localfabric-peer0.org1.example.com/);
        // assert.fileContent('kill_chaincode.cmd', /docker stop localfabric-peer0.org1.example.com/);
        assert.fileContent('start.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric" -q -a/);
        assert.fileContent('start.sh', /docker ps -f label=fabric-environment-name="local_fabric" -q -a/);
        assert.fileContent('stop.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric" -q/);
        assert.fileContent('stop.sh', /docker ps -f label=fabric-environment-name="local_fabric" -q/);
        assert.fileContent('teardown.cmd', /docker ps -f label\^=fabric-environment-name\^="local_fabric" -q -a/);
        assert.fileContent('teardown.cmd', /docker volume ls -f label\^=fabric-environment-name\^="local_fabric" -q/);
        assert.fileContent('teardown.sh', /docker ps -f label=fabric-environment-name="local_fabric" -q -a/);
        assert.fileContent('teardown.sh', /docker volume ls -f label=fabric-environment-name="local_fabric" -q/);
    }

    it('should generate a one organization network using prompts into a test directory', async () => {
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                subgenerator: 'network',
                name: 'local_fabric',
                dockerName: 'localfabric',
                startPort: 17050,
                endPort: 17069,
                numOrganizations: 1
            });
        testGeneratedNetwork();
        const playbook = yaml.safeLoad(fs.readFileSync('playbook.yml', 'utf8'));
        playbook.should.deep.equal(oneOrgNetwork);
    }).timeout(os.platform === 'win32' ? 60 * 1000 : undefined);

    it('should generate a one organization network using options into a specified directory', async () => {
        const tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));
        fs.mkdirSync(tmpdir, { recursive: true });
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withOptions({
                subgenerator: 'network',
                destination: tmpdir,
                name: 'local_fabric',
                dockerName: 'localfabric',
                startPort: 17050,
                endPort: 17069,
                numOrganizations: 1
            });
        const cwd = process.cwd();
        process.chdir(tmpdir);
        try {
            testGeneratedNetwork();
            const playbook = yaml.safeLoad(fs.readFileSync('playbook.yml', 'utf8'));
            playbook.should.deep.equal(oneOrgNetwork);
        } finally {
            process.chdir(cwd);
        }
    }).timeout(os.platform === 'win32' ? 60 * 1000 : undefined);

    it('should generate a two organization network using prompts into a test directory', async () => {
        await helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                subgenerator: 'network',
                name: 'local_fabric',
                dockerName: 'localfabric',
                startPort: 17050,
                endPort: 17069,
                numOrganizations: 2
            });
        testGeneratedNetwork();
        const playbook = yaml.safeLoad(fs.readFileSync('playbook.yml', 'utf8'));
        playbook.should.deep.equal(twoOrgNetwork);
    }).timeout(os.platform === 'win32' ? 60 * 1000 : undefined);

    it('should throw an error if not ports specified when using prompts into a test directory', async () => {
        const errorStub = sandbox.stub(Mocha.Runner.prototype, 'uncaught');
        const promise = new Promise((resolve) => {
            errorStub.callsFake(resolve);
        });
        helpers.run(path.join(__dirname, '../generators/app'))
            .withPrompts({
                subgenerator: 'network',
                name: 'local_fabric',
                dockerName: 'localfabric',
                startPort: 17050,
                endPort: 17055,
                numOrganizations: 1
            });
        await promise;
        errorStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Error));
        const error = errorStub.args[0][0];
        error.message.should.match(/Could not allocate port as port range 17050-17055 exceeded/);
    }).timeout(os.platform === 'win32' ? 60 * 1000 : undefined);

});
