// pipeline {
//   agent any

//   environment {
//     // optional: keeps volume/network names consistent
//     COMPOSE_PROJECT_NAME = "k12s202-develop"
//   }

//   stages {
//     stage('Checkout SCM') {
//       steps {
//         // clone your repo so docker-compose.yml is in ${env.WORKSPACE}
//         checkout scm
//       }
//     }


//     stage('Build with DIND') {
//       agent {
//         docker {
//           image 'docker:24.0.5-dind'
//           args """
//             --privileged
//             -e DOCKER_TLS_CERTDIR=""
//             -e DOCKER_CONFIG=/root/.docker
//             -v jenkins-docker-certs:/certs/client
//             -v ${env.WORKSPACE}/.docker:/root/.docker
//           """
//         }
//       }
//       environment {
//         // DinD 컨테이너가 내부 데몬 소켓을 사용하도록
//         DOCKER_HOST = 'unix:///var/run/docker.sock'
//       }
//       steps {
//         // 워크스페이스에 .docker 디렉토리 생성
//         sh 'mkdir -p ${WORKSPACE}/.docker'
//         sh 'docker info'                        
//         sh 'docker build -t my-app:${GIT_COMMIT} .'  
//         sh 'docker-compose up --build -d'         
//       }
//     }
  

//     stage('Docker Compose Down') {
//       steps {
//         // make sure we run inside the checked-out repo
//         dir("${env.WORKSPACE}") {
//           sh '''
//             echo "[INFO] Stopping and removing existing containers..."
//             docker-compose down --volumes --remove-orphans
//           '''
//         }
//       }
//     }

//     stage('Docker Compose Build and Up') {
//       steps {
//         dir("${env.WORKSPACE}") {
//           sh '''
//             echo "[INFO] Building Docker images..."
//             docker-compose build

//             echo "[INFO] Starting containers..."
//             docker-compose up -d
//           '''
//         }
//       }
//     }
//   }

//   post {
//     always {
//       echo 'Pipeline finished.'
//     }
//     failure {
//       echo 'Pipeline failed!'
//     }
//   }
// }

 pipeline {
   agent any
+  environment {
+    DOCKER_HOST = 'unix:///var/run/docker.sock'
+    // Optional: 설정 위치를 워크스페이스로 돌려서 권한문제 방지
+    DOCKER_CONFIG = "${WORKSPACE}/.docker"
+  }
 
   stages {
     stage('Checkout SCM') {
       steps { checkout scm }
     }
 
-    stage('Build with DIND') {
-      agent {
-        docker {
-          image 'docker:24.0.5-dind'
-          args '--privileged -e DOCKER_TLS_CERTDIR="" -v jenkins-docker-certs:/certs/client \
-                -v ${env.WORKSPACE}/.docker:/root/.docker -e DOCKER_CONFIG=/root/.docker'
-        }
-      }
-      steps {
-        sh 'mkdir -p ${WORKSPACE}/.docker'
-        sh 'docker info'
-        sh 'docker build -t my-app:${GIT_COMMIT} .'
-        sh 'docker-compose up --build -d'
-      }
-    }
+    stage('Build & Deploy') {
+      steps {
+        // 워크스페이스에 .docker 디렉터리 미리 생성
+        sh 'mkdir -p ${WORKSPACE}/.docker'
+
+        // 호스트 Docker 데몬에 붙어서 빌드
+        sh 'docker info'
+        sh 'docker build -t my-app:${GIT_COMMIT} .'
+        sh 'docker-compose up --build -d'
+      }
+    }
 
     stage('Docker Compose Down') {
       steps {
         dir("${env.WORKSPACE}") {
           sh 'docker-compose down --volumes --remove-orphans'
         }
       }
     }
 
     stage('Docker Compose Build and Up') {
       steps {
         dir("${env.WORKSPACE}") {
           sh 'docker-compose build'
           sh 'docker-compose up -d'
         }
       }
     }
   }
 
   post {
     always { echo 'Pipeline finished.' }
     failure { echo 'Pipeline failed!' }
   }
 }
