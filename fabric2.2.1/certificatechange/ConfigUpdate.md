# Generate a reference json file

Update the environment variable 
````
export PATH=$PATH:./bin
export FABRIC_CFG_PATH=${PWD}/certificatechange
````

With the new updated config.yaml create a json for reference

````
configtxgen -profile OrgsOrdererGenesis -channelID sysgenchannel -outputBlock ./channelartifacts/genesis.block 
configtxlator proto_decode --input genesis.block --type common.Block > genesis.json
````

# Peer config updates (Certificate rotation of peers admin)

## Update the orderer system channel first

Export the environment variables

````
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="OrdererMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/orderer/msp/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/orderer1/adminuser/msp
export CORE_PEER_ADDRESS=localhost:7050
export CHANNEL_NAME=sysgenchannel
export PATH=$PATH:./bin
export FABRIC_CFG_PATH=${PWD}/configtxorgcore
````

Fetch the latest config file of the orderer system channel 
````
peer channel fetch config ./certificatechange/config_block.pb -o localhost:7050 -c $CHANNEL_NAME --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE

configtxlator proto_decode --input ./certificatechange/config_block.pb --type common.Block > ./certificatechange/config_block.json

jq .data.data[0].payload.data.config ./certificatechange/config_block.json > ./certificatechange/config.json
````
Create a copy of above json (config_update.json) and Update the msp information in the new json by referring the genesis.json from step1

Compare the latest config and the changed config and extract the delta 

````
configtxlator proto_encode --input ./certificatechange/config.json --type common.Config --output ./certificatechange/config.pb

configtxlator proto_encode --input ./certificatechange/config_update.json --type common.Config --output ./certificatechange/config_update.pb

configtxlator compute_update --channel_id $CHANNEL_NAME --original ./certificatechange/config.pb --updated ./certificatechange/config_update.pb --output ./certificatechange/config_update_delta.pb

configtxlator proto_decode --input ./certificatechange/config_update_delta.pb --type common.ConfigUpdate --output ./certificatechange/config_update_delta.json
````

Add the payload to the update envelop 
````
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat ./certificatechange/config_update_delta.json)'}}}' | jq . > ./certificatechange/config_update_in_envelope.json

configtxlator proto_encode --input ./certificatechange/config_update_in_envelope.json --type common.Envelope --output ./certificatechange/config_update_in_envelope.pb
````

The transaction can be updated directly since we are performing the update on behalf of ordererMSP
````
peer channel update -f ./certificatechange/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE
````


## Update the application channel post updating the orderer system channel

Export the environment variables
````
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="RootMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/root/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/root/adminuser/msp
export CORE_PEER_ADDRESS=localhost:7051
export CHANNEL_NAME=testchannel
export FABRIC_CFG_PATH=${PWD}/configtxorgcore
````
Fetch the latest config file of the application channel 

````
peer channel fetch config ./certificatechange/config_block.pb -o localhost:7050 -c $CHANNEL_NAME --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE

configtxlator proto_decode --input ./certificatechange/config_block.pb --type common.Block > ./certificatechange/config_block.json

jq .data.data[0].payload.data.config ./certificatechange/config_block.json > ./certificatechange/config.json
````

Create a copy of above json (config_update.json) and Update the msp information in the new json by referring the genesis.json from step1

Compare the latest config and the changed config and extract the delta 
````
configtxlator proto_encode --input ./certificatechange/config.json --type common.Config --output ./certificatechange/config.pb

configtxlator proto_encode --input ./certificatechange/config_update.json --type common.Config --output ./certificatechange/config_update.pb

configtxlator compute_update --channel_id $CHANNEL_NAME --original ./certificatechange/config.pb --updated ./certificatechange/config_update.pb --output ./certificatechange/config_update_delta.pb

configtxlator proto_decode --input ./certificatechange/config_update_delta.pb --type common.ConfigUpdate --output ./certificatechange/config_update_delta.json
````

Add the payload to the update envelop 
````
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat ./certificatechange/config_update_delta.json)'}}}' | jq . > ./certificatechange/config_update_in_envelope.json

configtxlator proto_encode --input ./certificatechange/config_update_in_envelope.json --type common.Envelope --output ./certificatechange/config_update_in_envelope.pb
````
The organization that needs the update should sign the transaction, it is better to get the signature from all the organizations
````
peer channel signconfigtx -f ./certificatechange/config_update_in_envelope.pb
````

