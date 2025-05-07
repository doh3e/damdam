pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Compose Build and Up') {
            steps {
                dir("${WORKSPACE}") {
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

