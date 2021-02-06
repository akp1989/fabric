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
 

public class CLI_Helper {
	

	private static Map<String, String> cache;
	CLI cli;

	private static Properties environmentProperty;
	public CLI_Helper() throws FileNotFoundException, IOException {
		environmentProperty = new Properties();
		environmentProperty.load(new FileInputStream("ceadar/CLI_Environment.properties"));
	}
	
	public CLI cliBuild(String orgName, String[] cliProperties) {
		cache = new HashMap();
		cli = new CLI(); 
		cache.put("peerMSP", cliProperties[0]);
		cache.put("containerName",cliProperties[1]);
		cache.put("peerAddress",cliProperties[2]);
		cache.put("peerPort",cliProperties[3]);
		cache.put("networkName",Config.NETWORK_NAME_ENV);
		cli.setWorking_dir(Config.CLI_WORKING_DIRECTORY);
		cli.setContainer_name(cache.get("containerName"));
		cli.setImage(Config.CLI_IMAGE);
		  
		List<String> networks = new ArrayList<>(); networks.add(Config.NETWORK_NAME);
		cli.setNetworks(networks);
 

		cli.setEnvironment(setPeerEnvironment());
		  
		List<String> volume = new ArrayList<>();
		volume.add(Config.CLI_VOLUME1);
		volume.add(Config.CLI_VOLUME_CHAINCODE);
		volume.add(Config.CLI_VOLUME_CHANNELARTIFACTS);
		volume.add(Config.CRYPTO_LOCATION+orgName+"/msp-peer0"+Config.CLI_VOLUME_MSP);
		volume.add(Config.CRYPTO_LOCATION+orgName+"/msp-tls-peer0"+Config.CLI_VOLUME_TLSMSP);
		volume.add(Config.CRYPTO_LOCATION+orgName+"/adminuser/msp"+Config.CLI_VOLUME_ADMINMSP);
		cli.setVolumes(volume);
		
		cli.setTty(Config.tty);
		cli.setStdin_open(Config.stdin_open);
		cli.setCommand(Config.CLI_COMMAND);
		return cli;
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
