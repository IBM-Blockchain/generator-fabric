/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class <%= assetPascalCase %> {

    @Property()
    public value: string;

}
