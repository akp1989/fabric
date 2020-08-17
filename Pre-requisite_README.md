# Pre - requisite installation for running fabric

## Docker installation

Refer https://docs.docker.com/install/linux/docker-ce/ubuntu/

```
sudo apt-get remove docker docker-engine docker.io containerd runc

sudo apt-get update

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo apt-key fingerprint 0EBFCD88

sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
   
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io
```

To test the docker installation
```
sudo docker run hello-world - To test the installation
```

Run the following commands and restart the machine for non-sudo previlage of docker
```
sudo groupadd docker

sudo usermod -aG docker <username>
```

To uninstall docker
```
sudo apt-get purge docker-ce
sudo rm -rf /var/lib/docker
```

Commands for docker daemon service (optional - used while debugging)
```
systemctl stop/start docker - To stop the docker service and start it back 
systemctl daemon-reload  - To reload the daemon service 
```

## Docker-compose installation

To install the docker-compose use the following CURL commmand
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose
```

To check the version of the docker-compose installed
```
docker-compose --version - to check the version and installation
```

To uninstall docker-compose
```
sudo rm /usr/local/bin/docker-compose
```

## Node js installation

Run the following CURL command to install node js
```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install nodejs
```

## Node Version Manager installation
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
source ~/.profile
```
## Node-gyp installation
```
sudo apt-get install node-gyp
```

## Python installation
```
sudo apt-get install python
```

## Golang installation

Follow the commands for go lang installation
```
sudo apt-get update
sudo add-apt-repository ppa:longsleep/golang-backports	
sudo apt update
sudo apt install golang-go
```

Set the go path 

Add the following two lines in the in $HOME/profile.sh file
```
export PATH=$PATH:/usr/lib/go-1.14/bin

export GOPATH=$HOME/gopath

source ~/.profile
```
