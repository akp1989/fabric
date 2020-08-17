# Blockchain scalability research POC development.

## Running it against the existing network - Supported by docker


### Bringing up the docker container	
```
docker-compose up -f ./docker-compose.yaml up -d
```

### Setup folder structure

The setup folder contains two folder

### Cal-Config folder
This folder contains all the scalability configuration
More information can be found here https://hyperledger.github.io/caliper/v0.3.1/fabric-config/

#### config.yaml
This file contains the properties for a benchmark run. We can control few of the following properties

* Total No. of transactions
* Throughput type
* Throughput rate in tps (transactions per second)
* Call back file for the chaincode function call

#### Call back js files
This file contains the smartcontract invoke or query method.

### Config folder
This folder contains all the parameters of the existing fabric network

#### crypto-config
This folder holds all the crypto materials needed for accessing the exsiting blokchain network
(In case of existing local network copy the ./crypto-config folder here)

#### chaincode

Contains the source of the smartcontracts
(In case of existing local network copy the corresponding chaincode from ./chaincode folder here)

#### network-config.yaml

Defines the following aspects of the existing network such as,

* Channel details
* Orderer details
* CA details
* Org details
* Peer details
* Chaincode details
