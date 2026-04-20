# Task Manager — Full Stack Application

A full-stack task management application built with **Spring Boot** on the backend and **React + TypeScript** on the frontend. Create, update, delete, and track tasks through a clean, responsive UI backed by a RESTful API.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Features](#features)
- [Configuration](#configuration)
- [Testing](#testing)

---

## Overview

Task Manager is a full-stack CRUD application demonstrating a modern separation of concerns between a **Spring Boot REST API** and a **React SPA**. Tasks have a title, description, status, and optional due date. The frontend communicates with the backend through a Vite dev-server proxy, so no CORS configuration is needed during development.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.2.0 | Application framework |
| Spring Data JPA | — | Data persistence layer |
| Spring Validation | — | Bean validation (`@Valid`) |
| H2 Database | — | In-memory relational DB |
| Maven | 3.x | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI library |
| TypeScript | 5.2 | Type-safe JavaScript |
| Vite | 5.0 | Build tool & dev server |
| Tailwind CSS | 3.3 | Utility-first CSS framework |
| Axios | 1.6 | HTTP client |
| react-hot-toast | 2.4 | Toast notifications |

---

## Project Structure

```
SDLC-Fundamental/
├── backend/                        # Spring Boot REST API
│   ├── pom.xml
│   └── src/main/java/com/taskmanager/
│       ├── TaskManagerApplication.java
│       ├── config/
│       │   ├── CorsConfig.java
│       │   └── H2ServerConfig.java
│       ├── controller/
│       │   └── TaskController.java     # REST endpoints
│       ├── dto/
│       │   └── TaskRequest.java        # Request payload DTO
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   └── TaskNotFoundException.java
│       ├── model/
│       │   ├── Task.java               # JPA entity
│       │   └── TaskStatus.java         # Enum: TODO | IN_PROGRESS | DONE
│       ├── repository/
│       │   └── TaskRepository.java     # Spring Data repository
│       └── service/
│           └── TaskService.java        # Business logic
│
└── frontend/                       # React + TypeScript SPA
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx                     # Root component & state management
        ├── components/
        │   ├── TaskList.tsx
        │   ├── TaskItem.tsx
        │   ├── TaskForm.tsx
        │   ├── SearchBar.tsx
        │   └── TaskFilter.tsx
        ├── services/
        │   └── taskService.ts          # Axios API calls
        └── types/
            └── Task.ts                 # TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm 9+** (bundled with Node.js)

Verify your environment:

```bash
java -version
mvn -version
node -v
npm -v
```

---

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies and compile
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.  
The H2 Console will be available at `http://localhost:8080/h2-console`.

---

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Proxy**: All `/api/*` requests from the frontend are automatically proxied to `http://localhost:8080` by the Vite dev server, so the backend must be running first.

---

## Running the Application

Start both servers in separate terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173**.

### Production Build (Frontend)

```bash
cd frontend
npm run build        # Outputs to frontend/dist/
npm run preview      # Preview the production build locally
```

---

## API Reference

Base URL: `http://localhost:8080/api/tasks`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/tasks` | Get all tasks | — | `200 OK` — `Task[]` |
| `GET` | `/api/tasks/{id}` | Get task by ID | — | `200 OK` — `Task` |
| `POST` | `/api/tasks` | Create a new task | `TaskRequest` | `201 Created` — `Task` |
| `PUT` | `/api/tasks/{id}` | Update an existing task | `TaskRequest` | `200 OK` — `Task` |
| `DELETE` | `/api/tasks/{id}` | Delete a task | — | `204 No Content` |

### Request Body — `TaskRequest`

```json
{
  "title": "Write unit tests",
  "description": "Cover service and controller layers",
  "status": "TODO",
  "dueDate": "2026-05-01"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Max 100 characters |
| `description` | `string` | No | Max 500 characters |
| `status` | `string` | No | `TODO` \| `IN_PROGRESS` \| `DONE` (defaults to `TODO`) |
| `dueDate` | `string` | No | ISO-8601 date format (`YYYY-MM-DD`) |

### Example Responses

**`GET /api/tasks`**
```json
[
  {
    "id": 1,
    "title": "Write unit tests",
    "description": "Cover service and controller layers",
    "status": "IN_PROGRESS",
    "dueDate": "2026-05-01"
  }
]
```

**Validation Error — `400 Bad Request`**
```json
{
  "title": "Title is required"
}
```

**Not Found — `404 Not Found`**
```json
{
  "message": "Task not found with id: 99"
}
```

---

## Data Model

### `Task` Entity

```
┌─────────────────────────────────────────────────┐
│                     tasks                        │
├──────────────┬──────────────────┬────────────────┤
│ Column       │ Type             │ Constraints    │
├──────────────┼──────────────────┼────────────────┤
│ id           │ BIGINT           │ PK, Auto Inc.  │
│ title        │ VARCHAR(100)     │ NOT NULL       │
│ description  │ VARCHAR(500)     │ NULLABLE       │
│ status       │ VARCHAR(20)      │ NOT NULL       │
│ due_date     │ DATE             │ NULLABLE       │
└──────────────┴──────────────────┴────────────────┘
```

### `TaskStatus` Enum

| Value | Meaning |
|-------|---------|
| `TODO` | Task has not been started |
| `IN_PROGRESS` | Task is currently being worked on |
| `DONE` | Task is completed |

---

## Features

- **Dashboard stats** — Real-time counts for Total, To Do, In Progress, and Done tasks
- **Create & Edit tasks** — Modal form with validation feedback
- **Delete tasks** — Instant removal with confirmation toast
- **Inline status updates** — Change task status directly from the task card
- **Search** — Filter tasks by title or description in real time
- **Status filter** — View All, To Do, In Progress, or Done tasks
- **Sorting** — Sort by status workflow order or by due date (ascending)
- **Toast notifications** — Non-blocking success and error feedback via `react-hot-toast`
- **Responsive design** — Mobile-friendly layout powered by Tailwind CSS

---

## Configuration

### Backend — `application.properties`

```properties
server.port=8080

# H2 in-memory database
spring.datasource.url=jdbc:h2:mem:taskdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.username=sa
spring.datasource.password=

# H2 web console (development only)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# H2 TCP server (exposes DB externally on port 9092)
h2.tcp.server.port=9092

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

> **Note:** The H2 database is in-memory and resets on every application restart. For persistent storage, replace the datasource with a production database (e.g., PostgreSQL).

### Frontend — `vite.config.ts`

```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
mvn test

# Run tests with detailed output
mvn test -Dsurefire.useFile=false
```

Test reports are generated in `backend/target/surefire-reports/`.

Test coverage includes:
- `TaskServiceTest` — Unit tests for business logic
- `TaskControllerTest` — Integration tests for REST endpoints
- `TaskManagerApplicationTests` — Spring context load test

### Frontend Linting

```bash
cd frontend

# Run ESLint
npm run lint
```
