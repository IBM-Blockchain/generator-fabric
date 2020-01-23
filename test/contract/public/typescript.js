/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const path = require('path');

require('chai').should();

describe('Contract (TypeScript)', () => {

    it('should generate a TypeScript project using prompts (custom asset)', async () => {
        let dir;
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'conga'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'src/conga.ts',
            'src/conga-contract.spec.ts',
            'src/conga-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json'
        ]);
        assert.fileContent('src/conga.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/conga.ts', /export class Conga {/);
        assert.fileContent('src/conga-contract.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/conga-contract.ts', /export class CongaContract extends Contract {/);
        assert.fileContent('src/conga-contract.ts', /public async congaExists\(ctx: Context, congaId: string\): Promise<boolean> {/);
        assert.fileContent('src/conga-contract.ts', /public async createConga\(ctx: Context, congaId: string, value: string\): Promise<void> {/);
        assert.fileContent('src/conga-contract.ts', /public async readConga\(ctx: Context, congaId: string\): Promise<Conga> {/);
        assert.fileContent('src/conga-contract.ts', /public async updateConga\(ctx: Context, congaId: string, newValue: string\): Promise<void> {/);
        assert.fileContent('src/conga-contract.ts', /public async deleteConga\(ctx: Context, congaId: string\): Promise<void> {/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal({
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
        });
        const tsconfigJSON = require(path.join(dir, 'tsconfig.json'));
        tsconfigJSON.should.deep.equal({
            compilerOptions: {
                outDir: 'dist',
                target: 'es2017',
                moduleResolution: 'node',
                module: 'commonjs',
                declaration: true,
                sourceMap: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true
            },
            include: [
                './src/**/*'
            ],
            exclude: [
                './src/**/*.spec.ts'
            ]
        });
    });

    it('should generate a TypeScript project using prompts (default asset)', async () => {
        let dir;
        await helpers.run(path.join(__dirname, '../../../generators/app'))
            .inTmpDir((dir_) => {
                dir = dir_;
            })
            .withPrompts({
                subgenerator: 'contract',
                language: 'typescript',
                name: 'my-typescript-contract',
                version: '0.0.1',
                description: 'My TypeScript Contract',
                author: 'James Conga',
                license: 'WTFPL',
                asset: 'MyAsset'
            });
        assert.file([
            '.vscode/extensions.json',
            '.vscode/launch.json',
            'src/my-asset.ts',
            'src/my-asset-contract.spec.ts',
            'src/my-asset-contract.ts',
            'src/index.ts',
            '.editorconfig',
            '.gitignore',
            '.npmignore',
            'package.json',
            'tsconfig.json',
            'tslint.json'
        ]);
        assert.fileContent('src/my-asset.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/my-asset.ts', /export class MyAsset {/);
        assert.fileContent('src/my-asset-contract.ts', /SPDX-License-Identifier: WTFPL/);
        assert.fileContent('src/my-asset-contract.ts', /export class MyAssetContract extends Contract {/);
        assert.fileContent('src/my-asset-contract.ts', /public async myAssetExists\(ctx: Context, myAssetId: string\): Promise<boolean> {/);
        assert.fileContent('src/my-asset-contract.ts', /public async createMyAsset\(ctx: Context, myAssetId: string, value: string\): Promise<void> {/);
        assert.fileContent('src/my-asset-contract.ts', /public async readMyAsset\(ctx: Context, myAssetId: string\): Promise<MyAsset> {/);
        assert.fileContent('src/my-asset-contract.ts', /public async updateMyAsset\(ctx: Context, myAssetId: string, newValue: string\): Promise<void> {/);
        assert.fileContent('src/my-asset-contract.ts', /public async deleteMyAsset\(ctx: Context, myAssetId: string\): Promise<void> {/);
        const packageJSON = require(path.join(dir, 'package.json'));
        packageJSON.should.deep.equal({
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
        });
        const tsconfigJSON = require(path.join(dir, 'tsconfig.json'));
        tsconfigJSON.should.deep.equal({
            compilerOptions: {
                outDir: 'dist',
                target: 'es2017',
                moduleResolution: 'node',
                module: 'commonjs',
                declaration: true,
                sourceMap: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true
            },
            include: [
                './src/**/*'
            ],
            exclude: [
                './src/**/*.spec.ts'
            ]
        });
    });

});
