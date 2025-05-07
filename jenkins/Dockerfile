# jenkins/Dockerfile

FROM jenkins/jenkins:lts

USER root

# docker 설치
RUN apt-get update && apt-get install -y docker.io

# docker-compose 설치 (2.x 최신 버전 사용 추천)
RUN curl -L "https://github.com/docker/compose/releases/download/v2.24.7/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose

# docker 그룹 추가 및 권한 부여
RUN groupadd -f docker && usermod -aG docker jenkins

USER jenkins

