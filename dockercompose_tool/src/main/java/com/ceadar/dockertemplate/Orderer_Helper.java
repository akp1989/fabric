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
 

public class Orderer_Helper {
	

	private static Map<String, String> cache;
	Orderer orderer;
	
	private static Properties environmentProperty;
	public Orderer_Helper() throws FileNotFoundException, IOException {
		environmentProperty = new Properties();
		environmentProperty.load(new FileInputStream("ceadar/Orderer_Environment.properties"));
	}
	
	public Orderer ordererBuild(String ordererName, String[] ordererProperty) {
		cache = new HashMap();
		orderer = new Orderer(); 
		cache.put("ordererMSP", ordererProperty[0]);
		cache.put("ordererContainer",ordererProperty[1]);
		cache.put("ordererPort",ordererProperty[2]);

		cache.put("networkName",Config.NETWORK_NAME_ENV);

		orderer.setContainer_name(cache.get("ordererContainer"));
		orderer.setImage(Config.ORDERER_IMAGE);
		  
		List<String> networks = new ArrayList<>(); networks.add(Config.NETWORK_NAME);
		orderer.setNetworks(networks);
		  
		List<String> ports = new ArrayList<>(); ports.add(cache.get("ordererPort")+":"+cache.get("ordererPort"));
		orderer.setPorts(ports);

		orderer.setEnvironment(setOrdererEnvironment());
		  
		List<String> volume = new ArrayList<>();
		volume.add(Config.ORDERER_VOLUME1);
		volume.add(Config.CRYPTO_LOCATION+ordererName+"/msp"+Config.ORDERER_VOLUME_MSP);
		volume.add(Config.CRYPTO_LOCATION+ordererName+"/msp-tls-orderer"+Config.ORDERER_VOLUME_TLS);
		volume.add(cache.get("ordererContainer")+"_msp"+Config.ORDERER_VOLUME_FABRIC);
		volume.add(cache.get("ordererContainer")+"_data"+Config.ORDERER_VOLUME_PRODCTION);
		orderer.setVolumes(volume);
		
		return orderer;
	}
	
	public List<String> setOrdererEnvironment() {
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
