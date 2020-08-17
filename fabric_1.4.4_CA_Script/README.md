# Crypto generator
This tool will generate peer and orderer certificates required for building up a fabric network

## Limitation

The following are the limitation of the tool

* This script can generate crypto for only one peer (peer0) for each organization
* The CA server and the corresponding TLS server should be running at the same address
* The script generates crypto against fabric-ca-server (tested for version 1.4)
* The credentials for enrolling the fabric-ca-server cannot be changed from it's default value
* All the parameters required are mandatory

## Script usage

./generatecrypto.sh <mode> [-a <Server address>] [-p <Server port>] [-o <Organization name>] [-t <tlsserver-port>] [-d <domain name>] [-s <SANS parameter ip>]

<mode> - peer/orderer

-a - The ip address of the CA server
-p - The port number of the CA server
-o - Organization name for which the credentials are generated
-t - The port number of the TLS CA server
-d - domain name for which the credentials are generated
-s - Sunject alternative names for the domains to be included with the certificate

## Sample Usage

For sample purpose a TLS server and CA server are included along with the script.

* Start the TLS server and CA server
* Copy the ca.cert from the corresponding server folders into client/tls-certs or tlsclient/tls-certs
* Run the script to generate the orderer and peer credentials
* The generated crypto materials will be organized and placed in org_crypto under their organization names

```
./generatecrypto.sh orderer -a localhost -p 7710 -o orderer1 -t 7701 -d ceadar.com -s 127.0.0.1,*.ceadar.com

./generatecrypto.sh peer -a localhost -p 7710 -o orga -t 7701 -d ceadar.com -s 127.0.0.1,*.orga.ceadar.com
./generatecrypto.sh peer -a localhost -p 7710 -o orgb -t 7701 -d ceadar.com -s 127.0.0.1,*.orgb.ceadar.com

```