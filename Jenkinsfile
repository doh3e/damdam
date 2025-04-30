pipeline {
    agent any

    environment {
        PROJECT_DIR = 'demo/demo'  // Spring Boot 프로젝트 폴더
        JAR_NAME = 'demo-0.0.1-SNAPSHOT.jar'
        IMAGE_NAME = 'springboot-app'
        CONTAINER_NAME = 'springboot-app'
        DOCKER_DIR = 'springboot-postgres'
    }

    stages {
        stage('Build Jar') {
            steps {
                sh "cd ${PROJECT_DIR} && ./gradlew clean build"
            }
        }

        stage('Copy Jar') {
            steps {
                sh "cp ${PROJECT_DIR}/build/libs/${JAR_NAME} ${DOCKER_DIR}/"
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

