#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#
set -ex
for GENERATOR in chaincode contract; do
    for LANGUAGE in javascript typescript; do
        pushd generators/${GENERATOR}/templates/${LANGUAGE}
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
    done
done