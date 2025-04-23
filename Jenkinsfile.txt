pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                echo '✅ 소스코드 가져오는 중...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo '🔨 빌드 중...'
                // 여기에 빌드 명령어 입력 (예: sh 'npm install', ./gradlew build 등)
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 배포 단계'
                // 예시: SSH 연결해서 서버에 배포
            }
        }
    }
}
