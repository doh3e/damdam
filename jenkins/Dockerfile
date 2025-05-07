FROM jenkins/jenkins:lts

USER root

# docker 설치
RUN apt-get update && apt-get install -y docker.io

# docker-compose 설치
RUN curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose

# docker 그룹 추가 (GID 999)
RUN groupadd -g 999 docker || true
RUN usermod -aG docker jenkins

# docker.sock 퍼미션 수정 (권한 에러 방지)
RUN chmod 666 /var/run/docker.sock || true

USER jenkins

