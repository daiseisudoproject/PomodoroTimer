# ステージ1：フロントエンドのビルド
FROM node:16-alpine AS frontend-build

# ビルド時の引数を定義
ARG REACT_APP_API_URL

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY frontend/package*.json ./

# 依存関係をインストール
RUN npm install

# フロントエンドのソースコードをコピー
COPY frontend/ ./

# 環境変数を設定
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Reactアプリケーションをビルド
RUN npm run build

# ステージ2：バックエンドのビルド
FROM maven:3.8.3-openjdk-17 AS backend-build

# 作業ディレクトリを設定
WORKDIR /app

# バックエンドのソースコードをコピー
COPY pom.xml ./
COPY src ./src

# フロントエンドのビルド成果物をバックエンドにコピー
COPY --from=frontend-build /app/build ./src/main/resources/static

# Mavenでバックエンドをビルド
RUN mvn clean package

# ステージ3：実行環境の設定
FROM openjdk:17-jdk-alpine

# 作業ディレクトリを設定
WORKDIR /app

# ビルドされたJARファイルをコピー
COPY --from=backend-build /app/target/*.jar app.jar

# アプリケーションを起動
CMD ["java", "-jar", "app.jar", "--server.port=${PORT}", "--server.address=0.0.0.0"]