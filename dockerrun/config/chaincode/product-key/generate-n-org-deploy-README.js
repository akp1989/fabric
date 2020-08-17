/*

This file is to generate the commands for deploying on N orgs.


--------------------
USAGE
--------------------

`node generate-n-org-deploy-README.js`

**********
Output
**********
```
Fri Apr 24 2020 14:27:59 GMT+0100 (Irish Standard Time): Commands-to-deploy-on-2-Org-README.md
```

*/

const number_of_org = 2;
const list_of_org = [...Array(number_of_org).keys()].map(i => `Org${i + 1}MSP`);
console.log(list_of_org);

const list_of_org_ports = list_of_org.map((v, i) => 7051 + (i * 2000));
console.log(list_of_org_ports);

const policy = `OR (${list_of_org.map(v => `'\\''${v}.peer'\\''`)})`;
console.log(policy);

const path_to_collection_file = '/opt/gopath/src/github.com/chaincode/product-key/generated-collections-for-cli-use.json';
console.log(path_to_collection_file);

let rEADME = [
    `
## How to deploy smart-contracts with private-data collections

\`\`\`
docker exec -it cli bash
\`\`\`
`
];

rEADME = rEADME.concat(list_of_org.map((v, i) =>
    `
# Commands for ${v} 

\`\`\`
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${i + 1}.example.com/users/Admin@org${i + 1}.example.com/msp
CORE_PEER_ADDRESS=peer0.org${i + 1}.example.com:${list_of_org_ports[i]}
CORE_PEER_LOCALMSPID="${v}"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org${i + 1}.example.com/peers/peer0.org${i + 1}.example.com/tls/ca.crt
export CHANNEL_NAME=mychannel

peer chaincode install -n product-key -v 0.0.1 -l node -p /opt/gopath/src/github.com/chaincode/product-key/
\`\`\`

### Instantiate 

- Only needs to be executed from once from chaincode owner ORG.
- Make sure you have generated the collections file using \`node generate-collections-file.js\`.

\`\`\`
peer chaincode instantiate -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key -l node -v 0.0.1 -c '{"Args":["productKeyExists","a"]}' -P '${policy}' --collections-config ${path_to_collection_file}
\`\`\`

### Test productKeyBatchRequestExists

\`\`\`
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["productKeyExists","a"]}'
\`\`\`
`
));


/*


## Create (createProductKey)

### Acting as Org1MSP
\`\`\`
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CORE_PEER_ADDRESS=peer0.org1.example.com:7051
CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

export DATA=$(echo -n "sample-data" | base64 | tr -d \\n)
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["createProductKey","productKey:1","Org1MSP","Org1MSP"]}' --transient "{\"keyNumber\":\"$DATA\",\"sKU\":\"$DATA\",\"batchID\":\"$DATA\"}"
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["createProductKey","productKey:2","Org1MSP","Org2MSP"]}' --transient "{\"keyNumber\":\"$DATA\",\"sKU\":\"$DATA\",\"batchID\":\"$DATA\"}"

\`\`\`

### Acting as Org2MSP
\`\`\`
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
CORE_PEER_ADDRESS=peer0.org2.example.com:9051
CORE_PEER_LOCALMSPID="Org2MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

export DATA=$(echo -n "sample-data" | base64 | tr -d \\n)
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["createProductKey","productKey:3","Org2MSP","Org2MSP"]}' --transient "{\"keyNumber\":\"$DATA\",\"sKU\":\"$DATA\",\"batchID\":\"$DATA\"}"
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["createProductKey","productKey:4","Org1MSP","Org2MSP"]}' --transient "{\"keyNumber\":\"$DATA\",\"sKU\":\"$DATA\",\"batchID\":\"$DATA\"}"

\`\`\`


## Read (readProductKey)

### Acting as Org1MSP
\`\`\`
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CORE_PEER_ADDRESS=peer0.org1.example.com:7051
CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

# OK
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["readProductKey","productKey:1"]}'

# OK
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["readProductKey","productKey:2"]}'

# Error
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["readProductKey","productKey:3"]}'

# OK
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["readProductKey","productKey:4"]}'

\`\`\`

### Acting as Org2MSP
\`\`\`
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
CORE_PEER_ADDRESS=peer0.org2.example.com:9051
CORE_PEER_LOCALMSPID="Org2MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

# Error
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["readProductKey","productKey:1"]}'

# OK
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["readProductKey","productKey:2"]}'

# OK
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["readProductKey","productKey:3"]}'

# OK
peer chaincode query -C $CHANNEL_NAME -n product-key -c '{"Args":["readProductKey","productKey:4"]}'

\`\`\`

## Update (allocateProductKeyToPool)

### Acting as Org1MSP
\`\`\`
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CORE_PEER_ADDRESS=peer0.org1.example.com:7051
CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

export DATA=$(echo -n "sample-data" | base64 | tr -d \\n)

# OK
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["activateProductKey","productKey:2"]}' --transient "{\"providerUserID\":\"$DATA\",\"activationData\":\"$DATA\"}"

# Error
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["activateProductKey","productKey:3"]}' --transient "{\"providerUserID\":\"$DATA\",\"activationData\":\"$DATA\"}"

\`\`\`

### Acting as Org2MSP
\`\`\`
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
CORE_PEER_ADDRESS=peer0.org2.example.com:9051
CORE_PEER_LOCALMSPID="Org2MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

export DATA=$(echo -n "sample-data" | base64 | tr -d \\n)

# OK
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["activateProductKey","productKey:4"]}' --transient "{\"providerUserID\":\"$DATA\",\"activationData\":\"$DATA\"}"

# Error
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n product-key --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["activateProductKey","productKey:1"]}' --transient "{\"providerUserID\":\"$DATA\",\"activationData\":\"$DATA\"}"

\`\`\`

    `
]

*/

const fs = require("fs");
const output_filename = `Commands-to-deploy-on-${number_of_org}-Org-README.md`;
fs.writeFile(output_filename, rEADME, err => {
    if (err) throw err;
    console.log(`${new Date().toString()}: ${output_filename}`); // Success 
});
