#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev
fix_permissions () {
    docker run --rm -v "$PWD":/network ibmblockchain/vscode-prereqs:0.0.10 chown -R $(id -u):$(id -g) /network
}
trap fix_permissions EXIT
docker run --rm -v "$PWD":/network -v /var/run/docker.sock:/var/run/docker.sock --network host ibmblockchain/vscode-prereqs:0.0.10 ansible-playbook /network/playbook.yml