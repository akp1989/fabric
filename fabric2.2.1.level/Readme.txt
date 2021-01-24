export PATH=$PATH:${PWD}/bin
export FABRIC_CFG_PATH=${PWD}/configtx


(From v2.x Etcdraft is the default consensus)
configtxgen -profile OrgsOrdererGenesis -channelID sysgenchannel -outputBlock ./channelartifacts/genesis.block 

configtxgen -profile OrgsChannel -outputCreateChannelTx ./channelartifacts/testchannel.tx -channelID testchannel

configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org1anchor.tx -channelID testchannel -asOrg Org1MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org2anchor.tx -channelID testchannel -asOrg Org2MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org3anchor.tx -channelID testchannel -asOrg Org3MSP

cryptogen generate --config ./cryptogen/crypto-config.yaml --output ./crypto-config



peer channel fetch 0 ./channelartifacts/testchannel_decode.block -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem
peer channel fetch config teschannelconfig.pb -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem
configtxlator proto_decode --input genesis.block --type common.Block > genesis.json


export ORDERER_CA=/home/prabhakaran/workspace/fabric/fabric2.2.1.level/crypto/orderer/msp/tlscacerts/tlsca-cert.pem
export FABRIC_CFG_PATH=${PWD}/configtxorgcore
export PATH=$PATH:${PWD}/bin
export PEER_ORG1=" --peerAddresses localhost:7051 --tlsRootCertFiles ./crypto/org1/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_ORG2=" --peerAddresses localhost:9051 --tlsRootCertFiles ./crypto/org2/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_ORG3=" --peerAddresses localhost:11051 --tlsRootCertFiles ./crypto/org3/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_LIST="--peerAddresses localhost:7051 --tlsRootCertFiles ./crypto/org1/msp-tls-peer0/tlscacerts/tlsca-cert.pem --peerAddresses localhost:9051 --tlsRootCertFiles ./crypto/org2/msp-tls-peer0/tlscacerts/tlsca-cert.pem --peerAddresses localhost:11051 --tlsRootCertFiles ./crypto/org3/msp-tls-peer0/tlscacerts/tlsca-cert.pem"


export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/org1/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/org1/adminuser/msp
export CORE_PEER_ADDRESS=localhost:7051

peer channel create -o localhost:7050 -c testchannel -f ./channelartifacts/testchannel.tx --outputBlock ./channelartifacts/testchannel.block --tls true --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Org1anchor.tx --tls true --cafile ${ORDERER_CA}


export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/org2/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/org2/adminuser/msp
export CORE_PEER_ADDRESS=localhost:9051

peer channel fetch 0 ./channelartifacts/testchannel.block -o localhost:7050 -c testchannel --tls --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Org2anchor.tx --tls true --cafile ${ORDERER_CA}


export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/org3/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/org3/adminuser/msp
export CORE_PEER_ADDRESS=localhost:11051


peer channel fetch 0 ./channelartifacts/testchannel.block -o localhost:7050 -c testchannel --tls --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Org3anchor.tx --tls true --cafile ${ORDERER_CA}



CC_RUNTIME_LANGUAGE = golang/javascript/java/typescript

go:
	CC_RUNTIME_LANGUAGE=golang
	pushd ../chaincode/fabcar/go
	GO111MODULE=on go mod vendor
	popd
javascript:
	CC_RUNTIME_LANGUAGE=node
java:
	CC_RUNTIME_LANGUAGE=java
	pushd ../chaincode/fabcar/java
	./gradlew installDist
	popd
typescript:
	CC_RUNTIME_LANGUAGE=node
	pushd ../chaincode/fabcar/typescript
	npm install
	npm run build
	popd


export CC_RUNTIME_LANGUAGE=java
export CHANNEL_NAME="testchannel"
export PACKAGE_ID="privateasset_4.0:c5e0e7c76c3e6a92a0f364373c48ed4fcba6d14413527939d03550d3c6596223"
export SEQUENCE="5"
export VERSION="4.0"

