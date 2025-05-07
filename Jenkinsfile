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

