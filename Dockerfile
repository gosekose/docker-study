# First stage: build the application
FROM openjdk:17-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Install necessary dependencies
RUN apt-get update && apt-get install -y bash curl && \
    apt-get install -y util-linux

# Copy the project files to the working directory
COPY . .

# Build the application using Gradle
RUN ./gradlew clean build

# Second stage: create the final image
FROM openjdk:17-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the built jar file from the builder stage
COPY --from=builder /app/build/libs/*.jar ./app.jar

# Expose the port the application will run on
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
