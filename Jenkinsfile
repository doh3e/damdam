pipeline {
  agent any

  environment {
    // Keep Docker Compose project name consistent
    COMPOSE_PROJECT_NAME = "k12s202-develop"
    // Use host Docker daemon socket
    DOCKER_HOST = 'unix:///var/run/docker.sock'
    // Store Docker CLI config in workspace to avoid permission issues
    DOCKER_CONFIG = "${WORKSPACE}/.docker"
    SPRING_JWT_SECRET    = credentials('jwt-secret')
  }

  stages {
    stage('Checkout SCM') {
      steps {
        // Clone the repository so docker-compose.yml is in ${WORKSPACE}
        checkout scm
      }
    }

    stage('Clean up old containers') {
      steps {
        dir("${WORKSPACE}") {
          echo '[INFO] Stopping and removing existing containers and orphans...'
          sh '''
            # 볼륨은 삭제하지 않고, orphan 컨테이너만 제거
            docker-compose down --remove-orphans || true
          '''
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        dir("${WORKSPACE}") {
          echo '[INFO] Ensuring Docker config directory exists'
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
