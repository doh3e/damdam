pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_DIR = '/home/ubuntu/springboot-postgres'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo '[INFO] 최신 코드 가져오기 (이미 Jenkins가 알아서 Git Pull 했으면 이 스테이지 생략 가능)'
                // Git SCM 자동 연동되어 있으면 이 스테이지는 Jenkins가 기본으로 처리하니까 없어도 됨
            }
        }

        stage('Build and Deploy') {
            steps {
                echo '[INFO] springboot-postgres 디렉토리로 이동'
                dir("${DOCKER_COMPOSE_DIR}") {
                    echo '[INFO] 기존 컨테이너 down'
                    sh 'sudo docker compose down'

                    echo '[INFO] docker-compose 새로 build 및 up'
                    sh 'sudo docker compose up -d --build'
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

