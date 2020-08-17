# Fabric images and binary download

Run all the following commands within the corresponding fabric version directory

## Fabric images and binaries

Run the following curl script to download the required fabric images and binary files

for fabric 1.4.1
```
curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.4.1 1.4.1 0.4.15
```

for fabric 1.4.4
```
curl -sSL http://bit.ly/2ysbOFE | bash -s -- 1.4.4 1.4.4 0.4.18
```



The command will also create a fabric-samples folder containing the sample config and binary files. Copy the binary files directory into the fabric directory

```
cp -R ./fabric-samples/bin ./
```


## Setting the path for fabric binary folders 

```
export PATH=$PATH:$PWD/bin
export FABRIC_CFG_PATH=$PWD/configtx
```

## Generating crypto keys for the network

We will be using the configtxgen tool provided by fabric for generating the keys for Membership services

The configuration file is present at ./cryptogen/crypto-config.yaml

Change the follwing parameters to increase the peer count or user count in ./cryptogen/crypto-config.yaml file. Default will be one orderer and four organizations.

```
Template->Count will specify the count of peers for each organization 
Users->Count will specify the number of users (user1, user2) apart from the default admin user
 ```
Run the following commands to generate the crypto materials in the ./crypto-config directory 

```
cryptogen generate --config=./cryptogen/crypto-config.yaml --output="crypto-config"
```
