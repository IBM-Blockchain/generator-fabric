/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import { <%= assetPascalCase %>Contract } from './<%= assetDashSeparator %>-contract';
export { <%= assetPascalCase %>Contract } from './<%= assetDashSeparator %>-contract';

export const contracts: any[] = [ <%= assetPascalCase %>Contract ];
