# Clean Architecture Documentation

## Overview

This project implements **Clean Architecture** principles for a Node.js authentication API. The architecture ensures separation of concerns, testability, and independence from external frameworks and libraries.

## Architecture Layers

The application is organized into distinct layers, each with specific responsibilities and dependencies flowing inward following the **Dependency Rule**.

### **1. Domains Layer** 🔵 _Innermost Circle_

**Location:** `src/Domains/`

The Domains layer contains the core business logic with **zero external dependencies**. This is the most stable layer.

#### Components:

**Entities:**

- `RegisterUser.js` - Domain entity for user registration
  - Validates username, password, and fullname
  - Enforces business rules:
    - Username: alphanumeric + underscore only
    - Username: maximum 50 characters
    - All fields required and must be strings
- `RegisteredUser.js` - Domain entity for registered user response
  - Represents the output after successful registration
  - Contains id, username, and fullname

**Repository Interfaces:**

- `UserRepository.js` - Abstract class defining the repository contract
  - `addUser(registerUser)` - Add new user
  - `verifyAvailableUsername(username)` - Check username availability

#### Key Principles:

- No dependencies on outer layers
- Pure business logic only
- Framework-agnostic
- Highly testable

---

### **2. Applications Layer** 🟢 _Second Circle_

**Location:** `src/Applications/`

The Applications layer contains **application-specific business rules** and orchestrates the flow between entities and external services.

#### Components:

**Use Cases:**

- `AddUserUseCase.js` - Orchestrates user registration workflow
  ```
  Flow:
  1. Create RegisterUser entity (validates input)
  2. Verify username availability via repository
  3. Hash password via PasswordHash service
  4. Save user via repository
  5. Return RegisteredUser entity
  ```

**Security Interfaces:**

- `PasswordHash.js` - Abstract class for password hashing
  - `hash(password)` - Hash a plain text password

#### Dependencies:

- ✅ Depends on: Domains layer (entities, repository interfaces)
- ❌ Does NOT depend on: Infrastructure implementations

---

### **3. Infrastructures Layer** 🟡 _Outer Circles_

**Location:** `src/Infrastructures/`

The Infrastructures layer provides **concrete implementations** of interfaces defined in inner layers and handles external frameworks.

#### Components:

**Repository Implementations:**

- `UserRepositoryPostgres.js` - PostgreSQL implementation
  - Extends `UserRepository` abstract class
  - Uses `pg` connection pool
  - Uses `nanoid` for ID generation
  - Implements username availability check
  - Implements user creation with SQL queries

**Security Implementations:**

- `BcryptPasswordHash.js` - Bcrypt implementation
  - Extends `PasswordHash` abstract class
  - Uses `bcrypt` library
  - Default salt rounds: 10

**HTTP Server:**

- `createServer.js` - Hapi.js server configuration
  - Registers API plugins (users, authentications)
  - Global error handling via `onPreResponse`
  - Translates domain errors to HTTP responses

**Database:**

- `database/postgres/pool.js` - PostgreSQL connection pool

**Dependency Injection:**

- `container.js` - Instances Container setup
  - Registers repositories
  - Registers security services
  - Registers use cases
  - Manages dependencies

#### Key Features:

- Plugin-based architecture for modularity
- Centralized error handling
- Dependency injection for loose coupling

---

### **4. Interfaces Layer** 🔴 _Outermost Circle_

**Location:** `src/Interfaces/http/api/`

The Interfaces layer handles **external communication** via HTTP requests and responses.

#### Components:

**Users API:**

- `handler.js` - `UsersHandler` class

  - `postUserHandler()` - Handles POST /users requests
  - Gets `AddUserUseCase` from container
  - Executes use case with request payload
  - Formats response with 201 status

- `routes.js` - Route definitions

  - Maps HTTP methods to handlers

- `index.js` - Hapi plugin registration

**Authentications API:**

- Similar structure for authentication endpoints
- `handler.js` - Authentication handlers
- `routes.js` - Authentication routes
- `index.js` - Plugin registration

#### Responsibilities:

- HTTP request/response handling
- Payload extraction
- Response formatting
- Delegates business logic to use cases

---

### **5. Commons Layer** (Shared Utilities)

**Location:** `src/Commons/`

The Commons layer provides **shared utilities** used across multiple layers.

#### Components:

**Configuration:**

- `config.js` - Application configuration (host, port, debug settings)

**Exception Handling:**

- `ClientError.js` - Base class for client errors (4xx)
- `InvariantError.js` - 400 Bad Request errors
- `AuthenticationError.js` - 401 Unauthorized errors
- `NotFoundError.js` - 404 Not Found errors
- `DomainErrorTranslator.js` - Translates domain errors to HTTP errors

**Error Translation Mapping:**

```javascript
Domain Error → HTTP Error
─────────────────────────────────────────────────────
REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY
  → InvariantError (400)

REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION
  → InvariantError (400)

REGISTER_USER.USERNAME_LIMIT_CHAR
  → InvariantError (400)

REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER
  → InvariantError (400)
```

