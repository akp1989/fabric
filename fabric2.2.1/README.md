# Setting up Fabric workspace for version 2.2.1

## Downloading the latest images and binaries:
Use the following curl script to download the latest images and binaries
```
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.1 1.4.9
```
### Getting the latest couchdb (V3.1) to support this version of fabric:
Use the following docker pull and tag commnd to pull the appropriate version (V3.1)
```
docker pull couchdb:3.1 (Refered from release notes of fabric v 2.2.x. 
docker tag 438167172b8a couchdb:latest
```

## Generating the CA-Certificates:
Follow the GeneratingCACerts.md and use the folder ./fabric_2.2.1_CA_Script for generating the certificates needed

## Copy the binaries into the binary folder:
Copy the binaries to the following folder
./bin

## Generate the channel artifacts:

Use the follwing commands to generate the channel artifacts
````
export PATH=$PATH:${PWD}/bin
export FABRIC_CFG_PATH=${PWD}/configtx

configtxgen -profile OrgsOrdererGenesis -channelID sysgenchannel -outputBlock ./channelartifacts/genesis.block 

configtxgen -profile OrgsChannel -outputCreateChannelTx ./channelartifacts/testchannel.tx -channelID testchannel

configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org1anchor.tx -channelID testchannel -asOrg Org1MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org2anchor.tx -channelID testchannel -asOrg Org2MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org3anchor.tx -channelID testchannel -asOrg Org3MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org4anchor.tx -channelID testchannel -asOrg Org4MSP
````

## Start the docker containers:

Use the follwing commands to bring up the docker containers with the generated artifacts
````
docker-comppse -f ./fabric/docker-compose.yaml up -d
````

Check if all the the orderer container, peer containers and couchdb containers are up and running
(From fabric v2.x.x we do not need a seperate CLI)


## Organizational tasks

Open inidividual terminal window to act on behalf of each organization
 
Export the following environment varaibles across all the terminals
````
export ORDERER_CA=/home/prabhakaran/workspace/fabric/fabric2.2.1/crypto/orderer/msp/tlscacerts/tlsca-cert.pem
export FABRIC_CFG_PATH=${PWD}/configtxorgcore
export PATH=$PATH:${PWD}/bin

export PEER_ORG1=" --peerAddresses localhost:7051 --tlsRootCertFiles ./crypto/org1/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_ORG2=" --peerAddresses localhost:9051 --tlsRootCertFiles ./crypto/org2/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_ORG3=" --peerAddresses localhost:11051 --tlsRootCertFiles ./crypto/org3/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_ORG4=" --peerAddresses localhost:13051 --tlsRootCertFiles ./crypto/org4/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_LIST="--peerAddresses localhost:7051 --tlsRootCertFiles ./crypto/org1/msp-tls-peer0/tlscacerts/tlsca-cert.pem --peerAddresses localhost:9051 --tlsRootCertFiles ./crypto/org2/msp-tls-peer0/tlscacerts/tlsca-cert.pem --peerAddresses localhost:11051 --tlsRootCertFiles ./crypto/org3/msp-tls-peer0/tlscacerts/tlsca-cert.pem --peerAddresses localhost:13051 --tlsRootCertFiles ./crypto/org4/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
````

### Org1

As organization org1 export the following environment variables

````
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/org1/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/org1/adminuser/msp
export CORE_PEER_ADDRESS=localhost:7051
````

Create the channel from org1, join and update the anchor peer
````
peer channel create -o localhost:7050 -c testchannel -f ./channelartifacts/testchannel.tx --outputBlock ./channelartifacts/testchannel.block --tls true --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Org1anchor.tx --tls true --cafile ${ORDERER_CA}
````

### Org2

As organization org2 export the following environment variables

````
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/org2/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/org2/adminuser/msp
export CORE_PEER_ADDRESS=localhost:9051
````

Fetch the channel block file for org2, join and update the anchor peer
````
peer channel fetch 0 ./channelartifacts/testchannel.block -o localhost:7050 -c testchannel --tls --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Org2anchor.tx --tls true --cafile ${ORDERER_CA}
````

### Org3

As organization org3 export the following environment variables

````
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/org3/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/org3/adminuser/msp
export CORE_PEER_ADDRESS=localhost:11051
````

