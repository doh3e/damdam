# 포팅 매뉴얼 – k12s202.p.ssafy.io 인프라 작업

## 1. 개요

* **서버 주소**: `k12s202.p.ssafy.io`
* **접속 계정**: `ubuntu@ip-172-26-7-11`
* **주요 작업 목적**: Jenkins 기반 CI/CD 환경 구축 및 Spring Boot + PostgreSQL + Redis + Nginx 기반 백엔드 서비스 운영
* **사용 기술**: Jenkins, Docker, Nginx, Spring Boot, PostgreSQL, Redis, GitLab, EC2 (Ubuntu)

---

## 2. 디렉토리 구조

```bash
~/
├── S12P31S202/             # 프로젝트 루트
│   ├── backend/            # Spring Boot 백엔드
│   ├── frontend/           # Next.js 프론트엔드
│   └── docker-compose.yml # 통합 서비스 설정
├── jenkins_home/          # Jenkins 데이터 볼륨
├── jenkins-data/          # Jenkins 저장소 마운트
└── secure/                # 인증서 및 보안 관련 파일
```

---

## 3. Jenkins 설정

* **Docker로 설치**:

```bash
docker run -d \
  --name my-jenkins \
  -p 9090:8080 -p 50000:50000 \
  -v jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

* **초기 패스워드 확인**:

```bash
cat /var/jenkins_home/secrets/initialAdminPassword
```

* **Multi-branch Pipeline 설정**:

  * GitLab Repository 연결 (WebHook)
  * 브랜치별 Jenkinsfile 감지

---

## 4. Nginx 설정

* **경로**: `/etc/nginx/sites-available/default`
* **도메인 리다이렉트 및 SSL 설정**:

```nginx
server {
    listen 80;
    server_name k12s202.p.ssafy.io www.damdam.kr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name k12s202.p.ssafy.io www.damdam.kr;

    ssl_certificate /etc/letsencrypt/live/k12s202.p.ssafy.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/k12s202.p.ssafy.io/privkey.pem;

    location / {
        proxy_pass http://localhost:8080; # SpringBoot
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
## 5. 기본 인프라 구축
EC2 Ubuntu 인스턴스 접속 (k12s202.p.ssafy.io)

시스템 패키지 업데이트 및 필수 도구 설치:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx -y
```
## 6. Jenkins 기반 CI/CD 구성
Jenkins를 Docker 컨테이너로 실행:

```bash
docker run -d \
  --name my-jenkins \
  -p 9090:8080 -p 50000:50000 \
  -v jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```
  
GitLab과 연동 (Personal Access Token 발급 → Jenkins Credential 등록)

Multi-branch pipeline 설정 → 브랜치별 Jenkinsfile 감지 및 자동 빌드

## 7. Docker Compose 기반 애플리케이션 실행
구성 서비스:
PostgreSQL (port: 5432)

Redis (port: 6379)

Spring Boot backend (port: 8080)

Next.js frontend (port: 3000)

AI mock server (ai-data, ai-audio: 8001, 8002)

특징:
모든 서비스는 하나의 app-network 브리지 네트워크에 속함

Spring Boot는 .properties 파일 외부 마운트 + ENV로 세부 설정

frontend는 ARG 및 ENV로 OpenAPI 키 및 도메인 정보 주입

```bash
docker-compose up -d --build
```
## 8. Nginx + HTTPS + 도메인 연결
도메인: k12s202.p.ssafy.io, www.damdam.kr

HTTP → HTTPS 리다이렉션

Certbot을 이용한 무료 SSL 인증서 설치:

```bash
sudo certbot --nginx -d k12s202.p.ssafy.io -d www.damdam.kr
```
Nginx에서 프론트 요청 / → frontend (3000), 백엔드 API 요청 /api/ → backend (8080)으로 프록시 설정

## 9. 운영 관련 유틸
용량 확인: df -h

로그 확인:

```bash
sudo tail -n 100 /var/log/nginx/access.log
journalctl -u nginx.service
```

Docker 정리:

```bash
docker system prune -af --volumes
```
---

## 10. Spring Boot 백엔드 배포

* **실행 명령어**:

```bash
java -jar <프로젝트 명>.jar --server.port=8080
```

* **application.yml 주요 설정**:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/damdam
    username: postgres
    password: yourpassword
```

---

## 11. PostgreSQL 설치 및 설정

```bash
sudo apt install postgresql
sudo -u postgres psql
# 생성
CREATE DATABASE damdam;
CREATE USER postgres WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE damdam TO postgres;
```

---

## 12. Redis 설치

```bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## 13. Docker 시스템 정리 및 로그 확인

```bash
docker system prune -af --volumes
journalctl -u nginx.service
sudo tail -n 100 /var/log/nginx/access.log
```

---
## 14. Jenkinsfile 파이프라인 구축
```
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
      echo 'All services have been successfully deployed.'
    }
    failure {
      echo 'Deployment failed. Please check the logs.'
    }
  }
}

```

## 15. EC2 용량 확인

```bash
df -h
```

---

## 16. 참고 사항

* Jenkins 설정 데이터는 `jenkins_home` 또는 `jenkins-data` 경로에 있음
* Docker 관련 충돌 시 `docker ps`, `docker rm`, `docker image prune`으로 정리
* 도메인 HTTPS 인증은 Certbot 이용

---

