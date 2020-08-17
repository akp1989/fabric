/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class ProductKey {

    @Property()
    public Publisher: string;

    @Property()
    public Provider: string;

    @Property()
    public Distributor: string;

}

// tslint:disable-next-line: max-classes-per-file
@Object()
export class ProductKeyPrivate {

    @Property()
    public Writer: string;

    @Property()
    public KeyNumber: string;

    @Property()
    public SaleData: string;

    @Property()
    public SaleLocation: string;

    @Property()
    public BatchID: string;

    @Property()
    public SKU: string;

    @Property()
    public Retailer: string;

    @Property()
    public Consumer: string;

    @Property()
    public DistPoolID: string;

    @Property()
    public ProviderUserID: string;

    @Property()
    public ActivationData: string;

    @Property()
    public Comments: string;

    @Property()
    public Status: string;

}
