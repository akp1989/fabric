/*

This file is to generate the collections file.


--------------------
USAGE
--------------------

`node generate-collections-file.js`

**********
Output
**********
```
mrx@devbox:~/code/ucd_fun_dtif_btpsc/code/wp-6/product-key$ node generate-collections-file.js 
[ [ 'Org1MSP', 'Org1MSP', 'Org1MSP' ],
  [ 'Org1MSP', 'Org1MSP', 'Org2MSP' ],
  [ 'Org1MSP', 'Org2MSP', 'Org1MSP' ],
  [ 'Org1MSP', 'Org2MSP', 'Org2MSP' ] ]
Thu Apr 02 2020 17:13:00 GMT+0100 (Irish Standard Time): generated-collections.json
```

*/


let distributor = ["Org1MSP", "Org2MSP",];
let providers = ["Org1MSP", "Org2MSP",];
let publishers = ["Org1MSP", "Org2MSP",];

const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);

let output = cartesian(distributor, providers, publishers);

console.log(output);

const collections_for_sdk = [].concat(...output.map((v, i, a) => {
    return {
        "name": `${v[0]}-${v[1]}-${v[2]}`.toLowerCase(),
        "policy": {
            "identities": [
                {
                    "role": {
                        "name": "member",
                        "mspId": `${v[0]}`
                    }
                },
                {
                    "role": {
                        "name": "member",
                        "mspId": `${v[1]}`
                    }
                },
                {
                    "role": {
                        "name": "member",
                        "mspId": `${v[2]}`
                    }
                }
            ],
            "policy": {
                "1-of": [
                    {
                        "signed-by": 0
                    },
                    {
                        "signed-by": 1
                    },
                    {
                        "signed-by": 2
                    }
                ]
            }
        },
        "requiredPeerCount": 1,
        "maxPeerCount": 1,
        "blockToLive": 0,
        "memberOnlyRead": true
    };
}));


const collections_for_cli = [].concat(...output.map((v, i, a) => {
    return {
        "name": `${v[0]}-${v[1]}-${v[2]}`.toLowerCase(),
        "policy": `OR('${v[0]}.member', '${v[1]}.member', '${v[2]}.member')`,
        "requiredPeerCount": 1,
        "maxPeerCount": 1,
        "blockToLive": 0,
        "memberOnlyRead": true
    };
}));

const fs = require("fs");
fs.writeFile('generated-collections-for-sdk-use.json', JSON.stringify(collections_for_sdk), err => {
    if (err) throw err;
    console.log(`${new Date().toString()}: generated-collections-for-sdk-use.json`); // Success 
});

fs.writeFile('generated-collections-for-cli-use.json', JSON.stringify(collections_for_cli), err => {
    if (err) throw err;
    console.log(`${new Date().toString()}: generated-collections-for-cli-use.json`); // Success 
});