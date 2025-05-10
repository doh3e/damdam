FROM jenkins/jenkins:lts

USER root

# docker 명령어 설치 (컨테이너 안에서도 docker build 할 거니까)
RUN apt-get update && apt-get install -y docker.io

# 호스트와 같은 docker 그룹 ID로 맞추기
RUN groupadd -g 998 docker || true
RUN usermod -aG docker jenkins

USER jenkins