---

## Dependency Flow

Following the **Dependency Rule**, dependencies only point inward. Inner layers have no knowledge of outer layers.

```
┌──────────────────────────────────────────────────────────┐
│  4. Interfaces Layer (HTTP Handlers/Routes)              │
│  - UsersHandler                                          │
│  - Calls use cases via DI container                      │
└────────────────────┬─────────────────────────────────────┘
                     │ depends on ↓
┌────────────────────▼─────────────────────────────────────┐
│  3. Infrastructures Layer (Implementations)              │
│  - UserRepositoryPostgres                                │
│  - BcryptPasswordHash                                    │
│  - createServer                                          │
│  - DI Container                                          │
└────────────────────┬─────────────────────────────────────┘
                     │ depends on ↓
┌────────────────────▼─────────────────────────────────────┐
│  2. Applications Layer (Use Cases)                       │
│  - AddUserUseCase                                        │
│  - PasswordHash (interface)                              │
└────────────────────┬─────────────────────────────────────┘
                     │ depends on ↓
┌────────────────────▼─────────────────────────────────────┐
│  1. Domains Layer (Entities + Repository Interfaces)     │
│  - RegisterUser (entity)                                 │
│  - RegisteredUser (entity)                               │
│  - UserRepository (interface)                            │
└──────────────────────────────────────────────────────────┘
         ▲
         │ implements (Dependency Inversion)
         │
┌────────┴─────────────────────────────────────────────────┐
│  Infrastructures Layer provides implementations          │
│  - UserRepositoryPostgres implements UserRepository      │
│  - BcryptPasswordHash implements PasswordHash            │
└──────────────────────────────────────────────────────────┘
```

---

## Design Patterns

### 1. **Dependency Injection**

- Uses `instances-container` library
- All dependencies injected via constructor
- Configured in `container.js`

**Example:**

```javascript
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "userRepository", internal: UserRepository.name },
        { name: "passwordHash", internal: PasswordHash.name },
      ],
    },
  },
]);
```

### 2. **Repository Pattern**

- Abstract `UserRepository` class defines interface
- `UserRepositoryPostgres` provides concrete implementation
- Allows easy switching of data sources

### 3. **Strategy Pattern**

- `PasswordHash` interface allows different hashing strategies
- Currently uses Bcrypt, can easily swap to Argon2, etc.

### 4. **Use Case Pattern**

- Each use case encapsulates a single business flow
- `AddUserUseCase` orchestrates user registration
- Keeps business logic independent of delivery mechanism

### 5. **Error Translation Pattern**

- Domain throws generic errors with semantic names
- `DomainErrorTranslator` converts to HTTP-specific errors
- Maintains domain independence

### 6. **Plugin Architecture**

- Hapi.js plugins for modular API organization
- Each feature (users, authentications) is a separate plugin
- Easy to add/remove features

---

## Request Flow Example: Add User

Let's trace a complete request to understand how layers interact:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HTTP Request                                             │
│    POST /users                                              │
│    Body: { username, password, fullname }                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 2. Interfaces Layer                                         │
│    UsersHandler.postUserHandler(request, h)                 │
│    - Extracts payload from request                          │
│    - Gets AddUserUseCase from DI container                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 3. Applications Layer                                       │
│    AddUserUseCase.execute(useCasePayload)                   │
│    Step 1: new RegisterUser(payload)                        │
│            - Validates required fields                      │
│            - Validates data types                           │
│            - Validates username format                      │
│            - Validates username length                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 4. Domains Layer                                            │
│    RegisterUser entity validates business rules             │
│    Throws errors if validation fails:                       │
│    - REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY              │
│    - REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION         │
│    - REGISTER_USER.USERNAME_LIMIT_CHAR                      │
│    - REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 5. Applications Layer (continued)                           │
│    Step 2: userRepository.verifyAvailableUsername()         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 6. Infrastructures Layer                                    │
│    UserRepositoryPostgres.verifyAvailableUsername()         │
│    - Queries database: SELECT username WHERE...             │
│    - Throws InvariantError if username exists               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 7. Applications Layer (continued)                           │
│    Step 3: passwordHash.hash(password)                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 8. Infrastructures Layer                                    │
│    BcryptPasswordHash.hash()                                │
│    - Hashes password with bcrypt                            │
│    - Returns hashed password                                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 9. Applications Layer (continued)                           │
│    Step 4: userRepository.addUser(registerUser)             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 10. Infrastructures Layer                                   │
│     UserRepositoryPostgres.addUser()                        │
│     - Generates ID: user-{nanoid}                           │
│     - INSERT INTO users VALUES(...)                         │
│     - Returns RegisteredUser entity                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 11. Interfaces Layer                                        │
│     UsersHandler formats response                           │
│     Response:                                               │
│     {                                                       │
│       status: "success",                                    │
│       data: {                                               │
│         addedUser: { id, username, fullname }               │
│       }                                                     │
│     }                                                       │
│     Status Code: 201                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

