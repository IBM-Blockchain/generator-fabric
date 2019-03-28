#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set +ev
for volume in <%= name %>_orderer.example.com <%= name %>_ca.org1.example.com <%= name %>_peer0.org1.example.com <%= name %>_couchdb <%= name %>_logspout; do
  if docker volume inspect $volume > /dev/null 2>&1; then 
    exit 0
  fi
done
exit 1