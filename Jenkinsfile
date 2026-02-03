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

        stage('Set Environment Variables') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'dev') {
                        env.ENV = "dev"
                    } else if (env.BRANCH_NAME == 'main') {
                        env.ENV = "main"
                    } else {
                        env.ENV = "prod"
                    }

                    echo "🚀 Branch: ${env.BRANCH_NAME}"
                    echo "🌍 Target ENV: ${env.ENV}"

                }
            }
        }


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

        stage('Cleanup Local Docker Images') {
            steps {
                script {
                    echo "🧹 Cleaning up local Docker images (keeping latest ${env.KEEP_IMAGES})"

                    sh '''
                        docker image ls "${IMAGE_NAME}" \
                        --filter "reference=*:${ENV}-*" \
                        --format '{{.Repository}}:{{.Tag}}' | \
                        grep -v ':latest' | \
                        tail -n +$((KEEP_IMAGES+1)) | \
                        xargs -r docker rmi -f 2>/dev/null || true
                    '''
                }
            }
        }

        stage('Cleanup Docker Hub Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "🧹 Cleaning up Docker Hub images (keeping latest ${KEEP_IMAGES})"

                        TOKEN=$(curl -s -X POST https://hub.docker.com/v2/users/login/ \
                        -H "Content-Type: application/json" \
                        -d '{"username": "'"$DOCKER_USER"'", "password": "'"$DOCKER_PASS"'"}' | jq -r .token)

                        curl -s -H "Authorization: JWT $TOKEN" \
                        "https://hub.docker.com/v2/repositories/${IMAGE_NAME}/tags/?page_size=100" | \
                        jq -r '.results | map(select(.name | startswith("1.0."))) | sort_by(.last_updated) | reverse | .['"${KEEP_IMAGES}"':] | .[].name' | \
                        while read TAG; do
                            echo "Deleting remote tag: $TAG"
                            curl -s -X DELETE \
                            -H "Authorization: JWT $TOKEN" \
                            "https://hub.docker.com/v2/repositories/${IMAGE_NAME}/tags/$TAG/"
                            sleep 1
                        done
                    '''
                }
            }
        }

        stage('Update K8s Manifest') {
            steps {
                sh """
                    sed -i 's|image:.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|' \
                    k8s/deployment.yaml
                """
            }
        }   

        /* stage('Deploy to Kubernetes') { 
            steps {
                sshagent(['ssh-k8s']) {
                    sh '''
                        kubectl apply -f k8s/deployment.yaml
                        kubectl apply -f k8s/services.yaml
                    '''
                }
            }
        } */
    }
}

    