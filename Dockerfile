# ステージ1：フロントエンドのビルド
FROM node:16-alpine AS frontend-build
WORKDIR /app
COPY frontend/ ./
RUN npm install
RUN npm run build

# MavenとOpenJDK 17がインストールされた公式イメージを使う
FROM maven:3.8.3-openjdk-17 AS build

# 作業ディレクトリを設定
WORKDIR /app

# プロジェクトファイルをコンテナにコピー
COPY . .

# フロントエンドのビルド成果物をバックエンドにコピー
COPY --from=frontend-build /app/build ./src/main/resources/static

# Mavenでアプリケーションをビルド
RUN mvn clean package

# JDKを使った実行用のイメージ
FROM openjdk:17-jdk-alpine

# 作業ディレクトリを設定
WORKDIR /app

# ビルドステージからビルドされたJARファイルをコピー
COPY --from=build /app/target/pomodoroapp-0.0.1-SNAPSHOT.jar /app/pomodoroapp.jar

# 環境変数PORTの値を出力
RUN echo "PORT is ${PORT}"

# アプリを実行
CMD ["java", "-jar", "pomodoroapp.jar", "--server.port=${PORT}", "--server.address=0.0.0.0"]