pipeline {
    agent any

    options {
        skipDefaultCheckout()
    }

    environment {
        COMPOSE_PROJECT_NAME = "k12s202-develop"
    }

    stages {
        stage('Docker Compose Down') {
            steps {
                sh '''
                echo "[INFO] Stopping and removing existing containers..."
                docker-compose down --volumes --remove-orphans
                '''
            }
        }

        stage('Docker Compose Build and Up') {
            steps {
                sh '''
                echo "[INFO] Building Docker images..."
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

