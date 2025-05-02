pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_DIR = '/home/ubuntu/springboot-postgres'
    }

    stages {
        stage('Build and Deploy') {
            steps {
                dir("${DOCKER_COMPOSE_DIR}") {
                    echo '[INFO] 기존 컨테이너 종료'
                    sh 'docker compose down'

                    echo '[INFO] 새로 빌드 및 실행'
                    sh 'docker compose up -d --build'
                }
            }
        }
    }

    post {
        success {
            echo '[INFO] 🎉 배포 성공!'
        }
        failure {
            echo '[ERROR] ❌ 배포 실패!'
        }
    }
}

