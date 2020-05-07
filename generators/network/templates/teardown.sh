#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev
for CONTAINER in $(docker ps -f label=fabric-environment-name="<%= name %>" -q -a); do
    docker rm -f ${CONTAINER}
done
for VOLUME in $(docker volume ls -f label=fabric-environment-name="<%= name %>" -q); do
    docker volume rm -f ${VOLUME}
done
docker run --rm -v "$PWD":/network ibmblockchain/vscode-prereqs:issue-94 chown -R $(id -u):$(id -g) /network
if [ -d wallets ]; then
    for WALLET in $(ls wallets); do
        rm -rf wallets/${WALLET}
    done
fi
if [ -d gateways ]; then
    for GATEWAY in $(ls gateways); do
        rm -rf gateways/${GATEWAY}
    done
fi
if [ -d nodes ]; then
    for NODE in $(ls nodes); do
        rm -rf nodes/${NODE}
    done
fi
exit 0
