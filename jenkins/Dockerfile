FROM jenkins/jenkins:lts

USER root

# docker & docker-compose 설치
RUN apt-get update && apt-get install -y docker.io \
 && curl -L "https://github.com/docker/compose/releases/download/v2.24.7/docker-compose-$(uname -s)-$(uname -m)" \
      -o /usr/local/bin/docker-compose \
 && chmod +x /usr/local/bin/docker-compose

# docker 그룹(호스트와 GID 맞추면 더 안전) 추가 후 jenkins 사용자에 추가
RUN groupadd -f docker \
 && usermod -aG docker jenkins

# DOCKER_CONFIG를 Jenkins 홈의 .docker로 설정하고, 그 폴더를 미리 생성·소유권 부여
ENV DOCKER_CONFIG=${JENKINS_HOME}/.docker
RUN mkdir -p ${DOCKER_CONFIG} \
 && chown -R jenkins:docker ${JENKINS_HOME}

USER jenkins
