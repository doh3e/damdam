pipeline {
  agent any

  environment {
    // Keep Docker Compose project name consistent
    COMPOSE_PROJECT_NAME = "k12s202-develop"
    // Use host Docker daemon socket
    DOCKER_HOST = 'unix:///var/run/docker.sock'
    // Store Docker CLI config in workspace to avoid permission issues
    DOCKER_CONFIG = "${WORKSPACE}/.docker"
  }

  stages {
    stage('Checkout SCM') {
      steps {
        // Clone the repository so docker-compose.yml is in ${WORKSPACE}
        checkout scm
      }
    }

    stage('Prepare .env') {
      steps {
        echo '[INFO] Copying .env into workspace...'
        // EC2 홈디렉터리의 .env를 워크스페이스 루트로 복사
        sh 'cp /home/ubuntu/S12P31S202/.env ${WORKSPACE}/.env'
      }
    }
    
    stage('Clean up old containers') {
      steps {
        dir("${WORKSPACE}") {
          echo '[INFO] Stopping and removing existing containers, volumes, and orphans...'
          sh '''
            docker-compose down --volumes --remove-orphans || true
            docker rm -f frontend frontend-ssr backend ai-data ai-audio redis postgres || true
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