Submit the channel update transaction post collecting signatures of the organizational peers
````
peer channel update -f ./certificatechange/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --tls --cafile $TLS_ROOT_CA
````


# Orderer config updates (Certificate rotation of orderers TLSCerts and admincerts)
## Update the orderer system channel first

Export the environment variables

````
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="OrdererMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/orderer/msp/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/orderer1/adminuser/msp
export CORE_PEER_ADDRESS=localhost:7050
export CHANNEL_NAME=sysgenchannel
export PATH=$PATH:./bin
export FABRIC_CFG_PATH=${PWD}/configtxorgcore
````

Fetch the latest config file of the orderer system channel 
````
peer channel fetch config ./certificatechange/config_block.pb -o localhost:7050 -c $CHANNEL_NAME --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE

configtxlator proto_decode --input ./certificatechange/config_block.pb --type common.Block > ./certificatechange/config_block.json

jq .data.data[0].payload.data.config ./certificatechange/config_block.json > ./certificatechange/config.json
````
Create a copy of above json (config_update.json) and Update the msp information in the new json by referring the genesis.json from step1

Compare the latest config and the changed config and extract the delta 

````
configtxlator proto_encode --input ./certificatechange/config.json --type common.Config --output ./certificatechange/config.pb

configtxlator proto_encode --input ./certificatechange/config_update.json --type common.Config --output ./certificatechange/config_update.pb

configtxlator compute_update --channel_id $CHANNEL_NAME --original ./certificatechange/config.pb --updated ./certificatechange/config_update.pb --output ./certificatechange/config_update_delta.pb

configtxlator proto_decode --input ./certificatechange/config_update_delta.pb --type common.ConfigUpdate --output ./certificatechange/config_update_delta.json
````

Add the payload to the update envelop 
````
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat ./certificatechange/config_update_delta.json)'}}}' | jq . > ./certificatechange/config_update_in_envelope.json

configtxlator proto_encode --input ./certificatechange/config_update_in_envelope.json --type common.Envelope --output ./certificatechange/config_update_in_envelope.pb
````

The transaction can be updated directly since we are performing the update on behalf of ordererMSP
````
peer channel update -f ./certificatechange/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE
````

## Update the application channels post orderer system channel update

Export the environment variables

````
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="OrdererMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/orderer/msp/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/orderer1/adminuser/msp
export CORE_PEER_ADDRESS=localhost:7050
export CHANNEL_NAME=testchannel
export PATH=$PATH:./bin
export FABRIC_CFG_PATH=${PWD}/configtxorgcore
````

Fetch the latest config file of the orderer system channel 
````
peer channel fetch config ./certificatechange/config_block.pb -o localhost:7050 -c $CHANNEL_NAME --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE

configtxlator proto_decode --input ./certificatechange/config_block.pb --type common.Block > ./certificatechange/config_block.json

jq .data.data[0].payload.data.config ./certificatechange/config_block.json > ./certificatechange/config.json
````
Create a copy of above json (config_update.json) and Update the msp information in the new json by referring the genesis.json from step1

Compare the latest config and the changed config and extract the delta 

````
configtxlator proto_encode --input ./certificatechange/config.json --type common.Config --output ./certificatechange/config.pb

configtxlator proto_encode --input ./certificatechange/config_update.json --type common.Config --output ./certificatechange/config_update.pb

configtxlator compute_update --channel_id $CHANNEL_NAME --original ./certificatechange/config.pb --updated ./certificatechange/config_update.pb --output ./certificatechange/config_update_delta.pb

configtxlator proto_decode --input ./certificatechange/config_update_delta.pb --type common.ConfigUpdate --output ./certificatechange/config_update_delta.json
````

Add the payload to the update envelop 
````
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat ./certificatechange/config_update_delta.json)'}}}' | jq . > ./certificatechange/config_update_in_envelope.json

configtxlator proto_encode --input ./certificatechange/config_update_in_envelope.json --type common.Envelope --output ./certificatechange/config_update_in_envelope.pb
````

The transaction can be updated directly since we are performing the update on behalf of ordererMSP
````
peer channel update -f ./certificatechange/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --tls --cafile $CORE_PEER_TLS_ROOTCERT_FILE
````
