# Blockchain scalability research POC development.

```
Node: v10.17.0
```


## How to run?


### Install and configure
```
npm install --only=prod @hyperledger/caliper-cli@0.3.0
```

#### For Fabric 1.4.1

To bind the caliper version 1.4.1 run the following command
```
npx caliper bind --caliper-bind-sut fabric --caliper-bind-sdk 1.4.1

```

To generate the crypto materials 

Copy the contents of the /config/fabric141 contents into the /config folder
Run the ./generate.sh to generate all the needed crypto materials

#### For Fabric 1.4.4

To bind the caliper version 1.4.4 run the following command
```
npx caliper bind --caliper-bind-sut fabric --caliper-bind-sdk 1.4.4

```
Copy the contents of the /config/fabric144 contents into the /config folder
Run the ./generate.sh to generate all the needed crypto materials


### Run the marble examples

#### For Fabric 1.4.1
```
npx caliper launch master --caliper-benchconfig cal-config/marbles/config.yaml \
--caliper-networkconfig fabric/fabric141/fabric-node-couch.yaml --caliper-workspace .

npx caliper launch master --caliper-benchconfig cal-config/marbles/config-prometheus.yaml \
--caliper-networkconfig fabric/fabric141/fabric-node-prometheus-couch.yaml --caliper-workspace .

```

#### For Fabric 1.4.4
```
npx caliper launch master --caliper-benchconfig cal-config/marbles/config.yaml \
--caliper-networkconfig fabric/fabric144/fabric-node-couch.yaml --caliper-workspace .

```

