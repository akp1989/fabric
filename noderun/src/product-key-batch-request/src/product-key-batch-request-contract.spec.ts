/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { ProductKeyBatchRequestContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('ProductKeyBatchRequestContract', () => {

    let contract: ProductKeyBatchRequestContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new ProductKeyBatchRequestContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"BatchID":"a","DistributorID":"a","ProviderID":"a","PublisherID":"a","Quantity":1,"SKU":"a","Status":"Requested"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"BatchID":"a","DistributorID":"a","ProviderID":"a","PublisherID":"a","Quantity":1,"SKU":"a","Status":"Requested"}'));
    });

    describe('#productKeyBatchRequestExists', () => {

        it('should return false for if product key batch request id is not provided', async () => {
            await contract.productKeyBatchRequestExists(ctx, '').should.eventually.be.false;
        });

        it('should return true for a product key batch request', async () => {
            await contract.productKeyBatchRequestExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a product key batch request that does not exist', async () => {
            await contract.productKeyBatchRequestExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createProductKeyBatchRequest', () => {

        it('should create a product key batch request', async () => {
            await contract.createProductKeyBatchRequest(ctx, '2001', 'b', 'b', 'b', 'b', 1);
            ctx.stub.putState.should.have.been.calledOnceWithExactly('2001', Buffer.from('{"Status":"Requested","SKU":"b","PublisherID":"b","ProviderID":"b","Quantity":1,"BatchID":"b"}'));
        });

        it('should throw an error for a product key batch request that already exists', async () => {
            await contract.createProductKeyBatchRequest(ctx, '1001', 'b', 'b', 'b', 'b', 1).should.be.rejectedWith(/The product key batch request 1001 already exists/);
        });

    });

/*
    describe('#readProductKeyBatchRequest', () => {

        it('should return a product key batch request', async () => {
            await contract.readProductKeyBatchRequest(ctx, '1001').should.eventually.deep.equal('{"BatchID":"a","DistributorID":"a","ProviderID":"a","PublisherID":"a","Quantity":1,"SKU":"a","Status":"Requested"}');
        });

        it('should throw an error for a product key batch request that does not exist', async () => {
            await contract.readProductKeyBatchRequest(ctx, '1003').should.be.rejectedWith(/The product key batch request 1003 does not exist/);
        });

    });

    describe('#updateProductKeyBatchRequest', () => {

        it('should update a product key batch request', async () => {
            await contract.updateProductKeyBatchRequest(ctx, '1001', 'product key batch request 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"product key batch request 1001 new value"}'));
        });

        it('should throw an error for a product key batch request that does not exist', async () => {
            await contract.updateProductKeyBatchRequest(ctx, '1003', 'product key batch request 1003 new value').should.be.rejectedWith(/The product key batch request 1003 does not exist/);
        });

    });
*/

});
