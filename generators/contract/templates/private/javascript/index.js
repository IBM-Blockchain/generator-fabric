/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

'use strict';

const <%= assetPascalCase %>Contract = require('./lib/<%= assetDashSeparator %>-contract');

module.exports.<%= assetPascalCase %>Contract = <%= assetPascalCase %>Contract;
module.exports.contracts = [ <%= assetPascalCase %>Contract ];
