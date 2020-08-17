package com.ceadar.dockercompose;


import java.io.File;
import java.io.FileInputStream;
import java.io.IOException; 
import java.util.HashMap; 
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import com.ceadar.config.Config;
import com.ceadar.dockertemplate.CLI;
import com.ceadar.dockertemplate.CLI_Helper;
import com.ceadar.dockertemplate.CouchDB;
import com.ceadar.dockertemplate.CouchDB_Helper;
import com.ceadar.dockertemplate.DockerService;
import com.ceadar.dockertemplate.Orderer;
import com.ceadar.dockertemplate.Orderer_Helper;
import com.ceadar.dockertemplate.Peer;
import com.ceadar.dockertemplate.Peer_Helper;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLGenerator;

public class TestCreateDocker {
    
	private static String orgName;
	private static String ordererName;

	public static void main(String[] args) throws JsonGenerationException, JsonMappingException, IOException {
		// TODO Auto-generated method stub
		CouchDB_Helper couchdb_helper = new CouchDB_Helper();
		Peer_Helper peer_helper = new Peer_Helper();
		Orderer_Helper orderer_helper = new Orderer_Helper();
		CLI_Helper cli_helper = new CLI_Helper();
		
		Properties peerProperty = new Properties();
		Properties ordererProperty = new Properties();
		Properties cliProperty = new Properties();
		
		DockerService dockerService = new DockerService();
			
		Map<String, Object> serviceMap = new HashMap<>();
		Map<String, String> volumeMap = new HashMap<>();
		Map<String, String> networks = new HashMap<>();
		
		peerProperty.load(new FileInputStream("ceadar/Peer.properties"));
		ordererProperty.load(new FileInputStream("ceadar/Orderer.properties"));
		cliProperty.load(new FileInputStream("ceadar/CLI.properties"));
		
		final ObjectMapper mapper = new ObjectMapper(new YAMLFactory().enable(YAMLGenerator.Feature.MINIMIZE_QUOTES)
																	.disable(YAMLGenerator.Feature.WRITE_DOC_START_MARKER)
																	.enable(YAMLGenerator.Feature.INDENT_ARRAYS));
		
		Set<Object> propertyKeys = peerProperty.keySet();
		for(Object propertyKey: propertyKeys) {
			orgName = propertyKey.toString();
			String[] peerProperties = peerProperty.getProperty(orgName).split(",");
			 
			CouchDB couchDB = couchdb_helper.couchDBBuild(orgName);
			serviceMap.put(couchDB.getContainer_name(),couchDB);
			volumeMap.put(couchDB.getContainer_name()+"_data","");
			volumeMap.put(couchDB.getContainer_name()+"_etc","");
			
			Peer peer = peer_helper.peerBuild(orgName,peerProperties);
			serviceMap.put(peer.getContainer_name(), peer);
			volumeMap.put(peer.getContainer_name().concat("_msp"),"");
			volumeMap.put(peer.getContainer_name()+"_data","");
			
			if(cliProperty.containsKey(orgName)) {
				CLI cli = cli_helper.cliBuild(orgName, cliProperty.getProperty(orgName).split(","));
				serviceMap.put(cli.getContainer_name(),cli);
			}else
			{
				System.out.println("The CLI config not available for : "+ orgName);
			}
			networks.put(Config.NETWORK_NAME,"");
		}
		propertyKeys.clear();
		propertyKeys = ordererProperty.keySet();
		for(Object propertyKey: propertyKeys) {
			ordererName = propertyKey.toString();
			String[] ordererProperties = ordererProperty.getProperty(ordererName).split(",");
			Orderer orderer = orderer_helper.ordererBuild(ordererName, ordererProperties);
			serviceMap.put(orderer.getContainer_name(),orderer);
			volumeMap.put(orderer.getContainer_name().concat("_msp"),"");
			volumeMap.put(orderer.getContainer_name()+"_data","");
		}
		dockerService.setVersion(Config.DOCKERFILE_VERSION);
		dockerService.setVolumes(volumeMap);
		dockerService.setNetworks(networks);
		dockerService.setServices(serviceMap);

		
		mapper.writeValue(new File("ceadar/docker-compose-file/docker-compose-test.yaml"), dockerService);
	}
}