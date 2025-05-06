pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_DIR = '/var/jenkins_home/springboot-postgres'
        DOCKER_CMD = 'docker'   // docker 경로 명시
    }

    stages {
        stage('Build and Deploy') {
            steps {
                dir("${DOCKER_COMPOSE_DIR}") {
                    echo '[INFO] 기존 컨테이너 종료'
                    sh "${DOCKER_CMD}-compose down"

                    echo '[INFO] 새로 빌드 및 실행'
                    sh "${DOCKER_CMD}-compose up -d --build"
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

