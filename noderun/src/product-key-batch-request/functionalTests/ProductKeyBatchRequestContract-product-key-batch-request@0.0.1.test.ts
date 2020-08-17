/*
* Use this file for functional testing of your smart contract.
* Fill out the arguments and return values for a function and
* use the CodeLens links above the transaction blocks to
* invoke/submit transactions.
* All transactions defined in your smart contract are used here
* to generate tests, including those functions that would
* normally only be used on instantiate and upgrade operations.
* This basic test file can also be used as the basis for building
* further functional tests to run as part of a continuous
* integration pipeline, or for debugging locally deployed smart
* contracts by invoking/submitting individual transactions.
*/
/*
* Generating this test file will also trigger an npm install
* in the smart contract project directory. This installs any
* package dependencies, including fabric-network, which are
* required for this test file to be run locally.
*/

import * as assert from 'assert';
import * as fabricNetwork from 'fabric-network';
import { SmartContractUtil } from './ts-smart-contract-util';

import * as os from 'os';
import * as path from 'path';

describe('ProductKeyBatchRequestContract-product-key-batch-request@0.0.1' , () => {

    const homedir: string = os.homedir();
    const walletPath: string = path.join(homedir, '.fabric-vscode', 'wallets', 'local_fabric_wallet');
    const gateway: fabricNetwork.Gateway = new fabricNetwork.Gateway();
    const fabricWallet: fabricNetwork.FileSystemWallet = new fabricNetwork.FileSystemWallet(walletPath);
    const identityName: string = 'admin';
    let connectionProfile: any;

    before(async () => {
        connectionProfile = await SmartContractUtil.getConnectionProfile();
    });

    beforeEach(async () => {
        const discoveryAsLocalhost: boolean = SmartContractUtil.hasLocalhostURLs(connectionProfile);
        const discoveryEnabled: boolean = true;

        const options: fabricNetwork.GatewayOptions = {
            discovery: {
                asLocalhost: discoveryAsLocalhost,
                enabled: discoveryEnabled,
            },
            identity: identityName,
            wallet: fabricWallet,
        };

        await gateway.connect(connectionProfile, options);
    });

    afterEach(async () => {
        gateway.disconnect();
    });

    describe('productKeyBatchRequestExists', () => {
        it('should submit productKeyBatchRequestExists transaction', async () => {
            // TODO: populate transaction parameters
            const productKeyBatchRequestId: string = 'EXAMPLE';
            const args: string[] = [ productKeyBatchRequestId];

            const response: Buffer = await SmartContractUtil.submitTransaction('ProductKeyBatchRequestContract', 'productKeyBatchRequestExists', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('createProductKeyBatchRequest', () => {
        it('should submit createProductKeyBatchRequest transaction', async () => {
            // TODO: populate transaction parameters
            const productKeyBatchRequestId: string = 'EXAMPLE';
            const sku: string = 'EXAMPLE';
            const publisherID: string = 'EXAMPLE';
            const providerID: string = 'EXAMPLE';
            const distributorID: string = 'EXAMPLE';
            const quantity: number = 0;
            const batchID: string = 'EXAMPLE';
            const args: string[] = [ productKeyBatchRequestId, sku, publisherID, providerID, distributorID, quantity.toString(), batchID];

            const response: Buffer = await SmartContractUtil.submitTransaction('ProductKeyBatchRequestContract', 'createProductKeyBatchRequest', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('readProductKeyBatchRequest', () => {
        it('should submit readProductKeyBatchRequest transaction', async () => {
            // TODO: populate transaction parameters
            const productKeyBatchRequestId: string = 'EXAMPLE';
            const args: string[] = [ productKeyBatchRequestId];

            const response: Buffer = await SmartContractUtil.submitTransaction('ProductKeyBatchRequestContract', 'readProductKeyBatchRequest', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('confirmProductKeyBatchRequest', () => {
        it('should submit confirmProductKeyBatchRequest transaction', async () => {
            // TODO: populate transaction parameters
            const productKeyBatchRequestId: string = 'EXAMPLE';
            const quantity: number = 0;
            const args: string[] = [ productKeyBatchRequestId, quantity.toString()];

            const response: Buffer = await SmartContractUtil.submitTransaction('ProductKeyBatchRequestContract', 'confirmProductKeyBatchRequest', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('rejectProductKeyBatchRequest', () => {
        it('should submit rejectProductKeyBatchRequest transaction', async () => {
            // TODO: populate transaction parameters
            const productKeyBatchRequestId: string = 'EXAMPLE';
            const args: string[] = [ productKeyBatchRequestId];

            const response: Buffer = await SmartContractUtil.submitTransaction('ProductKeyBatchRequestContract', 'rejectProductKeyBatchRequest', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('publishProductKeyBatchRequest', () => {
        it('should submit publishProductKeyBatchRequest transaction', async () => {
            // TODO: populate transaction parameters
            const productKeyBatchRequestId: string = 'EXAMPLE';
            const batchRestrictions: string = 'EXAMPLE';
            const args: string[] = [ productKeyBatchRequestId, batchRestrictions];

            const response: Buffer = await SmartContractUtil.submitTransaction('ProductKeyBatchRequestContract', 'publishProductKeyBatchRequest', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

});
