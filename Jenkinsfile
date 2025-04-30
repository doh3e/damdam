pipeline {
    agent any

    stages {
        stage('Build Jar') {
            steps {
                sh 'cd demo/demo && ./gradlew clean build'
            }
        }

        stage('Copy Jar') {
            steps {
                sh 'cp demo/demo/build/libs/demo-0.0.1-SNAPSHOT.jar springboot-postgres/'
            }
        }

        stage('Docker Build & Run') {
            steps {
                dir('springboot-postgres') {
                    sh '''
                    docker stop springboot-app || true
                    docker rm springboot-app || true
                    docker build -t springboot-app .
                    docker run -d --name springboot-app -p 8082:8080 springboot-app
                    '''
                }
            }
        }
    }
}

