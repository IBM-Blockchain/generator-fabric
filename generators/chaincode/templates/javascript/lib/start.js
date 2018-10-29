/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

'use strict';

const { Shim } = require('fabric-shim');
const { Chaincode } = require('..');

Shim.start(new Chaincode());
