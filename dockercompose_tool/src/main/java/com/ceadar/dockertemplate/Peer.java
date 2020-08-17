package com.ceadar.dockertemplate;

import java.util.List;
 

public class Peer{

	private String container_name;
	
	private String image;
	
	private List<String> environment;
	
	private String working_dir;
	
	private List<String> volumes;
	
	private List<String> ports;
	
	private List<String> networks;

	public String getContainer_name() {
		return container_name;
	}

	public void setContainer_name(String container_name) {
		this.container_name = container_name;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public List<String> getEnvironment() {
		return environment;
	}

	public void setEnvironment(List<String> environment) {
		this.environment = environment;
	}

	public List<String> getVolumes() {
		return volumes;
	}

	public void setVolumes(List<String> volumes) {
		this.volumes = volumes;
	}

	public List<String> getPorts() {
		return ports;
	}

	public void setPorts(List<String> ports) {
		this.ports = ports;
	}

	public List<String> getNetworks() {
		return networks;
	}

	public void setNetworks(List<String> networks) {
		this.networks = networks;
	}

	public String getWorking_dir() {
		return working_dir;
	}

	public void setWorking_dir(String working_dir) {
		this.working_dir = working_dir;
	}
 
}
