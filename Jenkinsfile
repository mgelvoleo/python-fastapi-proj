pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        IMAGE_NAME = "mgelvoleo/fastapi-app"
        IMAGE_TAG = "1.0.${BUILD_NUMBER}"
        KEEP_IMAGES = "5"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS' 
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Image & Push to Docker Hub') {
            steps {
                sh '''
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }


        stage('Deploy to Kubernetes') { 
            steps {
                sshagent(['ssh-k8s']) {
                    sh '''
                        kubectl apply -f k8s/deployment.yaml
                    '''
                }
            }
        }
    }
}

    