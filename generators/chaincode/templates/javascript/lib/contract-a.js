/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const { Contract } = require('fabric-contract-api');

const assetType = 'WIDGETS';

class MyContract extends Contract {

    constructor(){
        super('org.example.mycontract');
    }

    async transactionA(ctx,assetid,value) {
        let key = ctx.stub.createCompositeKey(assetType,[assetid]);
        console.log(`[putState] ${key} === ${value.toString()}`);
        await ctx.stub.putState(key,value);
    }

    async transactionB(ctx,assetid) {
        let key = ctx.stub.createCompositeKey(assetType,[assetid]);
        let value = await ctx.stub.getState(key);
        console.log(`[getState] ${key} === ${value.toString()}`);
        return value;
    }

}

module.exports = MyContract;
