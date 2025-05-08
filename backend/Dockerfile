FROM openjdk:21-jdk-slim

WORKDIR /app
COPY damdam/ ./damdam/
WORKDIR /app/damdam

RUN chmod +x ./gradlew \
 && ./gradlew build -x test \
 # fat-JAR을 app.jar로 복사
 && cp build/libs/*SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
