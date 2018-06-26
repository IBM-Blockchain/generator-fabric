# generator-fabric

Yeoman generator for Hyperledger Fabric.

This Yeoman generator can be used to generate chaincodes, or smart contracts, for Hyperledger Fabric. Chaincodes can be generated that are written in either Go or JavaScript, with experimental TypeScript support available as well.

## Installation

You must install Yeoman, which is easy:

    npm install -g yo

Then you can install this Yeoman generator, which is also easy:

    npm install -g generator-fabric

Done!

## Usage

Create a new directory for the chaincode:

    mkdir my-smart-contract

Change into the new directory for the chaincode:

    cd my-smart-contract

Create an empty git repository for the chaincode (optional, but recommended):

    git init

Run the Yeoman generator:

    yo fabric

If everything is installed successfully, then you should see prompts similar to the following:

    ? Please specify the generator to run: Chaincode
    This generator can also be run with: yo fabric:chaincode
    ? Please specify the chaincode language: JavaScript
    ? Please specify the chaincode name: my-smart-contract
    ? Please specify the chaincode version: 0.0.1
    ? Please specify the chaincode description: My Smart Contract
    ? Please specify the chaincode author: Simon Stone
    ? Please specify the chaincode license: Apache-2.0
    create package.json
    create .editorconfig
    create .eslintrc.js
    create .gitignore
    create index.js
    create start.js
    create lib/chaincode.js
    create test/chaincode.js

Alternatively, you can run the generator non-interactively, by specifying additional command line options:

    yo fabric:chaincode -- --language javascript --name my-smart-contract --version 0.0.1 --description "My Smart Contract" --author "Simon Stone" --license Apache-2.0