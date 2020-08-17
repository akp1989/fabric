'use strict';

module.exports.info = 'Creating productkey';

let txIndex = 0;
let parties = ['Org1MSP', 'Org2MSP'];
let tMap = {keyNumber:'keyNumber',sKU:'sKU',batchID:'batchID'}
let cIdentity = ['client0.org2.example.com','client0.org1.example.com']
let bc, contx;

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

function generateWorkload() {
    txIndex++;
    let productKey = 'productKey' + (txIndex+1000).toString()+ '_'+'2201';
    let distributor = parties[(txIndex%2)];
    let publisher = parties[(txIndex%2)]; 
    let args;
    if (bc.getType() === 'fabric') {
	 args = {
            chaincodeFunction: 'createProductKey',
            chaincodeArguments: [productKey, distributor, publisher],
	    invokerIdentity: cIdentity[(txIndex%2)],
	    transientMap: tMap 
        };
    } 
    
    return args;
}

module.exports.run = function() {
    
	let args = generateWorkload();
    return bc.invokeSmartContract(contx, 'product-key', 'v0.0.1', args,60);
};

module.exports.end = function () {
    return Promise.resolve();
};