Fetch the channel block file for org2, join and update the anchor peer
````
peer channel fetch 0 ./channelartifacts/testchannel.block -o localhost:7050 -c testchannel --tls --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Org3anchor.tx --tls true --cafile ${ORDERER_CA}
````

### Org4

As organization org4 export the following environment variables

````
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org4MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/org4/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/org4/adminuser/msp
export CORE_PEER_ADDRESS=localhost:13051
````

Fetch the channel block file for org2, join and update the anchor peer
````
peer channel fetch 0 ./channelartifacts/testchannel.block -o localhost:7050 -c testchannel --tls --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Org4anchor.tx --tls true --cafile ${ORDERER_CA}
````

## Preparing the chaincode for installation:

The chaincode has to be built externally and prepared for chaincode lifecycle. The method for each language of the chaincode is listed as follows

### go:
Run the following commands in the chaincode folder. 
````
export CC_RUNTIME_LANGUAGE=golang
GO111MODULE=on go mod vendor
````

### javascript:
No build required just export the chaincode runtime language environment variable
````
export CC_RUNTIME_LANGUAGE=node
````
### java:
Build the java project and export the chaincode runtime language environement variable
````
export CC_RUNTIME_LANGUAGE=java
./gradlew build
````
### typescript:
Run the following commands in the chaincode folder
````
CC_RUNTIME_LANGUAGE=node
npm install
npm run build
````

## Installing the smartcontract:

### Privatesmartcontract:
A java written smart contract to demonstrate the invoke, query and update method for private data, implicit policy collection ,state based endorsement policy and method to verify the private data hash with transient object

export the following common environment variables for all the peers
````
export CC_RUNTIME_LANGUAGE=java
export CHANNEL_NAME="testchannel"
export SEQUENCE="0"
export VERSION="1.0"
````

#### Packaging the smartcontract:
Packaging the smart contract creates a tar.gz file that can be installed 
````
peer lifecycle chaincode package ./chaincode/privateasset.tar.gz --path ./chaincode/PrivateAsset --lang ${CC_RUNTIME_LANGUAGE} --label privateasset_${VERSION}
````

#### Installing the smartcontract:
Install the smartcontract in all the peers
````
peer lifecycle chaincode install ./chaincode/privateasset.tar.gz
````

The successful installation of the smartcontract gives a package id which has to be exported in all the peers
````
export PACKAGE_ID="privateasset_1.0:96164cdaccf80aace19ea5b415625f1f93161cdc17aed83d2715e17d14708e79"
````

#### Approve the smartcontract:
Approve the smartcontract from all the peers
````
peer lifecycle chaincode approveformyorg -o localhost:7050 --tls true --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name privateasset --version ${VERSION} --package-id ${PACKAGE_ID} --sequence ${SEQUENCE} --signature-policy "OR('Org1MSP.peer', 'Org2MSP.peer', 'Org3MSP.peer', 'Org4MSP.peer')"
````
The --signature-policy is optional without it, the default implicit policy definition from config tx will be implemented

/channel/application/policies/lifecycleendorsement
        LifecycleEndorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
This states the majority of endorsers should endorse the transaction which is in our case (4/2)+1 = 3

Any private data collection config file has to be passed with the flag --collection-config <./chaincode/abc/collectionfile.json>

#### Commit the smartcontract:
Commit the smartcontract from only one peer
````
peer lifecycle chaincode commit -o localhost:7050 --tls true --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name privateasset $PEER_LIST --version ${VERSION} --sequence ${SEQUENCE} --signature-policy "OR('Org1MSP.peer', 'Org2MSP.peer', 'Org3MSP.peer', 'Org4MSP.peer')"
````
The --signature-policy is optional without it, the default implicit policy definition from config tx will be implemented

/channel/application/policies/lifecycleendorsement
        LifecycleEndorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
This states the majority of endorsers should endorse the transaction which is in our case (4/2)+1 = 3
 
Any private data collection config file has to be passed with the flag --collection-config <./chaincode/abc/collectionfile.json>

#### Upgrading the smartcontract:
Follow the entire chaincode lifecycle from chaincode packing to commit by changing the sequence number to 2


### Creating new record:

* While creating a new record by default the state based endorsement policy sets the Initiator and the Org4 has to sign the transaction
* Implicit data collection defines only the initiator organization has the private data access

