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
exit 0
