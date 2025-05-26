FROM openjdk:21-jdk-slim

WORKDIR /app
COPY damdam/ ./damdam/
WORKDIR /app/damdam

RUN chmod +x ./gradlew  && \
    ./gradlew build -x test --stacktrace --info  && \
    cp build/libs/*SNAPSHOT.jar app.jar

EXPOSE 8080

# debug 모드로 실행하도록 --debug 옵션 추가
CMD ["java", "-jar", "app.jar", "--debug"]
