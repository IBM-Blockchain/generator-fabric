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

import { Shim } from 'fabric-shim';
import { Chaincode } from '.';

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

describe('start', () => {

    afterEach(() => {
        sinon.restore();
        delete require.cache[require.resolve('../src/start')];
    });

    it('should work', () => {
        const startStub = sinon.stub(Shim, 'start');
        require('../src/start');
        startStub.should.have.been.calledOnceWithExactly(sinon.match.instanceOf(Chaincode));
    });

});
