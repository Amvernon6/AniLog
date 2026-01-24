# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY src/frontend/package*.json ./
RUN npm install
COPY src/frontend ./
RUN npm run build

# Build backend
FROM gradle:8-jdk17 AS backend-build
WORKDIR /app
COPY . .
# Skip buildFrontend task since frontend is built separately
RUN gradle build -x test -x buildFrontend

# Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/build/libs/*.jar app.jar
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
