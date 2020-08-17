# Creating the fabric network

Run all the following commands within the fabric (fabric x.x.x) directory

## Generating the genesis block and transaction file

configtxgen tool from the bin directory will be used to generate the genesis block and transaction file 

Generate the genesis block
```
configtxgen -profile OrgsOrdererGenesis -channelID byfnsystemchannel -outputBlock ./channel-artifacts/genesis.block
```

Generate the transaction file. The actual channel name should be passed as the parameter to the channelID parameter and it should be different from the system channel name in the previous command
```
configtxgen -profile OrgsChannel -outputCreateChannelTx ./channel-artifacts/testchannel.tx -channelID testchannel
```

Generate the transaction file for each Organization. 
```
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1anchor.tx -channelID testchannel -asOrg Org1MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2anchor.tx -channelID testchannel -asOrg Org2MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org3anchor.tx -channelID testchannel -asOrg Org3MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org4anchor.tx -channelID testchannel -asOrg Org4MSP
```

## Starting the docker network 

The docker compose configuration file is present inside ./fabric/docker-compose.yaml
```
docker-compose -f ./fabric/docker-compose.yaml up -d
```

The docker compose command should bring up the following docker container

* Four Org (1 peer each)
* Four couchdb
* One CLI 

The docker ports for peers and couch db's are used as follows

* For peers it is 7050 + (OrgNo * 2000 + PeerNo)
* For chaincode listener ports it is peer port number + 100
* For couchdb it is 8050 + (OrgNo * 2000 + PeerNo)

Use the follwoing commands to bring up docker network with 1 org or 2 0rg respectively instead of default 4 org network

```
docker-compose -f ./fabric/docker-compose-1org.yaml up -d
docker-compose -f ./fabric/docker-compose-2orgs.yaml up -d

```


## Command line interface tasks

Use the following commands to login into CLI container
```
docker exec -it cli /bin/bash
```

## Exports for CLI 

Use the following exports to use the CLI on behalf of a given node
By default CLI will be on the behalf of Org1

### To use the CLI on behalf of Peer0.Org1
```
CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CORE_PEER_ADDRESS=peer0.org1.example.com:7051
```
### To use the CLI on behalf of Peer1.Org1
```
CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt
CORE_PEER_ADDRESS=peer1.org1.example.com:7052
```

### To use the CLI on behalf of Peer0.Org2
```
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=peer0.org2.example.com:9051
```

### To use the CLI on behalf of Peer1.Org2
```
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=peer1.org2.example.com:9052
```

### To use the CLI on behalf of Peer0.Org3
```
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_ADDRESS=peer0.org3.example.com:11051
```
### To use the CLI on behalf of Peer1.Org3
```
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer1.org3.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=peer1.org3.example.com:11052
```
### To use the CLI on behalf of Peer0.Org4
```
export CORE_PEER_LOCALMSPID="Org4MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp
export CORE_PEER_ADDRESS=peer0.org4.example.com:13051
```
### To use the CLI on behalf of Peer1.Org4
```
export CORE_PEER_LOCALMSPID="Org4MSP"
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/peers/peer1.org4.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=peer1.org4.example.com:13052
```

## Creating channel

Use the following command in CLI to create the channel
```
peer channel create -o orderer.example.com:7050 -c testchannel -f ./channel-artifacts/testchannel.tx --outputBlock ./channel-artifacts/testchannel.block --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

## Joining the channels 

Join all/required nodes to the channel and set the anchor peer through CLI ( using the exports for CLI)
We have two peers for each organization and peer0's are defined as anchor peers
For all the peer0's execute both peer channel join command and peer channel update
For all the peer1's exectute only the channel join command

```
Org1:
peer channel join -b ./channel-artifacts/testchannel.block  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
peer channel update -o orderer.example.com:7050 -c testchannel -f ./channel-artifacts/Org1anchor.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

Org2:
peer channel join -b ./channel-artifacts/testchannel.block  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
peer channel update -o orderer.example.com:7050 -c testchannel -f ./channel-artifacts/Org2anchor.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

Org3:
peer channel join -b ./channel-artifacts/testchannel.block  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
peer channel update -o orderer.example.com:7050 -c testchannel -f ./channel-artifacts/Org3anchor.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

Org4:
peer channel join -b ./channel-artifacts/testchannel.block  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
peer channel update -o orderer.example.com:7050 -c testchannel -f ./channel-artifacts/Org4anchor.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```


## Installing the chaincode

Place any new chaincode inside the ./chaincode folder (by default example02 chaincode is pre-avaialable)
Install the chaincode in all the peers (peer0 & peer1) of all organization through CLI (using the exports for CLI)
```
peer chaincode install -n mycc -v 0.1 -l node -p /opt/gopath/src/github.com/chaincode/example02 >&log.txt
```

## Instantiating the chaincode

Chaincode instantiation should be on behalf of only one node throgh CLI (using the exports for CLI)
```
peer chaincode instantiate -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C testchannel -n mycc -l node -v 0.1 -c '{"Args":["init","a","100","b","200"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer')" >&log.txt
```

## Invoke chaincode

Chaincode invoke can be done on behalf of any organization
```
peer chaincode instantiate -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc -l node -v 0.1 -c '{"Args":["init","a","100","b","200"]}' -P "AND ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer')" >&log.txt

```

## Query chaincode

Chaincode query can be done on behalf of any organization
```
peer chaincode query -C testchannel -n mycc -c '{"Args":["query","a"]}'

```