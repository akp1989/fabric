package com.ceadar.dockertemplate;

import java.util.List;
 

public class CLI{

	private String container_name;
	
	private String image;
	
	private boolean tty;
	
	private boolean stdin_open;
	
	private List<String> environment;
	
	private String working_dir;
	
	private String command;
	
	private List<String> volumes;
 	
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

	public boolean isTty() {
		return tty;
	}

	public void setTty(boolean tty) {
		this.tty = tty;
	}

	public boolean isStdin_open() {
		return stdin_open;
	}

	public void setStdin_open(boolean stdin_open) {
		this.stdin_open = stdin_open;
	}

	public List<String> getEnvironment() {
		return environment;
	}

	public void setEnvironment(List<String> environment) {
		this.environment = environment;
	}

	public String getWorking_dir() {
		return working_dir;
	}

	public void setWorking_dir(String working_dir) {
		this.working_dir = working_dir;
	}

	public String getCommand() {
		return command;
	}

	public void setCommand(String command) {
		this.command = command;
	}

	public List<String> getVolumes() {
		return volumes;
	}

	public void setVolumes(List<String> volumes) {
		this.volumes = volumes;
	}

	public List<String> getNetworks() {
		return networks;
	}

	public void setNetworks(List<String> networks) {
		this.networks = networks;
	}


 
}
