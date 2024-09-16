FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY . .
RUN ./mvnw clean package
CMD ["java", "-jar", "target/your-app-name-0.0.1-SNAPSHOT.jar"]
