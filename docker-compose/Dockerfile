FROM jenkins/jenkins:lts

USER root

ARG KUBECTL_VERSION=v1.30.0
ARG JAVA_VERSION=17.0.9.1_1
ARG JAVA_BUILD=17.0.9.1+1
ARG JAVA_URL=https://github.com/adoptium/temurin17-binaries/releases/download/jdk-${JAVA_BUILD}/OpenJDK17U-jdk_x64_linux_hotspot_${JAVA_VERSION}.tar.gz

# -----------------------------
# Non-interactive for apt
# -----------------------------
ENV DEBIAN_FRONTEND=noninteractive

# -----------------------------
# Install essential utilities
# -----------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      gnupg \
      jq \
      sshpass \
      wget \
      git \
      sudo \
      python3 \
      python3-pip \
      python3-venv && \
    rm -rf /var/lib/apt/lists/*

# -----------------------------
# Install Docker CLI (official)
# -----------------------------
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" \
      > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

# -----------------------------
# Install OpenJDK Temurin 17 (prebuilt binary)
# -----------------------------
    RUN mkdir -p /opt/java && \
    curl -fsSL https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.17+10/OpenJDK17U-jdk_x64_linux_hotspot_17.0.17_10.tar.gz \
      -o /tmp/jdk.tar.gz && \
    tar -xzf /tmp/jdk.tar.gz -C /opt/java --strip-components=1 && \
    rm /tmp/jdk.tar.gz

ENV JAVA_HOME=/opt/java
ENV PATH="$JAVA_HOME/bin:$PATH"


# -----------------------------
# Install kubectl
# -----------------------------
RUN curl -fsSL https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl \
      -o /usr/local/bin/kubectl && \
    chmod +x /usr/local/bin/kubectl

# -----------------------------
# Python virtual environment
# -----------------------------
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir ansible

# -----------------------------
# Symlinks for global access
# -----------------------------
RUN ln -sf /opt/venv/bin/ansible /usr/local/bin/ansible && \
    ln -sf /opt/venv/bin/ansible-playbook /usr/local/bin/ansible-playbook && \
    ln -sf /opt/venv/bin/ansible-galaxy /usr/local/bin/ansible-galaxy

# -----------------------------
# Verification (fail fast for CLI tools)
# -----------------------------
RUN java -version && \
    docker --version && \
    ansible --version && \
    kubectl version --client && \
    jq --version && \
    python3 --version

# -----------------------------
# Jenkins runtime user
# -----------------------------
USER jenkins
