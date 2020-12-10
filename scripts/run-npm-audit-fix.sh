#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#
set -ex

fix_it() {
    pushd $1
    jq '.name = "test" | .version = "1.0.0"' package.json | sponge package.json
    if [ -f package-lock.json ]; then
        jq '.name = "test" | .version = "1.0.0"' package-lock.json | sponge package-lock.json
    fi
    npm install
    npm audit fix --force
    rm -rf node_modules
    jq '.name = "<%= name %>" | .version = "<%= version %>"' package.json | sponge package.json
    if [ -f package-lock.json ]; then
        jq '.name = "<%= name %>" | .version = "<%= version %>"' package-lock.json | sponge package-lock.json
    fi
    popd
}

for LANGUAGE in javascript typescript; do
    fix_it generators/chaincode/templates/${LANGUAGE}
done

for TYPE in default private; do
    for LANGUAGE in javascript typescript; do
        fix_it generators/contract/templates/v2/${TYPE}/${LANGUAGE}
    done
done