package com.ceadar.dockertemplate;

import java.util.Map;

public class DockerService {
	
	private String version;
	private Map<String, String> volumes;
	private  Map<String,String> networks;
	private  Map<String, Object> services;
	public String getVersion() {
		return version;
	}
	public void setVersion(String version) {
		this.version = version;
	}
	public Map<String, String> getVolumes() {
		return volumes;
	}
	public void setVolumes(Map<String, String> volumes) {
		this.volumes = volumes;
	}
	public Map<String, String> getNetworks() {
		return networks;
	}
	public void setNetworks(Map<String, String> networks) {
		this.networks = networks;
	}
	public Map<String, Object> getServices() {
		return services;
	}
	public void setServices(Map<String, Object> services) {
		this.services = services;
	}
	
	
	
}
