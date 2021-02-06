package com.ceadar.dockertemplate;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import com.ceadar.config.Config;
 

public class CouchDB_Helper {
	
	private static String containerName;
	private static String containerPort;
	private static Properties property;
	
	public CouchDB_Helper() throws FileNotFoundException, IOException {
		property = new Properties();
		property.load(new FileInputStream("ceadar/CouchDB.properties"));
	}
	
	public CouchDB couchDBBuild(String orgName) {
		CouchDB couchDB = new CouchDB(); 
		String[] propertyValue = (property.getProperty(orgName).split(","));
		containerName = propertyValue[0];
		containerPort = propertyValue[1];
		
		couchDB.setContainer_name(containerName);
		couchDB.setImage(Config.COUCHDB_IMAGE);
		  
		List<String> networks = new ArrayList<>(); networks.add(Config.NETWORK_NAME);
		couchDB.setNetworks(networks);
		  
		List<String> ports = new ArrayList<>(); ports.add(containerPort+":5984");
		couchDB.setPorts(ports);
		  
		List<String> environment = new ArrayList<>();
		environment.add("COUCHDB_USER="); environment.add("COUCHDB_PASSWORD=");
		couchDB.setEnvironment(environment);
		  
		List<String> volume = new ArrayList<>();
		volume.add(containerName+"_data:/opt/couchdb/data");
		volume.add(containerName+"_etc:/opt/couchdb/etc/local.d");
		couchDB.setVolumes(volume);
		
		return couchDB;
	}
}
