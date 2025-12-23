# NestJS MongoDB Application

This project is a NestJS application using Mongoose for MongoDB.

## Setup Instructions

1.  **Prerequisites**:
    *   Node.js (v18+ recommended)
    *   npm
    *   MongoDB running locally or a connection string to a remote instance.

2.  **Installation**:
    ```bash
    cd src
    npm install
    ```

3.  **Environment Configuration**:
    *   Ensure your MongoDB instance is running.
    *   By default, the application connects to `mongodb://localhost:27017/nest`. If you need to change this, check `app.module.ts` or configure via environment variables (if implemented).

## How to Run the Project

*   **Development**:
    ```bash
    npm run start:dev
    ```

*   **Production**:
    ```bash
    npm run build
    npm run start:prod
    ```

*   **Tests**:
    ```bash
    npm run test
    ```

## Assumptions

1.  **Environment**: It is assumed that a MongoDB instance is available at `mongodb://localhost:27017/nest` (default configuration) or that the connection string is correctly configured in the application module.
2.  **Data Consistency**: We assume that `eventId` is unique per session as per the prompt requirements, though in a distributed system we might prefer globally unique UUIDs.
3.  **Concurrency**: We assume that optimistic concurrency control (handling unique constraints) is sufficient for this use case, and that high contention on creating the *exact same* event at the *exact same time* is an edge case properly handled by returning the existing record.
4.  **Security**: Authentication and authorization are not implemented as they were out of scope for this assignment. The API is open.
