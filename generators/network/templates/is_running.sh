#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set +ev
for container in <%= name %>_orderer.example.com <%= name %>_ca.org1.example.com <%= name %>_peer0.org1.example.com <%= name %>_couchdb <%= name %>_logspout; do
  running=$(docker inspect -f '{{.State.Running}}' $container 2>/dev/null)
  if [ "$?" != "0" ]; then 
    exit 1
  elif [ "${running}" != "true" ]; then 
    exit 1
  fi
done
exit 0