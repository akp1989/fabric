export PATH=$PATH:${PWD}/bin
export FABRIC_CFG_PATH=${PWD}/configtx

configtxgen -profile OrgsOrdererGenesis -channelID sysgenchannel -outputBlock ./channelartifacts/genesis.block

configtxgen -profile OrgsChannel -outputCreateChannelTx ./channelartifacts/testchannel.tx -channelID testchannel

configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org1anchor.tx -channelID testchannel -asOrg Org1MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org2anchor.tx -channelID testchannel -asOrg Org2MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org3anchor.tx -channelID testchannel -asOrg Org3MSP
configtxgen -profile OrgsChannel -outputAnchorPeersUpdate ./channelartifacts/Org4anchor.tx -channelID testchannel -asOrg Org4MSP


peer channel create -o orderer1.ceadar.org:7050 -c testchannel -f ./channelartifacts/testchannel.tx --outputBlock ./channelartifacts/testchannel.block --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem

peer channel fetch 0 ./channelartifacts/testchannel_decode.block -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem
peer channel fetch config teschannelconfig.pb -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem

CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/tlscacerts/tlsca-cert.pem
CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/adminmsp
CORE_PEER_ADDRESS=peer0.org1.ceadar.org:7051

peer channel join -b ./channelartifacts/testchannel.block --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/ca-cert.pem
peer channel update -o orderer1.ceadar.org:7050 -c testchannel -f ./channelartifacts/Org1anchor.tx --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem

export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/adminmsp
export CORE_PEER_ADDRESS=peer0.org2.ceadar.org:9051

peer channel fetch 0 ./channelartifacts/	.block -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/ca-cert.pem
peer channel update -o orderer1.ceadar.org:7050 -c testchannel -f ./channelartifacts/Org2anchor.tx --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem

export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/adminmsp
export CORE_PEER_ADDRESS=peer0.org3.ceadar.org:11051

peer channel fetch 0 ./channelartifacts/testchannel.block -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/ca-cert.pem
peer channel update -o orderer1.ceadar.org:7050 -c testchannel -f ./channelartifacts/Org3anchor.tx --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem

export CORE_PEER_LOCALMSPID="Org4MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/tlscacerts/tlsca-cert.pem
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/adminmsp
export CORE_PEER_ADDRESS=peer0.org4.ceadar.org:13051

peer channel fetch 0 ./channelartifacts/testchannel.block -o orderer1.ceadar.org:7050 -c testchannel --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem
peer channel join -b ./channelartifacts/testchannel.block --tls --cafile /etc/hyperledger/fabric/msp/tlscacerts/ca-cert.pem
peer channel update -o orderer1.ceadar.org:7050 -c testchannel -f ./channelartifacts/Org4anchor.tx --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem


export PEER_LIST="--peerAddresses peer0.org1.ceadar.org:7051 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses peer0.org2.ceadar.org:9051 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses peer0.org3.ceadar.org:11051 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses peer0.org4.ceadar.org:13051 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem"

/opt/gopath/src/github.com/chaincode
peer chaincode install -n privateasset -v 1.0 -l java -p /opt/gopath/src/github.com/chaincode/PrivateAsset

peer chaincode instantiate -o orderer1.ceadar.org:7050 --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem -C testchannel -n privateasset -l java -v 1.0 -c '{"Function":"","Args":[]}' -P "AND ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer')"

peer chaincode invoke -o orderer1.ceadar.org:7050 --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem -C testchannel -n privateasset $PEER_LIST -c '{"Function":"AssetContract:assetCreateSimple","Args":["assetTestNo:1","org1","Called from org1 - ep of both org1 and org4"]}'

peer chaincode query -C testchannel -n privateasset -c '{"Function":"AssetContract:assetRead","Args":["assetTestNo:1"]}'





peer chaincode install -n blockchain-smart-contracts -v 0.0.1 -l node -p /opt/gopath/src/github.com/chaincode/blockchain-smart-contracts

peer chaincode instantiate -o orderer1.ceadar.org:7050 --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem -C testchannel -n blockchain-smart-contracts -l node -v 0.0.1 -c '{"Function":"Init","Args":[]}' -P "OR ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer')" --collections-config /opt/gopath/src/github.com/chaincode/blockchain-smart-contracts/generated-collections-for-cli-use.json


peer chaincode upgrade -o orderer1.ceadar.org:7050 --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem -C testchannel -n blockchain-smart-contracts -l node -v 0.0.2 -c '{"Function":"Init","Args":[]}' -P "OR ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer','Org4MSP.peer')" --collections-config /opt/gopath/src/github.com/chaincode/blockchain-smart-contracts/generated-collections-for-cli-use.json

export DATA=$(echo -n "10" | base64 | tr -d \\n)
peer chaincode invoke -o orderer1.ceadar.org:7050 --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem -C testchannel -n blockchain-smart-contracts --peerAddresses 35.228.133.95:7051 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.228.133.95:7251 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.228.133.95:13251 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.195.34.14:13451 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.234.150.215:13651 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.198.103.72:13851 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.204.120.211:14051 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem -c '{"Function":"ProductKeyBatchRequestContract:createProductKeyBatchRequest","Args":["ProductKeyBatchRequestId:1","Publisher001MSP","Provider001MSP"]}' --transient "{\"sku\":\"$DATA\",\"quantity\":\"$DATA\",\"batchID\":\"$DATA\"}"
peer chaincode invoke -o orderer1.ceadar.org:7050 --tls true --cafile /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem -C testchannel -n blockchain-smart-contracts --peerAddresses 35.228.133.95:7051 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.228.133.95:7251 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.228.133.95:13251 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.195.34.14:13451 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.234.150.215:13651 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.198.103.72:13851 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem --peerAddresses 35.204.120.211:14051 --tlsRootCertFiles /etc/hyperledger/fabric/msp/tlscacerts/tlsca-cert.pem -c '{"Function":"ProductKeyContract:createProductKey","Args":["ProductKey:1","DistributorMSP","Publisher001MSP"]}' --transient "{\"keyNumber\":\"$DATA\",\"sKU\":\"$DATA\",\"batchID\":\"$DATA\"}"

peer chaincode query -C testchannel -n blockchain-smart-contracts -c '{"Function":"ProductKeyBatchRequestContract:productKeyBatchRequestExists","Args":["ProductKeyBatchRequestId:1"]}'
peer chaincode query -C testchannel -n blockchain-smart-contracts -c '{"Function":"ProductKeyBatchRequestContract:readProductKeyBatchRequest","Args":["ProductKeyBatchRequestId:1"]}'
peer chaincode query -C testchannel -n blockchain-smart-contracts -c '{"Function":"ProductKeyContract:productKeyExists","Args":["ProductKey:1"]}'
peer chaincode query -C testchannel -n blockchain-smart-contracts -c '{"Function":"ProductKeyContract:readProductKey","Args":["ProductKey:1"]}'
