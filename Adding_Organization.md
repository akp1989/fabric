# Adding a new organization to the existing network

Export the following commands from addorg directory
```
export PATH=$PATH:./../bin
export FABRIC_CFG_PATH=${PWD}
```



## Generating the crypto materials for the new organization

Use the cryptogen tool to generate the crypto materials. Run the command from addorg directory
```
cryptogen generate --config=org5-crypto.yaml
```
The command will create the crypto materials for org5 under ./addorg/crypto-config directory

## Change the logger to debug mode

Change the "FABRIC_LOGGING_SPEC" to DEBUG in the CLI container in the existing docker-compose.yaml

## Generate the config json for the new organization

The following command will generate the configuration file in the json format
```
./../bin/configtxgen -printOrg Org5MSP > ./../channel-artifacts/org5.json
```
Add the following section to have the anchor peer definition (In our case we define peer0 as anchor peer for our org5)
```
"AnchorPeers": {
    "mod_policy": "Admins",
    "value": {
        "anchor_peers": [
            {
                "host": "peer0.org5.example.com",
                "port": 15051
            }
        ]
    },
	"version": "0"
},			
```
Copy the existing orderer org msp folder to the new crypto-config directory
```
cp -r ./../crypto-config/ordererOrganizations ./crypto-config/
```

## Existing CLI operations

Login to existing CLI container and export the following environment variables
```
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem 
export CHANNEL_NAME=testchannel
```

### Fetch the existing config file

User the channel fetch command to extract the existing configuration in a protobug format
```
peer channel fetch config config_block.pb -o orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
```
After the command is executed, check the debug logs check for the latest block (After running the previous setup it should be block 6)

### Decode the config file to json format

Decode the config block file from protobuf format to json file format using the jq tool
Use the jq command to truncate the headers

```
configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json
```

### Trim the org5 config json file

Use the jq tool to trim the header of the already decoded org5 json file

```
jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"Org5MSP":.[1]}}}}}' config.json ./channel-artifacts/org5.json > modified_config.json
```

### Calculate the delta between the existing config and the org 5 config files

Use configtxlator to convert the config and new config to protobuf format
```
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
```

Calculate the delta between the two protobuf files
```
configtxlator compute_update --channel_id $CHANNEL_NAME --original config.pb --updated modified_config.pb --output org5_update.pb
```

### Add the truncated header back to the delta fie

Decode the delta update file to json format
```
configtxlator proto_decode --input org5_update.pb --type common.ConfigUpdate | jq . > org5_update.json
```

Add header to the updated file
```
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat org5_update.json)'}}}' | jq . > org5_update_in_envelope.json
```

### Sign the delta file by all the admin orgs

Convert back the header appended file back to protobuf format
```
configtxlator proto_encode --input org5_update_in_envelope.json --type common.Envelope --output org5_update_in_envelope.pb
```

Sign the config change protobuf file as Org1, Org2, Org3, Org4 (Use the exports of peer0 of Org1, Org2, Org3 and Org4 as defined in the Network_Chaincodes_README.md file)
```
peer channel signconfigtx -f org5_update_in_envelope.pb
```


### Update the channel 

Update the channel as any one of the admin org (Org1)
```
peer channel update -f org5_update_in_envelope.pb -c $CHANNEL_NAME -o orderer.example.com:7050 --tls --cafile $ORDERER_CA
```

###Install the chaincode in all the peers as new version and upgraded 

Install the chaincode as new version 
```
peer chaincode install -n mycc -v 0.2 -l node -p /opt/gopath/src/github.com/chaincode/example02
```


## New CLI container tasks

Bring up the container with new org peers, couchdb and CLI containers
```
docker-compose -f ./../fabric/docker-compose-org5.yaml up -d
```

Login to the Org5cli containers

```
docker exec -it Org5cli /bin/bash
```

Export the Orderer CA path and channel name

```
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export CHANNEL_NAME=testchannel
```



### Fetch the channel block

Fetch the genesis block (0th block) of the test channel into the new organiazation
```
peer channel fetch 0 testchannel.block -o orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
```

Join the channel
```
peer channel join -b testchannel.block
```

Install the chaincode in all the peers as new version and upgraded (Peer0.Org5 and Peer1.Org5)
```
peer chaincode install -n mycc -v 0.2 -l node -p /opt/gopath/src/github.com/chaincode/example02
```

#### To use CLI on behalf of peer0.org5

```
export CORE_PEER_LOCALMSPID="Org5MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org5.example.com/users/Admin@org5.example.com/msp
export CORE_PEER_ADDRESS=peer0.org5.example.com:15051
```

#### To use CLI on behalf of peer1.org5
```
export CORE_PEER_LOCALMSPID="Org5MSP"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org5.example.com/users/Admin@org5.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org5.example.com/peers/peer1.org5.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=peer1.org5.example.com:15052
```



## Upgrading the chaincode

Login back to the existing cli container and upgrade the chaincode to v2. Note that endorsement policy has been modified to include Org5 additionaly

```
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem 
export CHANNEL_NAME=testchannel
peer chaincode upgrade -o orderer.example.com:7050 --tls true --cafile $ORDERER_CA -C $CHANNEL_NAME -n mycc -v 0.2 -c '{"Args":["init","a","90","b","210"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer','Org5MSP.peer')"
```

## Invoke and query from the new organization
Login to the org5cli container and check the query and invoke on the existing chaincode

```
docker exec -it Org5cli /bin/bash
```


Export the following variables

```
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem 
export CHANNEL_NAME=testchannel
```

### Query the chaincode for the variables A and B

Query result should be same as the value used in the upgrade command (90 and 210)
```
peer chaincode query -C testchannel -n mycc -c '{"Args":["query","a"]}'
peer chaincode query -C testchannel -n mycc -c '{"Args":["query","b"]}'
```

### Invoke the chaincode

Invoke the chaincode from the new contianer and query the results for verification
```
peer chaincode invoke -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C testchannel -n mycc --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt --peerAddresses peer0.org4.example.com:13051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt --peerAddresses peer0.org5.example.com:15051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org5.example.com/peers/peer0.org5.example.com/tls/ca.crt -c '{"Args":["invoke","a","b","10"]}'

```

Query result should be 80 and 220 respectfully for A and Block
```
peer chaincode query -C testchannel -n mycc -c '{"Args":["query","a"]}'
peer chaincode query -C testchannel -n mycc -c '{"Args":["query","b"]}'
```