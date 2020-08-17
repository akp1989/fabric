/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';
import { Iterators } from 'fabric-shim';

@Object()
export class ProductKeyBatchRequest {

    @Property()
    public Writer: string;

    @Property()
    public Publisher: string;

    @Property()
    public Provider: string;

    @Property()
    public Distributor: string;

    @Property()
    public SKU: string;

    @Property()
    public Quantity: number;

    @Property()
    public BatchID: string;

    @Property()
    public BatchRestrictions: string;

    @Property()
    public Status: string;

    @Property()
    public Comments: string;

}

export interface IKeyModificationHistory extends Iterators.KeyModification {
    value: any;
}
