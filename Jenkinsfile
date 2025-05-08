pipeline {
  agent any

  environment {
    // Keep Compose project name consistent
    COMPOSE_PROJECT_NAME = "k12s202-develop"
    // Use host Docker daemon
    DOCKER_HOST         = 'unix:///var/run/docker.sock'
    // Store Docker CLI config in workspace to avoid permission issues
    DOCKER_CONFIG       = "${WORKSPACE}/.docker"
  }

  stages {
    stage('Checkout SCM') {
      steps {
        // Clone your repo so docker-compose.yml is in ${WORKSPACE}
        checkout scm
      }
    }

    stage('Clean up old containers') {
      steps {
        dir("${WORKSPACE}") {
          echo '[INFO] Stopping and removing existing containers, volumes, and orphans...'
    -     sh 'docker-compose down --volumes --remove-orphans || true'
          // Compose로 띄운 컨테이너들 정리
          sh 'docker-compose down --volumes --remove-orphans || true'
          // 수동으로 떠 있을 수 있는 컨테이너들도 강제 삭제
          sh 'docker rm -f frontend frontend-ssr backend ai-data ai-audio || true'
        }
      }
    }


    stage('Build Docker Images') {
      steps {
        dir("${WORKSPACE}") {
          // Ensure Docker config directory exists
          sh 'mkdir -p "$DOCKER_CONFIG"'

          echo '[INFO] Building Docker images with no cache...'
          sh 'docker-compose build --no-cache'
        }
      }
    }

    stage('Deploy Services') {
      steps {
        dir("${WORKSPACE}") {
          echo '[INFO] Starting containers in detached mode...'
          sh 'docker-compose up -d'
        }
      }
    }
  }

  post {
    success {
      echo '✅ All services have been successfully deployed.'
    }
    failure {
      echo '❌ Deployment failed. Please check the logs.'
    }
  }
}
