# MavenとOpenJDK 17がインストールされた公式イメージを使う
FROM maven:3.8.3-openjdk-17 AS build

WORKDIR /app
COPY pom.xml .
COPY src src

# Copy Maven wrapper
COPY mvnw .
COPY .mvn .mvn

# Set execution permission for the Maven wrapper
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# JDKを使った実行用のイメージ
FROM openjdk:17-jdk-alpine

VOLUME /tmp

# ビルドステージからビルドされたJARファイルをコピー
COPY --from=build /app/target/pomodoroapp-0.0.1-SNAPSHOT.jar /app/pomodoroapp.jar

# アプリを実行
ENTRYPOINT ["java", "-jar", "/app/pomodoroapp.jar"]

EXPOSE 8080