````
export ASSETPRICE=$(echo -n "price-00" | base64 | tr -d \\n)
as org1:
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_LIST -c '{"Function":"AssetContract:assetCreate","Args":["assetNo:1","org1","Called from org1 - ep of both org1 and org4"]}' --transient "{\"assetPrice\":\"$ASSETPRICE\"}"
as org2:
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_LIST -c '{"Function":"AssetContract:assetCreate","Args":["assetNo:2","org2","Called from org2 - ep of both org2 and org4"]}' --transient "{\"assetPrice\":\"$ASSETPRICE\"}"
as org3:
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_LIST -c '{"Function":"AssetContract:assetCreate","Args":["assetNo:3","org3","Called from org3 - ep of both org3 and org4"]}' --transient "{\"assetPrice\":\"$ASSETPRICE\"}"
as org4:
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_LIST -c '{"Function":"AssetContract:assetCreate","Args":["assetNo:4","org4","Called from org4 - ep of only org4"]}' --transient "{\"assetPrice\":\"$ASSETPRICE\"}"
````

### Updating the public data:

Due to the state based endorsement that says both initiator and org4 should sign any transaction 
* Always initiated the invoke the transaction from Initiator or Org4
* Always address the invoke to atleast Initiator and Org4 always (can have additional orgs or all orgs as well)
 
````
as org1 or org4:
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG1 $PEER_ORG4 -c '{"Function":"AssetContract:assetUpdate","Args":["assetNo:1","Call from org1 or org4 addressing org1 and org4"]}' 
as org2 or org4:
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG2 
as org3 or org4:
$PEER_ORG4 -c '{"Function":"AssetContract:assetUpdate","Args":["assetNo:2","Call from org2 or org4 addressing org2 and org4"]}' 
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG3 
as org4:
$PEER_ORG4 -c '{"Function":"AssetContract:assetUpdate","Args":["assetNo:3","Call from org3 or org4 addressing org3 and org4"]}' 
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG4 -c '{"Function":"AssetContract:assetUpdate","Args":["assetNo:4","Call from org4 addressing org4"]}' 
````
### Updating the private data: 
Due to the state based endorsement that says both initiator and org4 should sign any transaction 
* Always initiated the invoke the transaction from Initiator or Org4
* Always address the invoke to atleast Initiator and Org4 always (can have additional orgs or all orgs as well)tates that only 

Additionally the implicit private data collection states that, private data will be available only with the initiator
* Since all implicit policy states for first three asset needs two organization endorsement the private data update cannot be made
* Fourth asset's private data can be updated since 
* Implicit data policy allows only org4 to access the private data so address the invoke to org4
* State based endorsement gets satisfied since Initiator is also org4 so ep is Org4 and Org4
````
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG4 -c '{"Function":"AssetContract:assetUpdatePrivate","Args":["assetNo:4","price00-Update1 from org4"]}' 
````
### Method to verify the private data hash:
The following transaction invokes the method that check the whole transient object with the private data hash stored in the private ledger. This method will be used for the organizations that do not have the access to the private data but contains the private data hash

The method performs the following tasks to verify the private data hash
* Hash the transient object with SHA-256  
* Encode hashed object and the private data with UTF_8 and compare them

Note that the transaction is only addressed to org1 which does not have access to the private data of the asset mentioned
````
export ASSETPRICE=$(echo -n "price-000" | base64 | tr -d \\n)
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG1 -c '{"Function":"AssetContract:assetVerifyHash","Args":["assetNo:4","org4","Org4MSP"]}' --transient "{\"assetPrice\":\"$ASSETPRICE\"}"
````
 
### Querying the public world state:
Query the public world state information using the following method queries
```` 
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetRead","Args":["assetNo:1"]}'
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetRead","Args":["assetNo:2"]}'
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetRead","Args":["assetNo:3"]}'
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetRead","Args":["assetNo:4"]}'
````

### Querying the private data:
Query the private data information using the following method queries
````
works only for org1:
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetReadPrivate","Args":["assetNo:1"]}'
works only for org2:
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetReadPrivate","Args":["assetNo:2"]}'
works only for org3:
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetReadPrivate","Args":["assetNo:3"]}'
works only for org4:
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetReadPrivate","Args":["assetNo:4"]}'
````
