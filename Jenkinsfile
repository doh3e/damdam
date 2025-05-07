pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_DIR = "/var/jenkins_home/S12P31S202"  // docker-compose.yml 있는 경로
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Compose Build and Up') {
            steps {
                dir("${DOCKER_COMPOSE_DIR}") {
                    sh '''
                    echo "Building docker images..."
                    docker-compose build

                    echo "Bringing up containers..."
                    docker-compose up -d
                    '''
                }
            }
        }
    }

    post {
        failure {
            echo "Build Failed!"
        }
        success {
            echo "Build Succeeded!"
        }
    }
}

