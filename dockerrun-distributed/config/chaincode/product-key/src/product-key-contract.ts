/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { ProductKey, ProductKeyPrivate } from './product-key';

@Info({ title: 'ProductKeyContract', description: 'Smart Contract to track the lineage of product-key records.' })
export class ProductKeyContract extends Contract {

    /**
     * Check if the {ProductKey} object with id exist
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     */
    @Transaction(false)
    @Returns('boolean')
    public async productKeyExists(ctx: Context, productKeyId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(productKeyId);
        return (!!buffer && buffer.length > 0);
    }

    /**
     * Check if the {ProductKeyPrivate} object with id exist in private collection
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} collectionName
     * @param {String} productKeyId
     */
    // @Transaction(false)
    // @Returns('boolean')
    public async productKeyExistsInCollection(ctx: Context, collectionName: string, productKeyId: string): Promise<boolean> {
        const buffer: Buffer = await ctx.stub.getPrivateDataHash(collectionName, productKeyId);
        return (!!buffer && buffer.length > 0);
    }

    /**
     * Create {ProductKey} and {ProductKeyPrivate} objects
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @param {String} distributor
     * @param {String} publisher
     * @param {String} keyNumber (transientData)
     * @param {String} batchID (transientData)
     * @param {String} sKU (transientData)
     */
    @Transaction()
    public async createProductKey(ctx: Context, productKeyId: string, distributor: string, publisher: string): Promise<void> {

        // required data check
        if (!productKeyId || !distributor || !publisher) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (!transientData || transientData.size < 3 || !transientData.has('keyNumber') || !transientData.has('batchID') || !transientData.has('sKU')) {
            throw new Error('The required data was not specified in transient data.');
        }
        // required data check

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) already exists.`);
        }

        const clientMSP = ctx.clientIdentity.getMSPID();
        const collectionName = `${distributor}-${clientMSP}-${publisher}`.toLowerCase();

        const exists: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (exists) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) already exist in collection (${collectionName}).`);
        }

        const productKey: ProductKey = new ProductKey();
        productKey.Provider = clientMSP;
        productKey.Distributor = distributor;
        productKey.Publisher = publisher;

        const productKeyPrivate: ProductKeyPrivate = new ProductKeyPrivate();
        productKeyPrivate.Writer = ctx.clientIdentity.getMSPID();
        productKeyPrivate.Status = 'Created';
        productKeyPrivate.KeyNumber = transientData.get('keyNumber').toString('utf8');
        productKeyPrivate.BatchID = transientData.get('batchID').toString('utf8');
        productKeyPrivate.SKU = transientData.get('sKU').toString('utf8');

        await ctx.stub.putPrivateData(collectionName, productKeyId, Buffer.from(JSON.stringify(productKeyPrivate)));
        await ctx.stub.putState(productKeyId, Buffer.from(JSON.stringify(productKey)));

    }

    /**
     * Allocate {ProductKeyPrivate} object to pool
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @param {String} distPoolID (transientData)
     */
    @Transaction()
    public async allocateProductKeyToPool(ctx: Context, productKeyId: string): Promise<void> {

        // required data check
        if (!productKeyId) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (!transientData || transientData.size !== 1 || !transientData.has('distPoolID')) {
            throw new Error('The required data was not specified in transient data.');
        }
        // required data check

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (!_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) does not exists.`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyId);
        const productKey = JSON.parse(existingBuffer.toString()) as ProductKey;

        const clientMSP = ctx.clientIdentity.getMSPID();

        // distributor has to call this transaction
        if (productKey.Distributor.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to allocate the product key (${productKeyId}) to pool.`);
        }

        const collectionName = `${productKey.Distributor}-${productKey.Provider}-${productKey.Publisher}`.toLowerCase();

        const _existsInCollection: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (!_existsInCollection) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) does not exists in collection (${collectionName}).`);
        }

        const _privateData: Buffer = await ctx.stub.getPrivateData(collectionName, productKeyId);
        const productKeyPrivate: ProductKeyPrivate = JSON.parse(_privateData.toString()) as ProductKeyPrivate;

        if (productKeyPrivate.Status !== 'Created') {
            throw new Error(`The product key object (${productKeyId}) does not have a valid status; ${productKeyPrivate.Status}. The status should be 'Created'.`);
        }

        productKeyPrivate.Writer = ctx.clientIdentity.getMSPID();
        productKeyPrivate.Status = 'PoolAllocated';
        productKeyPrivate.DistPoolID = transientData.get('distPoolID').toString('utf8');

        await ctx.stub.putPrivateData(collectionName, productKeyId, Buffer.from(JSON.stringify(productKeyPrivate)));

    }

    /**
     * Allocate {ProductKeyPrivate} object to sale
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @param {String} saleData (transientData)
     * @param {String} saleLocation (transientData)
     * @param {String} retailer (transientData)
     */
    @Transaction()
    public async allocateProductKeyToSale(ctx: Context, productKeyId: string): Promise<void> {

        // required data check
        if (!productKeyId) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (!transientData || transientData.size !== 3 || !transientData.has('saleData') || !transientData.has('saleLocation') || !transientData.has('retailer')) {
            throw new Error('The required data was not specified in transient data.');
        }
        // required data check

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (!_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) does not exists.`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyId);
        const productKey = JSON.parse(existingBuffer.toString()) as ProductKey;

        const clientMSP = ctx.clientIdentity.getMSPID();

        // distributor has to call this transaction
        if (productKey.Distributor.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to allocate the product key (${productKeyId}) to sale.`);
        }

        const collectionName = `${productKey.Distributor}-${productKey.Provider}-${productKey.Publisher}`.toLowerCase();

        const _existsInCollection: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (!_existsInCollection) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) does not exists in collection (${collectionName}).`);
        }

        const _privateData: Buffer = await ctx.stub.getPrivateData(collectionName, productKeyId);
        const productKeyPrivate: ProductKeyPrivate = JSON.parse(_privateData.toString()) as ProductKeyPrivate;

        if (productKeyPrivate.Status !== 'PoolAllocated') {
            throw new Error(`The product key object (${productKeyId}) does not have a valid status; ${productKeyPrivate.Status}. The status should be 'PoolAllocated'.`);
        }

        productKeyPrivate.Writer = ctx.clientIdentity.getMSPID();
        productKeyPrivate.Status = 'SaleAllocated';
        productKeyPrivate.SaleData = transientData.get('saleData').toString('utf8');
        productKeyPrivate.SaleLocation = transientData.get('saleLocation').toString('utf8');
        productKeyPrivate.Retailer = transientData.get('retailer').toString('utf8');

        await ctx.stub.putPrivateData(collectionName, productKeyId, Buffer.from(JSON.stringify(productKeyPrivate)));

    }

    /**
     * Deliver {ProductKeyPrivate} object to consumer
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @param {String} consumer (transientData)
     */
    @Transaction()
    public async deliverProductKeyToConsumer(ctx: Context, productKeyId: string): Promise<void> {

        // required data check
        if (!productKeyId) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (!transientData || transientData.size !== 1 || !transientData.has('consumer')) {
            throw new Error('The required data was not specified in transient data.');
        }
        // required data check

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (!_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) does not exists.`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyId);
        const productKey = JSON.parse(existingBuffer.toString()) as ProductKey;

        const clientMSP = ctx.clientIdentity.getMSPID();

        // TODO: change to retailer
        // distributor has to call this transaction
        if (productKey.Distributor.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to allocate the product key (${productKeyId}) to pool.`);
        }

        const collectionName = `${productKey.Distributor}-${productKey.Provider}-${productKey.Publisher}`.toLowerCase();

        const _existsInCollection: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (!_existsInCollection) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) does not exists in collection (${collectionName}).`);
        }

        const _privateData: Buffer = await ctx.stub.getPrivateData(collectionName, productKeyId);
        const productKeyPrivate: ProductKeyPrivate = JSON.parse(_privateData.toString()) as ProductKeyPrivate;

        if (productKeyPrivate.Status !== 'SaleAllocated') {
            throw new Error(`The product key object (${productKeyId}) does not have a valid status; ${productKeyPrivate.Status}. The status should be 'SaleAllocated'.`);
        }

        productKeyPrivate.Writer = ctx.clientIdentity.getMSPID();
        productKeyPrivate.Status = 'Delivered';
        productKeyPrivate.Consumer = transientData.get('consumer').toString('utf8');

        await ctx.stub.putPrivateData(collectionName, productKeyId, Buffer.from(JSON.stringify(productKeyPrivate)));

    }

    /**
     * Activate {ProductKeyPrivate} object
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @param {String} providerUserID (transientData)
     * @param {String} activationData (transientData)
     */
    @Transaction()
    public async activateProductKey(ctx: Context, productKeyId: string): Promise<void> {

        // required data check
        if (!productKeyId) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (!transientData || transientData.size !== 2 || !transientData.has('providerUserID') || !transientData.has('activationData')) {
            throw new Error('The required data was not specified in transient data.');
        }
        // required data check

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (!_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) does not exists.`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyId);
        const productKey = JSON.parse(existingBuffer.toString()) as ProductKey;

        const clientMSP = ctx.clientIdentity.getMSPID();

        // provider has to call this transaction
        if (productKey.Provider.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to allocate the product key (${productKeyId}) to pool.`);
        }

        const collectionName = `${productKey.Distributor}-${productKey.Provider}-${productKey.Publisher}`.toLowerCase();

        const _existsInCollection: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (!_existsInCollection) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) does not exists in collection (${collectionName}).`);
        }

        const _privateData: Buffer = await ctx.stub.getPrivateData(collectionName, productKeyId);
        const productKeyPrivate: ProductKeyPrivate = JSON.parse(_privateData.toString()) as ProductKeyPrivate;

        if (productKeyPrivate.Status !== 'Delivered') {
            throw new Error(`The product key object (${productKeyId}) does not have a valid status; ${productKeyPrivate.Status}. The status should be 'Delivered'.`);
        }

        productKeyPrivate.Writer = ctx.clientIdentity.getMSPID();
        productKeyPrivate.Status = 'Activated';
        productKeyPrivate.ProviderUserID = transientData.get('providerUserID').toString('utf8');
        productKeyPrivate.ActivationData = transientData.get('activationData').toString('utf8');

        await ctx.stub.putPrivateData(collectionName, productKeyId, Buffer.from(JSON.stringify(productKeyPrivate)));

    }

    /**
     * Request {ProductKeyPrivate} object destruction
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @param {String} comments (transientData)
     */
    @Transaction()
    public async requestProductKeyDestruction(ctx: Context, productKeyId: string): Promise<void> {

        // required data check
        if (!productKeyId) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (!transientData || transientData.size !== 1 || !transientData.has('comments')) {
            throw new Error('The required data was not specified in transient data.');
        }
        // required data check

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (!_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) does not exists.`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyId);
        const productKey = JSON.parse(existingBuffer.toString()) as ProductKey;

        const clientMSP = ctx.clientIdentity.getMSPID();

        // TODO: change to retailer
        // distributor has to call this transaction
        if (productKey.Distributor.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to allocate the product key (${productKeyId}) to pool.`);
        }

        const collectionName = `${productKey.Distributor}-${productKey.Provider}-${productKey.Publisher}`.toLowerCase();

        const _existsInCollection: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (!_existsInCollection) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) does not exists in collection (${collectionName}).`);
        }

        const _privateData: Buffer = await ctx.stub.getPrivateData(collectionName, productKeyId);
        const productKeyPrivate: ProductKeyPrivate = JSON.parse(_privateData.toString()) as ProductKeyPrivate;

        if (!['Created', 'PoolAllocated', 'SaleAllocated', 'Delivered'].includes(productKeyPrivate.Status)) {
            throw new Error(`The product key object (${productKeyId}) does not have a valid status; ${productKeyPrivate.Status}. The status should be one of 'Created' || 'PoolAllocated' || 'SaleAllocated' || 'Delivered'.`);
        }

        productKeyPrivate.Writer = ctx.clientIdentity.getMSPID();
        productKeyPrivate.Status = 'DestructionRequested';
        productKeyPrivate.Comments = transientData.get('comments').toString('utf8');

        await ctx.stub.putPrivateData(collectionName, productKeyId, Buffer.from(JSON.stringify(productKeyPrivate)));

    }

    /**
     * Reject {ProductKeyPrivate} object destruction request
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @param {String} comments (transientData)
     */
    @Transaction()
    public async rejectProductKeyDestruction(ctx: Context, productKeyId: string): Promise<void> {

        // required data check
        if (!productKeyId) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (!transientData || transientData.size !== 1 || !transientData.has('comments')) {
            throw new Error('The required data was not specified in transient data.');
        }
        // required data check

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (!_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) does not exists.`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyId);
        const productKey = JSON.parse(existingBuffer.toString()) as ProductKey;

        const clientMSP = ctx.clientIdentity.getMSPID();

        // publisher has to call this transaction
        if (productKey.Publisher.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to reject the product key (${productKeyId}) destruction request.`);
        }

        const collectionName = `${productKey.Distributor}-${productKey.Provider}-${productKey.Publisher}`.toLowerCase();

        const _existsInCollection: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (!_existsInCollection) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) does not exists in collection (${collectionName}).`);
        }

        const _privateData: Buffer = await ctx.stub.getPrivateData(collectionName, productKeyId);
        const productKeyPrivate: ProductKeyPrivate = JSON.parse(_privateData.toString()) as ProductKeyPrivate;

        if (productKeyPrivate.Status !== 'DestructionRequested') {
            throw new Error(`The product key object (${productKeyId}) does not have a valid status; ${productKeyPrivate.Status}. The status should be 'DestructionRequested'.`);
        }

        productKeyPrivate.Writer = ctx.clientIdentity.getMSPID();
        productKeyPrivate.Status = 'DestructionRejected';
        productKeyPrivate.Comments = transientData.get('comments').toString('utf8');

        await ctx.stub.putPrivateData(collectionName, productKeyId, Buffer.from(JSON.stringify(productKeyPrivate)));

    }

    /**
     * Destroy {ProductKeyPrivate} object on request
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @param {String} comments (transientData)
     */
    @Transaction()
    public async destroyProductKey(ctx: Context, productKeyId: string): Promise<void> {

        // required data check
        if (!productKeyId) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (!transientData || transientData.size !== 1 || !transientData.has('comments')) {
            throw new Error('The required data was not specified in transient data.');
        }
        // required data check

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (!_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) does not exists.`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyId);
        const productKey = JSON.parse(existingBuffer.toString()) as ProductKey;

        const clientMSP = ctx.clientIdentity.getMSPID();

        // publisher has to call this transaction
        if (productKey.Publisher.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to allocate the product key (${productKeyId}) to pool.`);
        }

        const collectionName = `${productKey.Distributor}-${productKey.Provider}-${productKey.Publisher}`.toLowerCase();

        const _existsInCollection: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (!_existsInCollection) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) does not exists in collection (${collectionName}).`);
        }

        const _privateData: Buffer = await ctx.stub.getPrivateData(collectionName, productKeyId);
        const productKeyPrivate: ProductKeyPrivate = JSON.parse(_privateData.toString()) as ProductKeyPrivate;

        if (productKeyPrivate.Status !== 'DestructionRequested') {
            throw new Error(`The product key object (${productKeyId}) does not have a valid status; ${productKeyPrivate.Status}. The status should be 'DestructionRequested'.`);
        }

        productKeyPrivate.Writer = ctx.clientIdentity.getMSPID();
        productKeyPrivate.Status = 'Destroyed';
        productKeyPrivate.Comments = transientData.get('comments').toString('utf8');

        await ctx.stub.putPrivateData(collectionName, productKeyId, Buffer.from(JSON.stringify(productKeyPrivate)));

    }

    /**
     * Read ProductKeyData object = ProductKey public and private data
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyId
     * @return {ProductKeyData}
     */
    @Transaction(false)
    @Returns('ProductKeyData')
    public async readProductKey(ctx: Context, productKeyId: string): Promise<string> {

        // required data check
        if (!productKeyId) {
            throw new Error(`Invalid arguments: Values cannot be NULL.`);
        }

        // ProductKey object exists?
        const _exists = await this.productKeyExists(ctx, productKeyId);
        if (!_exists) {
            throw new Error(`The ProductKey object (${productKeyId}) does not exists.`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyId);
        const productKey = JSON.parse(existingBuffer.toString()) as ProductKey;

        const clientMSP = ctx.clientIdentity.getMSPID();

        if (!(productKey.Distributor.toLowerCase() === clientMSP.toLowerCase() || productKey.Provider.toLowerCase() === clientMSP.toLowerCase() || productKey.Publisher.toLowerCase() === clientMSP.toLowerCase())) {
            throw new Error(`${clientMSP} is not authorized to read the product key (${productKeyId}) object.`);
        }

        const collectionName = `${productKey.Distributor}-${productKey.Provider}-${productKey.Publisher}`.toLowerCase();

        const _existsInCollection: boolean = await this.productKeyExistsInCollection(ctx, collectionName, productKeyId);
        if (!_existsInCollection) {
            throw new Error(`The ProductKeyPrivate object (${productKeyId}) does not exists in collection (${collectionName}).`);
        }

        const _privateData: Buffer = await ctx.stub.getPrivateData(collectionName, productKeyId);
        const productKeyPrivate: ProductKeyPrivate = JSON.parse(_privateData.toString()) as ProductKeyPrivate;

        const _object = { ...productKey, ...productKeyPrivate };
        return JSON.stringify(_object);
    }

}
