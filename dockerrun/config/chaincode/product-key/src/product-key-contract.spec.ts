/*
 * SPDX-License-Identifier: Apache-2.0
 */

// tslint:disable: no-unused-expression
import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { ProductKeyContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import crypto = require('crypto');
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity, {
        getMSPID: 'TestMSP',
    });
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
    };
}

describe('ProductKeyContract', () => {

    let contract: ProductKeyContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new ProductKeyContract();
        ctx = new TestContext();
    });

    describe('#productKeyExists', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('001').resolves(Buffer.from('{"Distributor":"a","Provider":"a","Publisher":"a"}'));
            ctx.stub.getPrivateData.withArgs('col001', '001').resolves(Buffer.from('{"Status":"Created"}'));
            const hashToVerify001 = crypto.createHash('sha256').update('{"Status":"OK"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('col001', '001').resolves(Buffer.from(hashToVerify001, 'hex'));
        });

        it('should return true, product key exits', async () => {
            await contract.productKeyExists(ctx, '001').should.eventually.be.true;
        });

        it('should return false, product key does not exists', async () => {
            await contract.productKeyExists(ctx, '001.xx').should.eventually.be.false;
        });
    });

    describe('#productKeyExistsInCollection', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('001').resolves(Buffer.from('{"Distributor":"a","Provider":"a","Publisher":"a"}'));
            ctx.stub.getPrivateData.withArgs('col001', '001').resolves(Buffer.from('{"Status":"Created"}'));
            const hashToVerify001 = crypto.createHash('sha256').update('{"Status":"OK"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('col001', '001').resolves(Buffer.from(hashToVerify001, 'hex'));
        });

        it('should return true, product key exits in collection', async () => {
            await contract.productKeyExistsInCollection(ctx, 'col001', '001').should.eventually.be.true;
        });

        it('should return false, product key does not exists in collection', async () => {
            await contract.productKeyExistsInCollection(ctx, 'col001', '001.xx').should.eventually.be.false;
        });
    });

    describe('#createProductKey', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('001').resolves(Buffer.from('{"Distributor":"a","Provider":"a","Publisher":"a"}'));
            ctx.stub.getPrivateData.withArgs('col001', '001').resolves(Buffer.from('{"Status":"Created"}'));
            const hashToVerify001 = crypto.createHash('sha256').update('{"Status":"OK"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('col001', '001').resolves(Buffer.from(hashToVerify001, 'hex'));
        });

        it('should throw an error, product key already exists', async () => {
            await contract.createProductKey(ctx, '001', 'iamdistributor', 'iampublisher').should.be.rejected;
        });

        it('should throw an error, product key already exists in private collection', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('keyNumber', Buffer.from('keyNumber'));
            transientMap.set('batchID', Buffer.from('batchID'));
            transientMap.set('sKU', Buffer.from('sKU'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.createProductKey(ctx, '001', 'iamdistributor', 'iampublisher').should.be.rejectedWith(`already exists`);
        });

        it('should throw an error, transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            ctx.stub.getTransient.returns(transientMap);
            await contract.createProductKey(ctx, '001.1', 'iamdistributor', 'iampublisher').should.be.rejectedWith(`required data was not specified in transient data`);
        });

        it('should throw an error, keyNumber (transient data) is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            // transientMap.set('keyNumber', Buffer.from('keyNumber'));
            transientMap.set('batchID', Buffer.from('batchID'));
            transientMap.set('sKU', Buffer.from('sKU'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.createProductKey(ctx, '001.1', 'iamdistributor', 'iampublisher').should.be.rejectedWith(`required data was not specified in transient data`);
        });

        it('should throw an error, batchID (transient data) is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('keyNumber', Buffer.from('keyNumber'));
            // transientMap.set('batchID', Buffer.from('batchID'));
            transientMap.set('sKU', Buffer.from('sKU'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.createProductKey(ctx, '001.1', 'iamdistributor', 'iampublisher').should.be.rejectedWith(`required data was not specified in transient data`);
        });

        it('should throw an error, sKU (transient data) is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('keyNumber', Buffer.from('keyNumber'));
            transientMap.set('batchID', Buffer.from('batchID'));
            // transientMap.set('sKU', Buffer.from('sKU'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.createProductKey(ctx, '001.1', 'iamdistributor', 'iampublisher').should.be.rejectedWith(`required data was not specified in transient data`);
        });

        it('should create a product key object', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('keyNumber', Buffer.from('keyNumber'));
            transientMap.set('batchID', Buffer.from('batchID'));
            transientMap.set('sKU', Buffer.from('sKU'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.createProductKey(ctx, '001.1', 'iamdistributor', 'iampublisher').should.be.ok;
        });

    });

    describe('#allocateProductKeyToPool', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('002.1').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));

            ctx.stub.getState.withArgs('002').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '002').resolves(Buffer.from('{"Status":"Created"}'));
            const hashToVerify002 = crypto.createHash('sha256').update('{"Status":"Created"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '002').resolves(Buffer.from(hashToVerify002, 'hex'));

            ctx.stub.getState.withArgs('0021').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '0021').resolves(Buffer.from('{"Status":"Err"}'));
            const hashToVerify0021 = crypto.createHash('sha256').update('{"Status":"Created"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '0021').resolves(Buffer.from(hashToVerify0021, 'hex'));
        });

        it('should throw an error, transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToPool(ctx, '002').should.be.rejectedWith('required data was not specified in transient data');
        });

        it('should throw an error, product key does not exists', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('distPoolID', Buffer.from('distPoolID'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.allocateProductKeyToPool(ctx, '002.1').should.be.rejected;
        });

        it('should throw an error, product key does exists in private collection', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('distPoolID', Buffer.from('distPoolID'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.allocateProductKeyToPool(ctx, '002.1').should.be.rejectedWith('does not exists in collection');
        });

        it('should throw an error, not a valid distributor', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('distPoolID', Buffer.from('distPoolID'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToPool(ctx, '002').should.be.rejectedWith('is not authorized to');
        });

        it('should throw an error, product key status is not valid', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('distPoolID', Buffer.from('distPoolID'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.allocateProductKeyToPool(ctx, '0021').should.be.rejectedWith('does not have a valid status');
        });

        it('should throw an error, not registered as distributor for this product key', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('distPoolID', Buffer.from('distPoolID'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('DErr');
            await contract.allocateProductKeyToPool(ctx, '002').should.be.rejectedWith('is not authorized to');
        });

        it('should allocate the product key to dist-pool', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('distPoolID', Buffer.from('distPoolID'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.allocateProductKeyToPool(ctx, '002').should.be.ok;
        });

    });

    describe('#allocateProductKeyToSale', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('003.1').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));

            ctx.stub.getState.withArgs('003').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '003').resolves(Buffer.from('{"Status":"PoolAllocated"}'));
            const hashToVerify003 = crypto.createHash('sha256').update('{"Status":"Created"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '003').resolves(Buffer.from(hashToVerify003, 'hex'));

            ctx.stub.getState.withArgs('0031').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '0031').resolves(Buffer.from('{"Status":"Created"}'));
            const hashToVerify0031 = crypto.createHash('sha256').update('{"Status":"Created"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '0031').resolves(Buffer.from(hashToVerify0031, 'hex'));
        });

        it('should throw an error, transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToSale(ctx, '003').should.be.rejectedWith('required data was not specified in transient data');
        });

        it('should throw an error, saleData transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            // transientMap.set('saleData', Buffer.from('saleData'));
            transientMap.set('saleLocation', Buffer.from('saleLocation'));
            transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToSale(ctx, '003').should.be.rejectedWith('required data was not specified in transient data');
        });

        it('should throw an error, saleLocation transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('saleData', Buffer.from('saleData'));
            // transientMap.set('saleLocation', Buffer.from('saleLocation'));
            transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToSale(ctx, '003').should.be.rejectedWith('required data was not specified in transient data');
        });

        it('should throw an error, retailer transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('saleData', Buffer.from('saleData'));
            transientMap.set('saleLocation', Buffer.from('saleLocation'));
            // transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToSale(ctx, '003').should.be.rejectedWith('required data was not specified in transient data');
        });

        it('should throw an error, product key does not exists', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('saleData', Buffer.from('saleData'));
            transientMap.set('saleLocation', Buffer.from('saleLocation'));
            transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.allocateProductKeyToSale(ctx, '003.1').should.be.rejectedWith('does not exists');
        });

        it('should throw an error, product key does exists in private collection', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('saleData', Buffer.from('saleData'));
            transientMap.set('saleLocation', Buffer.from('saleLocation'));
            transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.allocateProductKeyToSale(ctx, '003.1').should.be.rejectedWith('does not exists in collection');
        });

        it('should throw an error, product key distributor has to call this transaction', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('saleData', Buffer.from('saleData'));
            transientMap.set('saleLocation', Buffer.from('saleLocation'));
            transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToSale(ctx, '003').should.be.rejectedWith('is not authorized to');
        });

        it('should throw an error, not registered as distributor for this product key', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('saleData', Buffer.from('saleData'));
            transientMap.set('saleLocation', Buffer.from('saleLocation'));
            transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('DErr');
            await contract.allocateProductKeyToSale(ctx, '003').should.be.rejectedWith('is not authorized to');
        });

        it('should throw an error, product key status is not valid', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('saleData', Buffer.from('saleData'));
            transientMap.set('saleLocation', Buffer.from('saleLocation'));
            transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.allocateProductKeyToSale(ctx, '0031').should.be.rejectedWith('does not have a valid status');
        });

        it('should allocate the product key to sale', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('saleData', Buffer.from('saleData'));
            transientMap.set('saleLocation', Buffer.from('saleLocation'));
            transientMap.set('retailer', Buffer.from('retailer'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.allocateProductKeyToSale(ctx, '003').should.be.ok;
        });

    });

    describe('#requestProductKeyDestruction', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('004.1').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));

            ctx.stub.getState.withArgs('004').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '004').resolves(Buffer.from('{"Status":"Delivered"}'));
            const hashToVerify004 = crypto.createHash('sha256').update('{"Status":"Delivered"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '004').resolves(Buffer.from(hashToVerify004, 'hex'));

            ctx.stub.getState.withArgs('0041').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '0041').resolves(Buffer.from('{"Status":"Activated"}'));
            const hashToVerify0041 = crypto.createHash('sha256').update('{"Status":"Activated"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '0041').resolves(Buffer.from(hashToVerify0041, 'hex'));
        });

        it('should throw an error, comments transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToSale(ctx, '004').should.be.rejectedWith('required data was not specified in transient data');
        });

        it('should throw an error, product key does not exists', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.requestProductKeyDestruction(ctx, '004.1').should.be.rejectedWith('does not exists');
        });

        it('should throw an error, product key does exists in private collection', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.requestProductKeyDestruction(ctx, '004.1').should.be.rejectedWith('does not exists in collection');
        });

        it('should throw an error, not registered as distributor for this product key', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.requestProductKeyDestruction(ctx, '004').should.be.rejectedWith('is not authorized to');
        });

        it('should throw an error distributor not allowed', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('DErr');
            await contract.requestProductKeyDestruction(ctx, '004').should.be.rejectedWith('is not authorized to');
        });

        it('should throw an error, product key status is not valid', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.requestProductKeyDestruction(ctx, '0041').should.be.rejectedWith('does not have a valid status');
        });

        it('should be able to request product key destruction', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.requestProductKeyDestruction(ctx, '004').should.be.ok;
        });

    });

    describe('#rejectProductKeyDestruction', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('005.1').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));

            ctx.stub.getState.withArgs('005').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '005').resolves(Buffer.from('{"Status":"DestructionRequested"}'));
            const hashToVerify005 = crypto.createHash('sha256').update('{"Status":"DestructionRequested"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '005').resolves(Buffer.from(hashToVerify005, 'hex'));

            ctx.stub.getState.withArgs('0051').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '0051').resolves(Buffer.from('{"Status":"Created"}'));
            const hashToVerify0051 = crypto.createHash('sha256').update('{"Status":"Created"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '0051').resolves(Buffer.from(hashToVerify0051, 'hex'));
        });

        it('should throw an error, comments transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToSale(ctx, '005').should.be.rejectedWith('required data was not specified in transient data');
        });

        it('should throw an error, product key does not exists', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iampublisher');
            await contract.rejectProductKeyDestruction(ctx, '005.1').should.be.rejectedWith('does not exists');
        });

        it('should throw an error, product key does exists in private collection', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iampublisher');
            await contract.rejectProductKeyDestruction(ctx, '005.1').should.be.rejectedWith('does not exists in collection');
        });

        it('should throw an error, valid publisher has to call this transaction', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.rejectProductKeyDestruction(ctx, '005').should.be.rejectedWith('is not authorized to');
        });

        it('should throw an error, not registered as publisher for this product key', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('Prr');
            await contract.rejectProductKeyDestruction(ctx, '005').should.be.rejectedWith('is not authorized to');
        });

        it('should throw an error, product key status is not valid', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iampublisher');
            await contract.rejectProductKeyDestruction(ctx, '0051').should.be.rejectedWith('does not have a valid status');
        });

        it('should be able to reject product key destruction request', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iampublisher');
            await contract.rejectProductKeyDestruction(ctx, '005').should.be.ok;
        });

    });

    describe('#destroyProductKey', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('006.1').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));

            ctx.stub.getState.withArgs('006').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '006').resolves(Buffer.from('{"Status":"DestructionRequested"}'));
            const hashToVerify006 = crypto.createHash('sha256').update('{"Status":"DestructionRequested"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '006').resolves(Buffer.from(hashToVerify006, 'hex'));

            ctx.stub.getState.withArgs('0061').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '0061').resolves(Buffer.from('{"Status":"Created"}'));
            const hashToVerify0061 = crypto.createHash('sha256').update('{"Status":"Created"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '0061').resolves(Buffer.from(hashToVerify0061, 'hex'));
        });

        it('should throw an error, comments transient data is not provided', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.allocateProductKeyToSale(ctx, '006').should.be.rejectedWith('required data was not specified in transient data');
        });

        it('should throw an error, valid publisher has to call this transaction', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.destroyProductKey(ctx, '006').should.be.rejectedWith('is not authorized to');
        });

        it('should throw an error, product key does not exists', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iampublisher');
            await contract.destroyProductKey(ctx, '006.1').should.be.rejectedWith('does not exists');
        });

        it('should throw an error, product key does exists in private collection', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iampublisher');
            await contract.destroyProductKey(ctx, '006.1').should.be.rejectedWith('does not exists in collection');
        });

        it('should throw an error, product key status is not valid', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iampublisher');
            await contract.destroyProductKey(ctx, '0061').should.be.rejectedWith('does not have a valid status');
        });

        it('should be able to destroy the product key', async () => {
            const transientMap: Map<string, Buffer> = new Map<string, Buffer>();
            transientMap.set('comments', Buffer.from('comments'));
            ctx.stub.getTransient.returns(transientMap);
            ctx.clientIdentity.getMSPID.returns('iampublisher');
            await contract.destroyProductKey(ctx, '006').should.be.ok;
        });

    });

    describe('#readProductKey', () => {

        beforeEach(() => {
            ctx.stub.getState.withArgs('007.1').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));

            ctx.stub.getState.withArgs('007').resolves(Buffer.from('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher"}'));
            ctx.stub.getPrivateData.withArgs('iamdistributor-iamprovider-iampublisher', '007').resolves(Buffer.from('{"Status":"DestructionRequested"}'));
            const hashToVerify007 = crypto.createHash('sha256').update('{"Status":"DestructionRequested"}').digest('hex');
            ctx.stub.getPrivateDataHash.withArgs('iamdistributor-iamprovider-iampublisher', '007').resolves(Buffer.from(hashToVerify007, 'hex'));
        });

        it('should throw an error, product key does not exists', async () => {
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.readProductKey(ctx, '007.1').should.be.rejectedWith('does not exists');
        });

        it('should throw an error, product key does exists in private collection', async () => {
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.readProductKey(ctx, '007.1').should.be.rejectedWith('does not exists in collection');
        });

        it('should throw an error, valid participant has to call this transaction', async () => {
            await contract.readProductKey(ctx, '007').should.be.rejectedWith('is not authorized to');
        });

        it('should return a product key', async () => {
            ctx.clientIdentity.getMSPID.returns('iamdistributor');
            await contract.readProductKey(ctx, '007').should.eventually.equal('{"Distributor":"iamdistributor","Provider":"iamprovider","Publisher":"iampublisher","Status":"DestructionRequested"}');
            ctx.stub.getPrivateData.should.have.been.calledWithExactly('iamdistributor-iamprovider-iampublisher', '007');
        });

    });

});
