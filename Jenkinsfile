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

        steps {
                script {
                    echo "🧹 Cleaning up local Docker images (keeping latest ${KEEP_IMAGES})"

                    sh '''
                        docker image ls "${IMAGE_NAME}" \
                        --filter "reference=*:${IMAGE_TAG}" \
                        --format '{{.Repository}}:{{.Tag}}' | \
                        grep -v ':latest' | \
                        tail -n +$((KEEP_IMAGES+1)) | \
                        xargs -r docker rmi -f 2>/dev/null || true
                    '''
                }
        }

        stage('Update K8s Manifest') {
            steps {
                sh """
                    sed -i 's|image:.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|' \
                    k8s/dev/deployment.yaml
                """
            }
        }   

        stage('Deploy to Kubernetes') { 
            steps {
                sshagent(['ssh-k8s']) {
                    sh '''
                        kubectl apply -f k8s/dev/deployment.yaml
                        kubectl apply -f k8s/dev/services.yaml
                    '''
                }
            }
        }
    }
}

    