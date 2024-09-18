# フロントエンド（React）のビルド
FROM node:16-alpine AS frontend-build

# 作業ディレクトリを作成
WORKDIR /app/frontend

# package.jsonとpackage-lock.jsonをコピー
COPY frontend/package*.json ./

# フロントエンドの依存関係をインストール
RUN npm install

# ソースコードをコンテナにコピー
COPY frontend/ ./

# Reactアプリケーションをビルド
RUN npm run build

# MavenとOpenJDK 17がインストールされた公式イメージを使う
FROM maven:3.8.3-openjdk-17 AS build

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

EXPOSE 8080

# アプリを実行
CMD ["java", "-jar", "pomodoroapp.jar", "--server.port=${PORT}", "--server.address=0.0.0.0"]