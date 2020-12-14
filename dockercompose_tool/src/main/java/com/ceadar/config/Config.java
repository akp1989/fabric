package com.ceadar.config;

public class Config {
	public static final String DOCKERFILE_VERSION="2";
	
	public static final String CRYPTO_LOCATION="./../crypto/";
	
	public static final String NETWORK_NAME = "fabric211";
	public static final String NETWORK_NAME_ENV = "fabric_fabric211";
	
	public static final String COUCHDB_DATA_VOLUME = "/opt/couchdb/data";
	public static final String COUCHDB_LOCAL_DATA_VOLUME = "/opt/couchdb/etc/local.d";
	public static final String 	COUCHDB_IMAGE = "hyperledger/fabric-couchdb";
	
	public static final String PEER_IMAGE = "hyperledger/fabric-peer";
    public static final String PEER_VOLUME1 = "/var/run:/host/var/run";
    public static final String PEER_VOLUME_MSP=":/etc/hyperledger/fabric/msp";
    public static final String PEER_VOLUME_TLS=":/etc/hyperledger/fabric/tls";
    public static final String PEER_VOLUME_FABRIC=":/etc/hyperledger/fabric";
    public static final String PEER_VOLUME_PRODCTION=":/var/hyperledger/production";
    
    public static final String PEER_WORKING_DIRECTORY="/opt/gopath/src/github.com/hyperledger/fabric/peer";
    
    public static final String ORDERER_IMAGE = "hyperledger/fabric-orderer";
    public static final String ORDERER_VOLUME1 = "./../channelartifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block";
    public static final String ORDERER_VOLUME_MSP=":/var/hyperledger/orderer/msp";
    public static final String ORDERER_VOLUME_TLS=":/var/hyperledger/orderer/tls";
    public static final String ORDERER_VOLUME_FABRIC=":/var/hyperledger/orderer";
    public static final String ORDERER_VOLUME_PRODCTION=":/var/hyperledger/production";
    

    
    
     
    
}
