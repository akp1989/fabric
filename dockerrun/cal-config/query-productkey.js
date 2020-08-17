'use strict';

module.exports.info  = 'Querying product key';

let txIndex = 0;
let bc, contx;
let cIdentity = ['client0.org1.example.com','client0.org2.example.com'];
module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

module.exports.run = function() {
    txIndex++;
    let productKey = 'productKey' + (txIndex+1000).toString()+ '_'+'2201';
    let args;
    let cIdne	
    if (bc.getType() === 'fabric') {
        args = {
            chaincodeFunction: 'readProductKey',
            chaincodeArguments: [productKey],
	    invokerIdentity: cIdentity[1]
        };
    } 
    return bc.querySmartContract(contx, 'product-key', 'v0.0.1', args,120);
};

module.exports.end = function() {
    return Promise.resolve();
};
