pipeline {
  agent any

  environment {
    // optional: keeps volume/network names consistent
    COMPOSE_PROJECT_NAME = "k12s202-develop"
  }

  stages {
    stage('Checkout SCM') {
      steps {
        // clone your repo so docker-compose.yml is in ${env.WORKSPACE}
        checkout scm
      }
    }


    stage('Build with DIND') {
      // 이 스테이지만 DIND 에이전트에서 실행
      agent {
        docker {
          image 'docker:24.0.5-dind'
          // privilege 모드 + TLS 비활성화 + 인증서 볼륨 바인드
          args '--privileged -e DOCKER_TLS_CERTDIR="" -v jenkins-docker-certs:/certs/client'
        }
      }
      environment {
        // UNIX 소켓 대신 TLS 비활성화 했으므로 기본 소켓 경로 사용
        DOCKER_HOST = 'unix:///var/run/docker.sock'
      }
      steps {
        sh 'docker info'                         // 데몬 정상 동작 확인
        sh 'docker build -t my-app:${GIT_COMMIT} .'  // 이미지 빌드
        sh 'docker-compose up --build -d'         // docker-compose 사용 예시
      }
    }
  

    stage('Docker Compose Down') {
      steps {
        // make sure we run inside the checked-out repo
        dir("${env.WORKSPACE}") {
          sh '''
            echo "[INFO] Stopping and removing existing containers..."
            docker-compose down --volumes --remove-orphans
          '''
        }
      }
    }

    stage('Docker Compose Build and Up') {
      steps {
        dir("${env.WORKSPACE}") {
          sh '''
            echo "[INFO] Building Docker images..."
            docker-compose build

            echo "[INFO] Starting containers..."
            docker-compose up -d
          '''
        }
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

