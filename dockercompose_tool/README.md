# Docker compose generator
This tool will generate the docker compose files required to start and run a fabric network

## Limitation

The following are the limitation of this docker compose file generator

* This script can generate crypto for only one peer (peer0) for each organization
* The details for the Peer, orderer and CLI has to be provided in the corresponding property files
* This tool is desgined for the folder structure of the defaullt fabric network reposiotory (Values are defined under config.java)

## Usage

TestCreateDocker.java is the main class that contains the main method to generate the docker compose file.

The ./target folder contains the executable or can be run as a maven project under any IDE.

The properties for the peer, orderer or cli are all mentioned within the corresponding files inside ./ceadar folder.

The output docker-compose-test.yaml file will be generated inside ./caliper/docker-compose-file folder