peer lifecycle chaincode package ./chaincode/privateasset_${VERSION}_${SEQUENCE}.tar.gz --path ./chaincode/PrivateAsset --lang ${CC_RUNTIME_LANGUAGE} --label privateasset_${VERSION}

peer lifecycle chaincode install ./chaincode/privateasset_${VERSION}_${SEQUENCE}.tar.gz

peer lifecycle chaincode approveformyorg -o localhost:7050 --tls true --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name privateasset --version ${VERSION} --package-id ${PACKAGE_ID} --sequence ${SEQUENCE} --signature-policy "OR('Org1MSP.peer', 'Org2MSP.peer', 'Org3MSP.peer')"

peer lifecycle chaincode commit -o localhost:7050 --tls true --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name privateasset $PEER_LIST --version ${VERSION} --sequence ${SEQUENCE} --signature-policy "OR('Org1MSP.peer', 'Org2MSP.peer', 'Org3MSP.peer')"

peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name privateasset --version ${VERSION} --sequence ${SEQUENCE} --output json 

/******************************************************************************************************
/* Creating the records for the first time:
/* 
/*  1)State based endorsement policy needs both Initiator and Org4 to sign the endorsemnt
/*  2)Implicit policy states that Intiator will only have access to private data
/******************************************************************************************************
export ASSETPRICE=$(echo -n "price-00" | base64 | tr -d \\n)
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_LIST -c '{"Function":"AssetContract:assetCreate","Args":["assetNo:1","org1","Called from org1"]}' --transient "{\"assetPrice\":\"$ASSETPRICE\"}"
******************************************************************************************************************************
/* Updating the transaction
/*  1) State based endorsement says Intiator and Org4 should sign
/*       So always address the invoke to Initiator and Org4 always 
/*       Always initiated the invoke the transaction from Initiator or Org4 (any orgs in the state level endorsement policy)  
/******************************************************************************************************************************
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG1 -c '{"Function":"AssetContract:assetUpdate","Args":["assetNo:1","Calling from org1 for update1"]}' 

peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_LIST -c '{"Function":"AssetContract:assetUpdate","Args":["assetNo:1","Calling from org1 for update2"]}' 


/***********************************************************************************************************************************
/* Updating the private data 
/*  1) State based endorsement says Intiator and Org4 should sign
/*       So always address the invoke to Initiator and Org4 always 
/*       Always initiated the invoke the transaction from Initiator or Org4 (any orgs in the state level endorsement policy) 
/*  2) Implicit policy States that only the Initiator has access to the private data
/*  
/* <Since all implicit policy states for first three asset needs two organization endorsement the private data update cannot be made
/*  Fourth asset's private data can be updated since 
/*      Implicit data policy allows only org4 to access the private data so address the invoke to org4
/*      State based endorsement gets satisfied since Initiator is also org4 so ep is Org4 and Org4
/************************************************************************************************************************************
export ASSETPRICE=$(echo -n "price-03" | base64 | tr -d \\n)
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG1 -c '{"Function":"AssetContract:assetUpdatePrivate","Args":["assetNo:1","price03-Update1 from Org1"]}' 

/************************************************************************************************************************************
/* Checking the private hash against the passed information
/*
/*  A) Hash the transient object with SHA-256  
/*  B) Encode hashed object and the private data with UTF_8 and compare them
/*
/************************************************************************************************************************************
export ASSETPRICE=$(echo -n "price-00" | base64 | tr -d \\n)
peer chaincode invoke -o localhost:7050 --tls true --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n privateasset $PEER_ORG1 -c '{"Function":"AssetContract:assetVerifyHash","Args":["assetNo:4","org4","Org4MSP"]}' --transient "{\"assetPrice\":\"$ASSETPRICE\"}"

/************************************************************
/* Querying the public world state
/*
/*
/************************************************************
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetRead","Args":["assetNo:1"]}'
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:getTransactionHistory","Args":["assetNo:1"]}'

/************************************************************
/* Querying the private data
/*
/*
/************************************************************
peer chaincode query -C ${CHANNEL_NAME} -n privateasset -c '{"Function":"AssetContract:assetReadPrivate","Args":["assetNo:1"]}'
