# Vehicle Maintenance Tracker - Backend

Personal Vehicle Maintenance Tracker REST API built with Spring Boot and PostgreSQL.
Users can register/login, manage their vehicles, and record service history with receipt uploads.

## Tech Stack

- Java 21, Spring Boot 3.5
- Spring Web, Spring Data JPA, Spring Security (JWT)
- PostgreSQL + Flyway migrations
- Lombok, Bean Validation

## Prerequisites

- JDK 21+
- PostgreSQL 14+
- Maven (or use the included `mvnw` wrapper)

## Setup

1. Create the database:

   ```sql
   CREATE DATABASE vehicle_maintenance;
   ```

2. Create a `.env` file in the project root (already gitignored):

   ```env
   DB_URL=jdbc:postgresql://localhost:5432/vehicle_maintenance
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=replace-with-a-long-random-secret-at-least-256-bits
   JWT_EXPIRATION_MS=86400000
   SERVER_PORT=8080
   ```

   The app auto-loads `.env` via `spring-dotenv`, so running from an IDE works without
   extra configuration.

3. Run:

   ```bash
   ./mvnw spring-boot:run
   ```

   Flyway applies the schema migration automatically on startup.

## Configuration

All settings live in `src/main/resources/application.properties` and read from env vars
with sensible defaults:

| Variable            | Default                                              | Description               |
|---------------------|------------------------------------------------------|---------------------------|
| `DB_URL`            | `jdbc:postgresql://localhost:5432/vehicle_maintenance` | JDBC URL                 |
| `DB_USERNAME`       | `postgres`                                            | DB username               |
| `DB_PASSWORD`       | `postgres`                                            | DB password               |
| `JWT_SECRET`        | (dev placeholder)                                    | HMAC signing key          |
| `JWT_EXPIRATION_MS` | `86400000`                                            | Token TTL (24h)           |
| `UPLOAD_DIR`        | `uploads`                                             | Local receipt storage dir |
| `MAX_FILE_SIZE`     | `5MB`                                                 | Max upload size           |
| `SERVER_PORT`       | `8080`                                                | HTTP port                 |

## Architecture

Package-by-feature with a thin-controller / service / repository layering:

```
common/     -> shared: ApiResponse, PageResponse, exceptions, BaseEntity, logging
config/     -> SecurityConfig, WebMvcConfig
security/   -> JWT service, filter, UserDetails, current-user provider
file/       -> FileStorageService abstraction + local implementation
auth/       -> register/login
user/       -> User entity + repository
vehicle/    -> Vehicle CRUD
service/    -> ServiceRecord CRUD + search
```

Key conventions:

- DTOs never expose entities directly.
- All responses wrapped in `ApiResponse<T>`; paginated ones use `PageResponse<T>`.
- Errors handled centrally in `GlobalExceptionHandler`.
- Ownership is always enforced from the JWT subject, never from the request body.

## API

Base URL: `http://localhost:8080`. All endpoints except `/api/auth/**` and `/files/**`
require an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint             | Body                            |
|--------|----------------------|---------------------------------|
| POST   | `/api/auth/register` | `{ username, email, password }` |
| POST   | `/api/auth/login`    | `{ email, password }`           |

Both return a JWT token in `data.token`.

### Vehicles

| Method | Endpoint             | Body                            |
|--------|----------------------|---------------------------------|
| GET    | `/api/vehicles`      | -                               |
| GET    | `/api/vehicles/{id}` | -                               |
| POST   | `/api/vehicles`      | `{ vehicleName, licensePlate }` |
| PUT    | `/api/vehicles/{id}` | `{ vehicleName, licensePlate }` |
| DELETE | `/api/vehicles/{id}` | -                               |

### Service Records

| Method | Endpoint                | Notes                                          |
|--------|-------------------------|------------------------------------------------|
| GET    | `/api/services`         | Query params: `vehicleId`, `search`, `page`, `size`, `sort` |
| GET    | `/api/services/{id}`    | -                                              |
| POST   | `/api/services`         | `multipart/form-data`: `data` (JSON) + optional `receiptFile` |
| PUT    | `/api/services/{id}`    | `multipart/form-data`: `data` (JSON) + optional `receiptFile` |
| DELETE | `/api/services/{id}`    | -                                              |

`data` JSON shape:

```json
{
  "vehicleId": "uuid",
  "serviceDate": "2026-01-15",
  "odometer": 30000,
  "partsReplaced": "Fanbelt, Roller",
  "totalCost": 350000,
  "notes": "optional"
}
```

Search example (filter by vehicle, keyword, newest first is the default sort):

```
GET /api/services?vehicleId=<id>&search=fanbelt&sort=serviceDate,desc
```

Uploaded receipts are served at `/files/{filename}`.

## Testing

```bash
./mvnw test
```

> Note: the `contextLoads` integration test requires a running PostgreSQL instance.