Errors are handled consistently across all layers:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Domain Layer throws semantic error                       │
│    throw new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_...')  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 2. Error bubbles up through layers                          │
│    Use Case → Handler → Server                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 3. Server's onPreResponse hook catches error                │
│    createServer.js                                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 4. DomainErrorTranslator.translate(error)                   │
│    Converts domain error to HTTP error                      │
│    Error → InvariantError (400)                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 5. ClientError check                                        │
│    if (translatedError instanceof ClientError)              │
│    Return 4xx response with error message                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 6. HTTP Response                                            │
│    {                                                        │
│      status: "fail",                                        │
│      message: "tidak dapat membuat user baru..."            │
│    }                                                        │
│    Status Code: 400                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits of This Architecture

### ✅ **Testability**

- Each layer can be tested in isolation
- Dependencies are easily mocked/stubbed
- Use cases are framework-agnostic
- High code coverage achievable

### ✅ **Independence**

- Business logic doesn't depend on frameworks
- Can switch from Hapi to Express without changing use cases
- Can switch from PostgreSQL to MongoDB by swapping repository
- Can change password hashing algorithm easily

### ✅ **Flexibility**

- Easy to add new features (new use cases)
- Easy to modify existing features
- Easy to swap implementations (Strategy pattern)
- Easy to add new delivery mechanisms (CLI, GraphQL, etc.)

### ✅ **Maintainability**

- Clear separation of concerns
- Each class has a single responsibility
- Easy to locate and fix bugs
- Consistent code organization

### ✅ **Scalability**

- Modular plugin architecture
- Easy to split into microservices
- Easy to add new endpoints
- Clear contracts between layers

### ✅ **Team Collaboration**

- Teams can work on different layers independently
- Clear interfaces reduce integration issues
- Easy onboarding for new developers
- Self-documenting code structure

---

## Directory Structure Summary

```
src/
├── app.js                          # Application entry point
│
├── Domains/                        # 🔵 Core Business Logic
│   └── users/
│       ├── UserRepository.js       # Repository interface
│       ├── entities/
│       │   ├── RegisterUser.js     # Input entity
│       │   └── RegisteredUser.js   # Output entity
│       └── _test/
│
├── Applications/                   # 🟢 Use Cases & Application Logic
│   ├── use_case/
│   │   ├── AddUserUseCase.js       # User registration flow
│   │   └── _test/
│   └── security/
│       ├── PasswordHash.js         # Hashing interface
│       └── _test/
│
├── Infrastructures/                # 🟡 External Implementations
│   ├── container.js                # Dependency injection setup
│   ├── http/
│   │   ├── createServer.js         # Hapi server config
│   │   └── _test/
│   ├── repository/
│   │   ├── UserRepositoryPostgres.js
│   │   └── _test/
│   ├── security/
│   │   ├── BcryptPasswordHash.js
│   │   └── _test/
│   └── database/
│       └── postgres/
│           └── pool.js             # DB connection
│
├── Interfaces/                     # 🔴 External Interface (HTTP)
│   └── http/
│       └── api/
│           ├── users/
│           │   ├── handler.js      # HTTP handlers
│           │   ├── routes.js       # Route definitions
│           │   └── index.js        # Plugin registration
│           └── authentications/
│               ├── handler.js
│               ├── routes.js
│               └── index.js
│
└── Commons/                        # Shared Utilities
    ├── config.js                   # Configuration
    └── exceptions/                 # Error handling
        ├── ClientError.js
        ├── InvariantError.js
        ├── AuthenticationError.js
        ├── NotFoundError.js
        ├── DomainErrorTranslator.js
        └── _test/
```

---

## Testing Strategy

Each layer has dedicated test files in `_test/` directories:

- **Domains Tests:** Pure unit tests, no mocking needed
- **Applications Tests:** Unit tests with mocked repositories/services
- **Infrastructures Tests:** Integration tests with test databases
- **Interfaces Tests:** API tests with request simulation

---

## Best Practices Applied

1. **Dependency Inversion Principle (DIP)**

   - High-level modules don't depend on low-level modules
   - Both depend on abstractions (interfaces)

2. **Single Responsibility Principle (SRP)**

   - Each class has one reason to change
   - Clear separation of concerns

3. **Open/Closed Principle (OCP)**

   - Open for extension, closed for modification
   - Add new features without changing existing code

4. **Interface Segregation Principle (ISP)**

   - Clients depend on minimal interfaces
   - No fat interfaces

5. **Liskov Substitution Principle (LSP)**
   - Implementations can be substituted for interfaces
   - Polymorphic behavior

---

## Conclusion

This architecture provides a solid foundation for building scalable, maintainable, and testable applications. The clear separation of concerns and dependency management ensures that the codebase remains flexible and easy to evolve over time.

The architecture follows Uncle Bob's Clean Architecture principles, making it an excellent example of professional software engineering practices in Node.js.
