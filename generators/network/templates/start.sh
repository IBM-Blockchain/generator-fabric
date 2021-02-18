#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

CUSTOM_IMAGE=$@
if [ -z "$CUSTOM_IMAGE" ]
then
    START_IMAGE="ibmcom/ibp-microfab:0.0.11"
else
    START_IMAGE=$CUSTOM_IMAGE
fi

echo "Using image: $START_IMAGE"

CONTAINER=$(docker ps -f label=fabric-environment-name="<%= name %> Microfab" -q -a)
if [ -z "$CONTAINER" ]
then
    export MICROFAB_CONFIG='<%-microfabConfig%>'
    docker run -e MICROFAB_CONFIG --label fabric-environment-name="<%= name %> Microfab" -d -p <%-port%>:<%-port%> $START_IMAGE
else
    docker start ${CONTAINER}
fi
sleep 2


exit 0