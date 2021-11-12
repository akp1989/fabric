export PATH=$PATH:${PWD}/bin
export FABRIC_CFG_PATH=${PWD}/configtx


(From v2.x Etcdraft is the default consensus)
configtxgen -profile OrgsOrdererGenesis -channelID sysgenchannel -outputBlock ./channelartifacts/genesis.block 

configtxgen -profile OrgsChannel -outputCreateChannelTx ./channelartifacts/testchannel.tx -channelID testchannel

configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Rootanchor.tx -channelID testchannel -asOrg RootMSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Testanchor.tx -channelID testchannel -asOrg TestMSP

cryptogen generate --config ./cryptogen/crypto-config.yaml --output ./crypto-config



peer channel fetch 0 ./channelartifacts/testchannel_decode.block -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem
peer channel fetch config teschannelconfig.pb -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem
configtxlator proto_decode --input genesis.block --type common.Block > genesis.json


export ORDERER_CA=/home/prabhakaran/workspace/fabric-ripe/fabric2.2.1.level/crypto/orderer/msp/tlscacerts/tlsca-cert.pem
export FABRIC_CFG_PATH=${PWD}/configtxorgcore
export PATH=$PATH:${PWD}/bin
export PEER_ORG1=" --peerAddresses localhost:7051 --tlsRootCertFiles ./crypto/root/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_ORG2=" --peerAddresses localhost:9051 --tlsRootCertFiles ./crypto/test/msp-tls-peer0/tlscacerts/tlsca-cert.pem"
export PEER_LIST="--peerAddresses localhost:7051 --tlsRootCertFiles ./crypto/root/msp-tls-peer0/tlscacerts/tlsca-cert.pem --peerAddresses localhost:9051 --tlsRootCertFiles ./crypto/test/msp-tls-peer0/tlscacerts/tlsca-cert.pem"


export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="RootMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/root/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/root/adminuser/msp
export CORE_PEER_ADDRESS=localhost:7051

peer channel create -o localhost:7050 -c testchannel -f ./channelartifacts/testchannel.tx --outputBlock ./channelartifacts/testchannel.block --tls true --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Rootanchor.tx --tls true --cafile ${ORDERER_CA}


export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="TestMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto/test/msp-tls-peer0/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto/test/adminuser/msp
export CORE_PEER_ADDRESS=localhost:9051

peer channel fetch 0 ./channelartifacts/testchannel.block -o localhost:7050 -c testchannel --tls --cafile ${ORDERER_CA}
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile ${ORDERER_CA}
peer channel update -o localhost:7050 -c testchannel -f ./channelartifacts/Testanchor.tx --tls true --cafile ${ORDERER_CA}




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
export PACKAGE_ID="asset_1.0:fea87de10b6de13b97e2cf873c6cc0c3d1444087aef21aa18c4c28875e51315c"
export SEQUENCE="1"
export VERSION="1.0"

peer lifecycle chaincode package ./chaincode/asset_${VERSION}_${SEQUENCE}.tar.gz --path ./chaincode/Asset --lang ${CC_RUNTIME_LANGUAGE} --label asset_${VERSION}

peer lifecycle chaincode install ./chaincode/asset_${VERSION}_${SEQUENCE}.tar.gz

peer lifecycle chaincode approveformyorg -o localhost:7050 --tls true --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name asset --version ${VERSION} --package-id ${PACKAGE_ID} --sequence ${SEQUENCE} --signature-policy "OR('RootMSP.peer', 'TestMSP.peer')"

peer lifecycle chaincode commit -o localhost:7050 --tls true --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name asset $PEER_LIST --version ${VERSION} --sequence ${SEQUENCE} --signature-policy "OR('RootMSP.peer', 'TestMSP.peer')"

peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name asset --version ${VERSION} --sequence ${SEQUENCE} --output json 


