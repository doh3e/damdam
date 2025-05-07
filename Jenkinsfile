pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "k12s202-develop"
    }

    stages {
        stage('Docker Compose Down') {
            steps {
                sh '''
                echo "[INFO] Stopping and removing existing containers..."
                cd /home/ubuntu/S12P31S202
                docker-compose down --volumes --remove-orphans
                '''
            }
        }

        stage('Docker Compose Build and Up') {
            steps {
                sh '''
                echo "[INFO] Building Docker images..."
                cd /home/ubuntu/S12P31S202
                docker-compose build

                echo "[INFO] Starting containers..."
                docker-compose up -d
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

