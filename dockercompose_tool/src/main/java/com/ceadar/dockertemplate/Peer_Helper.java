package com.ceadar.dockertemplate;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import com.ceadar.config.Config;
 

public class Peer_Helper {
	

	private static Map<String, String> cache;
	Peer peer;
	
	private static Properties couchDBProperty;
	private static Properties environmentProperty;
	public Peer_Helper() throws FileNotFoundException, IOException {
		couchDBProperty = new Properties();
		couchDBProperty.load(new FileInputStream("ceadar/CouchDB.properties"));
		environmentProperty = new Properties();
		environmentProperty.load(new FileInputStream("ceadar/Peer_Environment.properties"));
	}
	
	public Peer peerBuild(String orgName, String[] peerProperty) {
		cache = new HashMap();
		peer = new Peer(); 
		cache.put("orgMSP", peerProperty[0]);
		cache.put("containerName",peerProperty[1]);
		cache.put("containerPort",peerProperty[2]);
		cache.put("containerPort1",peerProperty[3]);
		
		peerProperty = couchDBProperty.getProperty(orgName).split(",");
		cache.put("couchDBContainerName",peerProperty[0]);
		cache.put("networkName",Config.NETWORK_NAME_ENV);
		peer.setWorking_dir(Config.PEER_WORKING_DIRECTORY);
		peer.setContainer_name(cache.get("containerName"));
		peer.setImage(Config.PEER_IMAGE);
		  
		List<String> networks = new ArrayList<>(); networks.add(Config.NETWORK_NAME);
		peer.setNetworks(networks);
		  
		List<String> ports = new ArrayList<>(); ports.add(cache.get("containerPort")+":"+cache.get("containerPort"));
		peer.setPorts(ports);

		peer.setEnvironment(setPeerEnvironment());
		  
		List<String> volume = new ArrayList<>();
		volume.add(Config.PEER_VOLUME1);
		volume.add(Config.CRYPTO_LOCATION+orgName+"/msp-peer0"+Config.PEER_VOLUME_MSP);
		volume.add(Config.CRYPTO_LOCATION+orgName+"/msp-tls-peer0"+Config.PEER_VOLUME_TLS);
		volume.add(cache.get("containerName")+"_msp"+Config.PEER_VOLUME_FABRIC);
		volume.add(cache.get("containerName")+"_data"+Config.PEER_VOLUME_PRODCTION);
		peer.setVolumes(volume);
		
		return peer;
	}
	
	public List<String> setPeerEnvironment() {
		String environmentEntry = "";
		List<String> environmentList = new ArrayList<>();
		Set<Object> environmentKeys = environmentProperty.keySet();
		for(Object environmentKey : environmentKeys ) {
			
			environmentEntry =replaceCacheValues(environmentProperty.getProperty(environmentKey.toString()));
			environmentEntry = environmentKey.toString().concat("=").concat(environmentEntry);		    
		    environmentList.add(environmentEntry);
		}
		return environmentList;
	}
	
	public String replaceCacheValues(String property) {
		String temp = "";
		while(property.contains("<")) {
			int start = property.indexOf('<');
			int end = property.indexOf('>');
			temp = property.replaceFirst(property.substring(start, end+1),  cache.get(property.substring(start+1, end)).toString());
			property = temp;
		}
		
		return property;
	}
}
