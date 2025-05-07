pipeline {
    agent any

    environment {
        PROJECT_DIR = "/home/ubuntu/S12P31S202"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', url: 'https://lab.ssafy.com/your-repo.git', credentialsId: 'your-credential-id'
            }
        }

        stage('Docker Compose Build and Up') {
            steps {
                dir("${PROJECT_DIR}") {
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
}

