/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { IKeyModificationHistory, ProductKeyBatchRequest } from './product-key-batch-request';

@Info({ title: 'ProductKeyBatchRequestContract', description: 'Transaction record of key batch request by the developer to key batch publication by the Provider.' })
export class ProductKeyBatchRequestContract extends Contract {

    /**
     * Note that during upgrade, the chaincode Init function is called
     * to perform any data related updates or re-initialize it, so care
     * must be taken to avoid resetting states when upgrading chaincode.
     *
     * @param {Context} ctx the transactional context (implicit)
     */
    @Transaction(false)
    @Returns('boolean')
    public async Init(ctx: Context): Promise<boolean> {
        console.info('Calling chaincode (ProductKeyBatchRequestContract) Init()');
        return true;
    }

    /**
     * Check if the {ProductKeyBatchRequest} object with id already exist
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyBatchRequestId
     */
    @Transaction(false)
    @Returns('boolean')
    public async productKeyBatchRequestExists(ctx: Context, productKeyBatchRequestId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(productKeyBatchRequestId);
        return (!!buffer && buffer.length > 0);
    }

    /**
     * Create ProductKeyBatchRequest object
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyBatchRequestId
     * @param {String} publisher
     * @param {String} provider
     * @param {String} sku
     * @param {String} batchID
     * @param {Integer} quantity
     */
    @Transaction()
    public async createProductKeyBatchRequest(ctx: Context, productKeyBatchRequestId: string, publisher: string, provider: string, sku: string, batchID: string, quantity: number): Promise<void> {

        if (!productKeyBatchRequestId || !publisher || !provider || !sku || !batchID || !quantity || quantity <= 0) {
            throw new Error(`Invalid arguments: Values cannot be NULL. Quantity cannot be 0 or less than 0`);
        }

        const exists = await this.productKeyBatchRequestExists(ctx, productKeyBatchRequestId);
        if (exists) {
            throw new Error(`The product key batch request ${productKeyBatchRequestId} already exists`);
        }
        const productKeyBatchRequest = new ProductKeyBatchRequest();

        productKeyBatchRequest.Publisher = publisher;
        productKeyBatchRequest.Provider = provider;
        productKeyBatchRequest.Distributor = ctx.clientIdentity.getMSPID();

        productKeyBatchRequest.Status = 'Requested';
        productKeyBatchRequest.Writer = ctx.clientIdentity.getMSPID();
        productKeyBatchRequest.SKU = sku;
        productKeyBatchRequest.Quantity = quantity;
        productKeyBatchRequest.BatchID = batchID;
        const buffer = Buffer.from(JSON.stringify(productKeyBatchRequest));
        await ctx.stub.putState(productKeyBatchRequestId, buffer);
    }

    /**
     * Read ProductKeyBatchRequest object
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyBatchRequestId
     * @return {ProductKeyBatchRequest}
     */
    @Transaction(false)
    @Returns('ProductKeyBatchRequest')
    public async readProductKeyBatchRequest(ctx: Context, productKeyBatchRequestId: string): Promise<ProductKeyBatchRequest> {
        const exists = await this.productKeyBatchRequestExists(ctx, productKeyBatchRequestId);
        if (!exists) {
            throw new Error(`The product key batch request ${productKeyBatchRequestId} does not exist`);
        }

        const buffer = await ctx.stub.getState(productKeyBatchRequestId);
        const productKeyBatchRequest = JSON.parse(buffer.toString()) as ProductKeyBatchRequest;
        const clientMSP = ctx.clientIdentity.getMSPID();

        if (!(productKeyBatchRequest.Publisher.toLowerCase() === clientMSP.toLowerCase() || productKeyBatchRequest.Provider.toLowerCase() === clientMSP.toLowerCase() || productKeyBatchRequest.Distributor.toLowerCase() === clientMSP.toLowerCase())) {
            throw new Error(`${clientMSP} is not authorized to read the product key batch request (${productKeyBatchRequestId}).`);
        }

        return productKeyBatchRequest;
    }

