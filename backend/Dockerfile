FROM openjdk:21-jdk-slim

WORKDIR /app

COPY damdam/ ./damdam/

WORKDIR /app/damdam

RUN chmod +x ./gradlew
RUN ./gradlew build -x test    # ⭐ test 빼고 build만

EXPOSE 8082

CMD ["java", "-jar", "build/libs/*.jar"]

