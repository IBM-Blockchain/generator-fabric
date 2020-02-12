/*
 * SPDX-License-Identifier: WTFPL
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');
const sinonChai = require('sinon-chai');
const chai = require('chai');
chai.should();
chai.use(sinonChai);

describe('Contract (TypeScript)', () => {
    let dir;

    let genericPackage = {
        name: 'my-typescript-contract',
        version: '0.0.1',
        description: 'My TypeScript Contract',
        main: 'dist/index.js',
        typings: 'dist/index.d.ts',
        engines: {
            node: '>=8',
            npm: '>=5'
        },
        scripts: {
            lint: 'tslint -c tslint.json \'src/**/*.ts\'',
            pretest: 'npm run lint',
            test: 'nyc mocha -r ts-node/register src/**/*.spec.ts',
            start: 'fabric-chaincode-node start',
            build: 'tsc',
            'build:watch': 'tsc -w',
            prepublishOnly: 'npm run build'
        },
        engineStrict: true,
        author: 'James Conga',
        license: 'WTFPL',
        dependencies: {
            'fabric-shim': '^1.4.4',
            'fabric-contract-api': '^1.4.4'
        },
        devDependencies: {
            '@types/chai': '^4.2.0',
            '@types/chai-as-promised': '^7.1.2',
            '@types/mocha': '^5.2.7',
            '@types/node': '^12.7.3',
            '@types/sinon': '^7.0.13',
            '@types/sinon-chai': '^3.2.3',
            chai: '^4.2.0',
            'chai-as-promised': '^7.1.1',
            mocha: '^6.2.0',
            nyc: '^14.1.1',
            sinon: '^7.4.1',
            'sinon-chai': '^3.3.0',
            'ts-node': '^8.3.0',
            tslint: '^5.19.0',
            typescript: '^3.6.2',
            winston: '^3.2.1'
        },
        nyc: {
            extension: [
                '.ts',
                '.tsx'
            ],
            exclude: [
                'coverage/**',
                'dist/**'
            ],
            reporter: [
                'text-summary',
                'html'
            ],
            all: true,
            'check-coverage': true,
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100
        }
    };

    let genericPDC = [
        {
            name: 'CollectionOne',
            policy: {
                identities: [
                    {
                        role: {
                            name: 'member',
                            mspId: 'Org1MSP'
                        }
                    }
                ],
                policy: {
                    '1-of': [
                        {
                            'signed-by': 0
                        }
                    ]
                }
            },
            requiredPeerCount: 1,
            maxPeerCount: 1,
            blockToLive: 0,
            memberOnlyRead: true
        }
    ];

    it('should generate a TypeScript project using prompts', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My Typescript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'src/my-private-conga.ts',
            'src/my-private-conga-contract.spec.ts',
            'src/my-private-conga-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json',
            'collections.json'
        ]);
    });

    it('should generate a TypeScript project using options', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/contract'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withOptions({language: 'typescript',
                contractType: 'private',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'src/my-private-conga.ts',
            'src/my-private-conga-contract.spec.ts',
            'src/my-private-conga-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json',
            'collections.json'
        ]);
    });

    it('should generate a private data collection file', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga',
                mspId: 'Org1MSP'
            });
        const pdcJSON = require(path.join(dir, 'collections.json'));
        console.log('pdc variable' + pdcJSON);
        pdcJSON.should.deep.equal(genericPDC);
    });

    it('should generate a node package file', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal(genericPackage);
    });

    it('should generate a private data contract', async () => {
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                contractType: 'private',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'myPrivateConga',
                mspId: 'Org1MSP'
            });
        assert.fileContent('src/my-private-conga.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/my-private-conga.ts', /export class MyPrivateConga {/);
        assert.fileContent('src/my-private-conga-contract.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/my-private-conga-contract.ts', /export class MyPrivateCongaContract extends Contract {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async myPrivateCongaExists\(ctx: Context, myPrivateCongaId: string\): Promise<boolean> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async createMyPrivateConga\(ctx: Context, myPrivateCongaId: string\): Promise<void> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async readMyPrivateConga\(ctx: Context, myPrivateCongaId: string\): Promise<string> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async updateMyPrivateConga\(ctx: Context, myPrivateCongaId: string\): Promise<void> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async deleteMyPrivateConga\(ctx: Context, myPrivateCongaId: string\): Promise<void> {/);
        assert.fileContent('src/my-private-conga-contract.ts', /public async verifyMyPrivateConga\(ctx: Context, myPrivateCongaId: string, objectToVerify: MyPrivateConga\): Promise<boolean> {/);
    });

});