    /**
     * Update ProductKeyBatchRequest.Status to Confirmed
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyBatchRequestId
     * @param {Integer} quantity
     */
    @Transaction()
    public async confirmProductKeyBatchRequest(ctx: Context, productKeyBatchRequestId: string, quantity: number): Promise<void> {
        if (quantity <= 0) {
            throw new Error(`Quantity cannot be 0 or less than 0`);
        }

        const exists = await this.productKeyBatchRequestExists(ctx, productKeyBatchRequestId);
        if (!exists) {
            throw new Error(`The product key batch request ${productKeyBatchRequestId} does not exist`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyBatchRequestId);
        const productKeyBatchRequest = JSON.parse(existingBuffer.toString()) as ProductKeyBatchRequest;
        const clientMSP = ctx.clientIdentity.getMSPID();

        if (productKeyBatchRequest.Publisher.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to confirm the product key batch request (${productKeyBatchRequestId}).`);
        }

        if (productKeyBatchRequest.Status !== 'Requested') {
            throw new Error(`The product key batch request (${productKeyBatchRequestId}) does not have a valid status; ${productKeyBatchRequest.Status}. The status should be 'Requested'.`);
        }

        productKeyBatchRequest.Status = 'Confirmed';
        productKeyBatchRequest.Writer = ctx.clientIdentity.getMSPID();
        productKeyBatchRequest.Quantity = quantity;
        const buffer = Buffer.from(JSON.stringify(productKeyBatchRequest));
        await ctx.stub.putState(productKeyBatchRequestId, buffer);
    }

    /**
     * Update ProductKeyBatchRequest.Status to Rejected
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyBatchRequestId
     * @param {String} comments
     */
    @Transaction()
    public async rejectProductKeyBatchRequest(ctx: Context, productKeyBatchRequestId: string, comments: string): Promise<void> {
        const exists = await this.productKeyBatchRequestExists(ctx, productKeyBatchRequestId);
        if (!exists) {
            throw new Error(`The product key batch request ${productKeyBatchRequestId} does not exist`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyBatchRequestId);
        const productKeyBatchRequest = JSON.parse(existingBuffer.toString()) as ProductKeyBatchRequest;
        const clientMSP = ctx.clientIdentity.getMSPID();

        if (productKeyBatchRequest.Publisher.toLowerCase() !== clientMSP.toLowerCase() || productKeyBatchRequest.Provider.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to reject the product key batch request (${productKeyBatchRequestId}).`);
        }

        if (productKeyBatchRequest.Status !== 'Requested') {
            throw new Error(`The product key batch request (${productKeyBatchRequestId}) does not have a valid status; ${productKeyBatchRequest.Status}. The status should be 'Requested'.`);
        }

        productKeyBatchRequest.Status = 'Rejected';
        productKeyBatchRequest.Comments = comments;
        productKeyBatchRequest.Writer = ctx.clientIdentity.getMSPID();
        const buffer = Buffer.from(JSON.stringify(productKeyBatchRequest));
        await ctx.stub.putState(productKeyBatchRequestId, buffer);
    }

    /**
     * Update ProductKeyBatchRequest.Status to Published
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyBatchRequestId
     * @param {String} batchRestrictions
     */
    @Transaction()
    public async publishProductKeyBatchRequest(ctx: Context, productKeyBatchRequestId: string, batchRestrictions: string): Promise<void> {
        const exists = await this.productKeyBatchRequestExists(ctx, productKeyBatchRequestId);
        if (!exists) {
            throw new Error(`The product key batch request ${productKeyBatchRequestId} does not exist`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyBatchRequestId);
        const productKeyBatchRequest = JSON.parse(existingBuffer.toString()) as ProductKeyBatchRequest;
        const clientMSP = ctx.clientIdentity.getMSPID();

        if (productKeyBatchRequest.Provider.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to publish the product key batch request (${productKeyBatchRequestId}).`);
        }

        if (productKeyBatchRequest.Status !== 'Confirmed') {
            throw new Error(`The product key batch request (${productKeyBatchRequestId}) does not have a valid status; ${productKeyBatchRequest.Status}. The status should be 'Confirmed'.`);
        }

        productKeyBatchRequest.Status = 'Published';
        productKeyBatchRequest.Writer = ctx.clientIdentity.getMSPID();
        productKeyBatchRequest.BatchRestrictions = batchRestrictions;

        // TODO: Add code to verify the number of publish the keys to blockchain here.

        const buffer = Buffer.from(JSON.stringify(productKeyBatchRequest));
        await ctx.stub.putState(productKeyBatchRequestId, buffer);
    }

    /**
     * Get the history of ProductKeyBatchRequest object
     *
     * If an error is thrown, the whole transaction will be rejected
     *
     * @param {Context} ctx the transactional context (implicit)
     * @param {String} productKeyBatchRequestId
     */
    @Transaction(false)
    @Returns('IKeyModificationHistory[]')
    public async getHistoryForProductKeyBatchRequest(ctx: Context, productKeyBatchRequestId: string): Promise<IKeyModificationHistory[]> {
        const exists = await this.productKeyBatchRequestExists(ctx, productKeyBatchRequestId);
        if (!exists) {
            throw new Error(`The product key batch request ${productKeyBatchRequestId} does not exist`);
        }

        const existingBuffer = await ctx.stub.getState(productKeyBatchRequestId);
        const productKeyBatchRequest = JSON.parse(existingBuffer.toString()) as ProductKeyBatchRequest;
        const clientMSP = ctx.clientIdentity.getMSPID();

        if (productKeyBatchRequest.Publisher.toLowerCase() !== clientMSP.toLowerCase() || productKeyBatchRequest.Provider.toLowerCase() !== clientMSP.toLowerCase() || productKeyBatchRequest.Distributor.toLowerCase() !== clientMSP.toLowerCase()) {
            throw new Error(`${clientMSP} is not authorized to read the product key batch request (${productKeyBatchRequestId}).`);
        }

        const iterator = await ctx.stub.getHistoryForKey(productKeyBatchRequestId);
        const result = [];
        let res = await iterator.next();
        while (!res.done) {
          if (res.value) {
            const obj = { tx_id: res.value.tx_id, timestamp: res.value.timestamp, value: JSON.parse(res.value.value.toString('utf8')) as ProductKeyBatchRequest } as IKeyModificationHistory;
            result.push(obj);
          }
          res = await iterator.next();
        }
        await iterator.close();
        return result;
    }

}
