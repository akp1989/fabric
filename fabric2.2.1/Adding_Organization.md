# Adding a new organization to the existing network

Export the following commands from addorg directory
```
export PATH=$PATH:$PWD/bin
export FABRIC_CFG_PATH=${PWD}/org5
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
./../bin/configtxgen -printOrg Org5MSP > ./org5/org5.json
```
Add the following section to have the anchor peer definition (In our case we define peer0 as anchor peer for our org5)
```
"AnchorPeers": {
    "mod_policy": "Admins",
    "value": {
        "anchor_peers": [
            {
                "host": "peer0.org5.ceadar.org",
                "port": 15051
            }
        ]
    },
	"version": "0"
},			
```


## Existing peer operations

Login to org1 (or any of the existing organizations)
````
export ORDERER_CA=/home/prabhakaran/workspace/fabric/fabric2.2.1/crypto/orderer/msp/tlscacerts/tlsca-cert.pem
export FABRIC_CFG_PATH=${PWD}/configtxorgcore
export PATH=$PATH:${PWD}/bin
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/org1/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/org1/adminuser/msp
export CORE_PEER_ADDRESS=localhost:7051
````
### Fetch the existing config file

User the channel fetch command to extract the existing configuration in a protobug format
```
peer channel fetch config ./org5/config_block.pb -o localhost:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
```
After the command is executed, check the debug logs check for the latest block (After running the previous setup it should be block 6)

### Decode the config file to json format

Decode the config block file from protobuf format to json file format using the jq tool
Use the jq command to truncate the headers

```
configtxlator proto_decode --input ./org5/config_block.pb --type common.Block | jq .data.data[0].payload.data.config > ./org5/config.json
```

### Trim the org5 config json file

Use the jq tool to trim the header of the already decoded org5 json file

```
jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"Org5MSP":.[1]}}}}}' config.json ./org5/org5.json > ./org5/modified_config.json
```

### Calculate the delta between the existing config and the org 5 config files

Use configtxlator to convert the config and new config to protobuf format
```
configtxlator proto_encode --input ./org5/config.json --type common.Config --output ./org5/config.pb
configtxlator proto_encode --input ./org5/modified_config.json --type common.Config --output ./org5/modified_config.pb
```

Calculate the delta between the two protobuf files
```
configtxlator compute_update --channel_id $CHANNEL_NAME --original ./org5/config.pb --updated ./org5/modified_config.pb --output ./org5/org5_update.pb
```

### Add the truncated header back to the delta fie

Decode the delta update file to json format
```
configtxlator proto_decode --input ./org5/org5_update.pb --type common.ConfigUpdate | jq . > ./org5/org5_update.json
```

Add header to the updated file
```
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat ./org5/org5_update.json)'}}}' | jq . > ./org5/org5_update_in_envelope.json
```

### Sign the delta file by all the admin orgs

Convert back the header appended file back to protobuf format
```
configtxlator proto_encode --input ./org5/org5_update_in_envelope.json --type common.Envelope --output ./org5/org5_update_in_envelope.pb
```

Sign the config change protobuf file as Org1, Org2, Org3, Org4 (Use the exports of peer0 of Org1, Org2, Org3 and Org4 as defined in the Network_Chaincodes_README.md file)
```
peer channel signconfigtx -f ./org5/org5_update_in_envelope.pb
```


### Update the channel 

Update the channel as any one of the admin org (Org1)
```
peer channel update -f ./org5/org5_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --tls --cafile $ORDERER_CA
```


## New organization tasks

Bring up the container with new org peers, couchdb and CLI containers
```
docker-compose -f ./../fabric/docker-compose-org5.yaml up -d
```

### Fetch the channel block

Fetch the genesis block (0th block) of the test channel into the new organiazation
```
peer channel fetch 0 ./channelartifacts/testchannel.block -o localhost:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
```

Join the channel
```
peer channel join -b testchannel.block
```

### For existing smartcontracts

Run the following peer chaincode lifecycle tasks for existing smartcontracts
```
peer lifecycle chaincode install ./chaincode/privateasset.tar.gz

peer lifecycle chaincode approveformyorg -o localhost:7050 --tls true --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name privateasset --version ${VERSION} --package-id ${PACKAGE_ID} --sequence ${SEQUENCE} --signature-policy "OR('Org1MSP.peer', 'Org2MSP.peer', 'Org3MSP.peer', 'Org4MSP.peer')"

```
