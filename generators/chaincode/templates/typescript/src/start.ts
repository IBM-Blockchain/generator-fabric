/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import { Shim } from 'fabric-shim';
import { Chaincode } from '.';

Shim.start(new Chaincode());
