#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set +ev
for volume in <%= dockerName %>_orderer.example.com <%= dockerName %>_ca.org1.example.com <%= dockerName %>_peer0.org1.example.com <%= dockerName %>_couchdb; do
  if ! docker volume inspect $volume > /dev/null 2>&1; then 
    exit 1
  fi
done
exit 0