# MavenとOpenJDK 17がインストールされた公式イメージを使う
FROM maven:3.8.7-openjdk-17 AS build

# 作業ディレクトリを設定
WORKDIR /app

# プロジェクトファイルをコンテナにコピー
COPY . .

# Mavenでアプリケーションをビルド
RUN mvn clean package

# JDKを使った実行用のイメージ
FROM openjdk:17-jdk-alpine

# 作業ディレクトリを設定
WORKDIR /app

# ビルドステージからビルドされたJARファイルをコピー
COPY --from=build /app/target/pomodoroapp-0.0.1-SNAPSHOT.jar /app/pomodoroapp.jar

# アプリを実行
CMD ["java", "-jar", "pomodoroapp.jar", "--server.port=${PORT}"]
