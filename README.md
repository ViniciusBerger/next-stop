# Next Stop API

Next Stop is a modular NestJS backend API built for a social, location-based application.

The platform allows users to:
- Authenticate via Firebase
- Manage profiles
- Create and attend events
- Interact with places
- Write reviews
- Report content
- Manage friendships

The system follows a feature-based modular architecture using NestJS, MongoDB (Mongoose), and Firebase authentication.

---

# Architecture Overview

The application is structured using domain-based modules:

```
apps/
  frontend/
  backend/
        src/
          auth/
          user/
          profile/
          events/
          places/
          reviews/
          reports/
          badges/
          common/
          main.ts
```

Each module typically contains:

- Controller — defines HTTP endpoints
- Service — business logic
- DTOs — request/response validation
- Schema — Mongoose models
- Module — NestJS module definition

---

# Authentication Module

Directory: `auth/`

## Responsibilities

- User registration
- Token validation
- Firebase integration
- Authentication strategy abstraction

## Important Design Note

User creation is handled by the Auth module, not by the UserController.

The flow is:

1. Client authenticates with Firebase.
2. Firebase token is validated by `firebase.auth.guard.ts`.
3. `AuthController` calls `UserService.createUser()` if the user does not exist.
4. The user record is created internally.

This keeps registration strictly inside the authentication domain.

## Key Files

- `auth.controller.ts`
- `auth.service.ts`
- `register.user.DTO.ts`
- `validate.user.DTO.ts`
- `auth-strategy.interface.ts`
- `auth-strategy.ts`

---

# User Module

Directory: `user/`

## Responsibilities

- Retrieve user data
- Update user data
- Delete user
- Manage friendships
- Role management

## Important Clarification

The UserController does NOT expose a public createUser endpoint.

User creation is internal and triggered only through the Auth module.

## DTOs

- `create.user.DTO.ts`
- `update.user.DTO.ts`
- `delete.user.DTO.ts`
- `get.user.DTO.ts`
- `friend.request.ts`
- `user.response.DTO.ts`

## Role System

- `user.role.enum.ts`
- `roles.decorator.ts`
- `role.guard.ts`

Used to enforce role-based authorization across the system.

---

# Profile Module

Directory: `profile/`

Handles extended user profile information.

Includes:

- Preferences sub-schema
- Privacy sub-schema
- Profile retrieval and update endpoints

DTOs:
- `get.profile.DTO.ts`
- `update.profile.DTO.ts`
- `profile.response.DTO.ts`

---

# Events Module

Directory: `events/`

Handles event lifecycle management.

Responsibilities:
- Create event
- Update event
- Fetch event
- Invite users
- Attend event

DTOs:
- `create.event.DTO.ts`
- `update.event.DTO.ts`
- `get.event.DTO.ts`
- `attend.event.DTO.ts`
- `invite.event.DTO.ts`
- `event.response.DTO.ts`

Schema:
- `event.schema.ts`

---

# Places Module

Directory: `places/`

Handles location/place data.

DTOs:
- `create.place.DTO.ts`
- `update.place.DTO.ts`
- `get.place.DTO.ts`
- `place.response.DTO.ts`

Schema:
- `place.schema.ts`

---

# Reviews Module

Directory: `reviews/`

Users can:

- Create reviews
- Retrieve reviews
- Like reviews

DTOs:
- `create.review.DTO.ts`
- `get.review.DTO.ts`
- `like.review.DTO.ts`
- `review.response.DTO.ts`

Schema:
- `review.schema.ts`

---

# Reports Module

Directory: `reports/`

Handles content reporting.

DTOs:
- `create.report.DTO.ts`
- `get.report.DTO.ts`
- `report.response.DTO.ts`

Schema:
- `report.schema.ts`

---

# Badges Module

Directory: `badges/`

Defines achievement badges stored in MongoDB.

- `badges.schema.ts`

---

# Common Module

Shared infrastructure components.

## MongoDB

- `mongoose.ts` — database connection

## Firebase

- `firebase.admin.ts`
- `firebase.auth.guard.ts`

## Authorization

- `roles.decorator.ts`
- `role.guard.ts`

## Validation

- `validation.pipe.ts`

## Error Handling

- `exception.Factory.ts`
- `global.error.filter.ts`

---

# Request Lifecycle

1. HTTP request reaches controller.
2. DTO validation runs globally.
3. Firebase authentication guard validates token.
4. Role guard checks authorization if required.
5. Service layer executes business logic.
6. Repository interacts with MongoDB.
7. Response DTO formats output.

---

# Running the Project

Install dependencies:

```
npm install
```

Configure environment variables:

- MongoDB URI
- Firebase Admin credentials

Start development server:

```
npm run start:dev
```

---

# Testing

Unit tests are included in `*.spec.ts` files.

Run tests:

```
npm run test
```

---

# Design Principles

- Modular domain architecture
- Authentication-driven user creation
- DTO-based validation
- Repository abstraction
- Role-based authorization
- Centralized error handling

---

# Summary

Next Stop API is a scalable NestJS backend designed for a social event platform.

User creation is intentionally handled through the Auth module, keeping authentication and identity management centralized.

The system is structured for maintainability, scalability, and clear separation of concerns.
