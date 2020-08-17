'use strict';

module.exports.info  = 'Querying marbles.';

let txIndex = 0;
let owners = ['Alice', 'Bob', 'Claire', 'David'];
let bc, contx;
module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = function() {
    txIndex++;
    let marbleOwner = owners[txIndex % owners.length];
    let args;

    if (bc.getType() === 'fabric') {
        args = {
            chaincodeFunction: 'queryMarblesByOwner',
            chaincodeArguments: [marbleOwner]
        };
    } else {
        args = {
            verb: 'queryMarblesByOwner',
            owner: marbleOwner
        };
    }

    // TODO: until Fabric query is implemented, use invoke
    return bc.querySmartContract(contx, 'marbles', 'v1.0.0', args,120);
};

module.exports.end = function() {
    return Promise.resolve();
};
