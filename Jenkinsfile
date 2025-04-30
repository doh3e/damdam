pipeline {
    agent any

    environment {
        JAR_NAME = 'demo-0.0.1-SNAPSHOT.jar'
        IMAGE_NAME = 'springboot-app'
        CONTAINER_NAME = 'springboot-app'
        DOCKER_DIR = 'springboot-postgres'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'dev',
                    url: 'https://lab.ssafy.com/s12-final/S12P31S202.git',
                    credentialsId: 'k12s202'
            }
        }

        stage('Build Jar') {
            steps {
                sh './gradlew clean build'
            }
        }

        stage('Copy Jar') {
            steps {
                sh "cp build/libs/${JAR_NAME} ${DOCKER_DIR}/"
            }
        }

        stage('Docker Build & Run') {
            steps {
                sh """
                cd ${DOCKER_DIR}
                docker stop ${CONTAINER_NAME} || true
                docker rm ${CONTAINER_NAME} || true
                docker build -t ${IMAGE_NAME} .
                docker run -d -p 8080:8080 --name ${CONTAINER_NAME} ${IMAGE_NAME}
                """
            }
        }
    }
}

