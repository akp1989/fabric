'use strict';

module.exports.info = 'Creating marbles';

let txIndex = 0;
let colors = ['red', 'blue', 'green', 'black', 'white', 'pink', 'rainbow'];
let owners = ['Alice', 'Bob', 'Claire', 'David'];
let bc, contx;

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

function generateWorkload() {
    txIndex++;
    let marbleName = 'marble01_' + (1000+txIndex).toString() + '_' + process.pid.toString();
    let marbleColor = colors[txIndex % colors.length];
    let marbleSize = (((txIndex % 10) + 1) * 10).toString(); // [10, 100]
    let marbleOwner = owners[txIndex % owners.length];

    let args;
    if (bc.getType() === 'fabric') {
        args = {
            chaincodeFunction: 'initMarble',
            chaincodeArguments: [marbleName, marbleColor, marbleSize, marbleOwner],
        };
    } else {
        args = {
            verb: 'initMarble',
            name: marbleName,
            color: marbleColor,
            size: marbleSize,
            owner: marbleOwner
        };
    }
    return args;
}

module.exports.run = function() {
    
	let args = generateWorkload();
    return bc.invokeSmartContract(contx, 'marbles', 'v1.0.0', args,60);
};

module.exports.end = function () {
    return Promise.resolve();
};
