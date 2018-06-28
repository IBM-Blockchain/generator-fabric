'use strict';

const Chaincode = require('..');
const shim = require('fabric-shim');
const sinon = require('sinon');

require('chai').should();

describe('start', () => {

    afterEach(() => {
        sinon.restore();
        delete require.cache[require.resolve('../lib/start')];
    });

    it('should work', () => {
        sinon.stub(shim, 'start');
        require('../lib/start');
        sinon.assert.calledOnce(shim.start);
        sinon.assert.calledWith(shim.start, sinon.match.instanceOf(Chaincode));
    });

});
