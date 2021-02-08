#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev
CONTAINER=$(docker ps -f label=fabric-environment-name="<%= name %> Microfab" -q -a)
if [ -z "$CONTAINER" ]
then
    export MICROFAB_CONFIG='<%-microfabConfig%>'
    docker run -e MICROFAB_CONFIG --label fabric-environment-name="<%= name %> Microfab" -d -p <%-port%>:<%-port%> ibmcom/ibp-microfab:0.0.10
else
    docker start ${CONTAINER}
fi
sleep 2


exit 0