FROM jenkins/jenkins:lts

# Switch to root to install packages
USER root

# Install necessary packages including Ansible
RUN apt-get update && \
    apt-get install -y \
      python3 \
      python3-pip \
      pipx \
      jq \
      sshpass \
      software-properties-common && \
    apt-add-repository --yes --update ppa:ansible/ansible && \
    apt-get install -y ansible && \
    rm -rf /var/lib/apt/lists/*

# Verify installations
RUN ansible --version && jq --version && python3 --version

# Switch back to jenkins user for security
USER jenkins

