# NestJS NEXT-STOP API

A modular NestJS REST API designed for a social/location-based application.

This backend supports:

- Firebase email/password authentication
- MongoDB persistence via Mongoose
- Role-based authorization (RBAC)
- Places & outings (posts/check-ins)
- User profiles
- Strategy + Factory authentication architecture

---

## Architecture Overview

The project follows clean modular NestJS patterns with:

- Controllers – HTTP endpoints
- Services – Business logic
- DTOs – Validation & transport objects
- Schemas – Mongoose models
- Guards / Decorators – Authentication & authorization
- Strategies + Factory – Provider-based authentication

### Core Design Patterns

### Strategy + Factory (Authentication)

Authentication providers are abstracted via:

- IAuthStrategy
- EmailStrategy
- AuthStrategyFactory
- AuthService

This allows adding new auth providers (Google, Apple, etc.) without touching core logic.

### RBAC (Role-Based Access Control)

Implemented using:

- RoleGuard
- @Roles() decorator
- MongoDB role validation

---

## Authentication

Powered by Firebase Admin SDK.

### Register

POST /auth/register

Request body:

    {
      "provider": "password",
      "registerUserDTO": {
        "email": "test@test.com",
        "password": "123456",
        "displayName": "John"
      }
    }

Creates:

- Firebase user
- MongoDB user document

Returns sanitized user response.

---

### Validate (Login)

POST /auth/validate

Request body:

    {
      "provider": "password",
      "validateUserDTO": {
        "token": "<firebase-id-token>"
      }
    }

Validates Firebase token and returns a validated user.

---

##  Places Module

Manage locations.

### Create Place
POST /places  
Body: CreatePlaceDTO

### Get All Places
GET /places  
Optional filters via query.

### Get Place Details
GET /places/details?id=xxx  
or  
GET /places/details?googlePlaceId=xxx

### Update Place
PUT /places?id=xxx  
Body: UpdatePlaceDTO

### Delete Place
DELETE /places?id=xxx

---

##  Outings Module

Outings represent posts/check-ins tied to places.

### Create Outing
POST /outings  
Body: CreateOutingDTO

### Feed
GET /outings  
Optional filters.

### Get Outing Details
GET /outings/details?id=xxx

### User History
GET /outings/user/:userId

### Like / Unlike Outing
POST /outings/like  
Body: LikeOutingDTO

### Delete Outing
DELETE /outings/:id

### Get Outings by Place
GET /outings/place/:placeId

---

## 👤 Profile Module

Profiles are retrieved/updated by Firebase UID or username.

### Get Profile

GET /profile?firebaseUid=xxx  
or  
GET /profile?username=xxx


### Update Profile

PUT /profile

Query:

- firebaseUid OR username

Body:

- preferences
- privacy

---

## Authorization (RBAC)

Routes can be protected using:

@Roles('admin')

Validated via:

- RoleGuard
- MongoDB user roles

---

## Firebase

Firebase Admin initialized via:

src/common/firebase/firebase.admin.ts

Credentials provided through environment variables or service account.

Used for:

- User creation
- Token validation

---

## MongoDB

Mongoose connection configured in:

src/common/mongoose.ts

Schemas:

- User
- Profile
- Place
- Outing

---

## Validation

Uses:

- DTOs
- Custom global validation pipe
- Global exception filter

Located in:

src/common/validation.pipe.ts  
src/common/errors/

---

## Environment Variables

Required:

MONGO_URI=your_mongodb_connection  
FIREBASE_PROJECT_ID=xxx  
FIREBASE_CLIENT_EMAIL=xxx  
FIREBASE_PRIVATE_KEY=xxx

---

## Running the backend

npm install  
npm run start:dev

---

## Tech Stack

- NestJS
- MongoDB + Mongoose
- Firebase Admin SDK
- class-validator
- class-transformer

---

