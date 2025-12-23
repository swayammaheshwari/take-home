# System Design & Implementation Details

## 1. How did you ensure idempotency?
Idempotency is ensured at both the session and event levels using a "check-then-act" pattern backed by database constraints:
- **For Sessions**: The `createOrUpsertSession` method first checks if a session with the given `sessionId` already exists. If it does, it returns the existing session.
- **For Events**: The `addEvent` method checks for an existing event using the compound key (`sessionId` + `eventId`).
- **Safety Net**: Both operations catch MongoDB `duplicate key errors` (code 11000). If a race condition occurs (e.g., two requests try to create the same resource simultaneously), the application catches the error and gracefully returns the existing resource instead of failing. This guarantees that multiple identical requests result in the same system state.

## 2. How does your design behave under concurrent requests?
The design is robust against race conditions due to the use of unique indexes in MongoDB:
- **Atomic Guarantees**: MongoDB's unique indexes (`sessionId` for sessions, `{ sessionId: 1, eventId: 1 }` for events) enforce uniqueness at the database level.
- **Optimistic Handling**: When concurrent requests attempt to create the same resource, one will succeed and the others will fail with a 11000 error. The application logic catches this specific error and fetches/returns the successfully created document. This ensures that concurrent clients always receive a valid response without corrupting data or creating duplicates.

## 3. What MongoDB indexes did you choose and why?
- **`sessionId` (Unique)** on `ConversationSession`:
  - **Purpose**: Fast lookup of sessions by ID and ensures no two sessions have the same ID.
- **`{ sessionId: 1, eventId: 1 }` (Unique)** on `ConversationEvent`:
  - **Purpose**: Enforces idempotency for events within a session. It ensures that a specific event (by ID) cannot be added twice to the same session.
- **`{ sessionId: 1, timestamp: 1 }`** on `ConversationEvent`:
  - **Purpose**: Optimizes the `getSession` query which fetches all events for a session. The `timestamp` component allows for efficient time-ordered sorting, which is critical for reconstructing the conversation flow and supporting pagination.

## 4. How would you scale this system for millions of sessions per day?
- **Database Sharding**: Enable sharding on the `ConversationEvent` collection using `sessionId` as the shard key. This ensures that all events for a single session reside on the same shard, maintaining query locality for `getSession` while distributing the write load across the cluster.
- **Caching**: Implement a Redis cache for active sessions. Since conversation history is read frequently, caching the session state and recent events would significantly reduce database read pressure.
- **Horizontal Scaling**: The NestJS application is stateless. We can deploy multiple instances behind a load balancer (e.g., NGINX or AWS ALB) to handle increased HTTP traffic.
- **Data Archival**: Implement a cold storage strategy (e.g., moving data to S3 or a data warehouse) for completed sessions older than a certain threshold (e.g., 30 days) to keep the active dataset size manageable and performant.

## 5. What did you intentionally keep out of scope, and why?
- **Authentication/Authorization**: Omitted to focus on the core logic of conversation state management given the time constraints. In a production system, this would be critical.
- **Complex Payload Validation**: The event payload is defined as a generic `Record<string, any>`. Strict schema validation for specific event types (e.g., `user_speech` vs. `system`) was skipped to allow flexibility, but in production, we would use DTOs with `class-validator` for strict type checking.
- **WebSockets**: The system uses REST for simplicity. For a real-time conversational AI, WebSockets (via NestJS Gateways) would be preferred to push events to the client immediately rather than requiring client polling.