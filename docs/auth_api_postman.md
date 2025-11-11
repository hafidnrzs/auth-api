# Auth API - Postman Test Documentation

## Overview

This document describes the Postman collection for testing the Auth API. The collection contains 11 test cases covering user registration, authentication, token refresh, and logout functionality.

## Environment Variables

| Variable       | Default Value      | Description                 |
| -------------- | ------------------ | --------------------------- |
| `host`         | localhost          | API host                    |
| `port`         | 3000               | API port                    |
| `newUsername`  | dicoding           | Username for test user      |
| `newPassword`  | secret             | Password for test user      |
| `newFullname`  | Dicoding Indonesia | Full name for test user     |
| `accessToken`  | -                  | Auto-populated during login |
| `refreshToken` | -                  | Auto-populated during login |

## Test Cases

### 1. User Registration

#### 1.1 Add User with Valid Payload

**Endpoint:** `POST /users`

**Request Body:**

```json
{
  "username": "{{newUsername}}_{{$timestamp}}",
  "password": "{{newPassword}}",
  "fullname": "{{newFullname}}"
}
```

**Expected Response:** `201 Created`

```json
{
  "status": "success",
  "data": {
    "addedUser": {
      "id": "string",
      "username": "string",
      "fullname": "string"
    }
  }
}
```

**Test Assertions:**

- Response status code should be 201
- Response should have correct properties (status, data, addedUser)
- `addedUser.id`, `addedUser.username`, and `addedUser.fullname` should be strings

---

#### 1.2 Add User with Bad Payload

**Endpoint:** `POST /users`

**Test Payloads:**
The test iterates through multiple invalid payloads:

1. Empty object: `{}`
2. Missing username: `{ "password": "secret", "fullname": "Dicoding Indonesia" }`
3. Invalid username type: `{ "username": 123, "password": "secret", "fullname": "Dicoding Indonesia" }`
4. Missing password: `{ "username": "dicoding", "fullname": "Dicoding Indonesia" }`
5. Invalid password type: `{ "username": "dicoding", "password": true, "fullname": "Dicoding Indonesia" }`
6. Missing fullname: `{ "username": "dicoding", "password": "secret" }`
7. Invalid fullname type: `{ "username": "dicoding", "password": "secret", "fullname": [] }`

**Expected Response:** `400 Bad Request`

```json
{
  "status": "fail",
  "message": "string (error description)"
}
```

**Test Assertions:**

- Response status code should be 400
- Response should have `status` property with value "fail"
- Response should have a non-empty `message` property

---

#### 1.3 Add User with Existing Username

**Endpoint:** `POST /users`

**Request Body:**

```json
{
  "username": "{{newUsername}}",
  "password": "{{newPassword}}",
  "fullname": "{{newFullname}}"
}
```

**Pre-request:** Creates a user first to ensure username exists

**Expected Response:** `400 Bad Request`

```json
{
  "status": "fail",
  "message": "username tidak tersedia"
}
```

**Test Assertions:**

- Response status code should be 400
- Response should have `status` property with value "fail"
- Response message should be "username tidak tersedia"

---

#### 1.4 Add User with Username Containing Restricted Characters

**Endpoint:** `POST /users`

**Request Body:**

```json
{
  "username": "dico ding",
  "password": "{{newPassword}}",
  "fullname": "{{newFullname}}"
}
```

**Expected Response:** `400 Bad Request`

```json
{
  "status": "fail",
  "message": "tidak dapat membuat user baru karena username mengandung karakter terlarang"
}
```

**Test Assertions:**

- Response status code should be 400
- Response should have `status` property with value "fail"
- Response message should indicate username contains restricted characters

---

### 2. Authentication

#### 2.1 Login with Valid Credentials

**Endpoint:** `POST /authentications`

**Request Body:**

```json
{
  "username": "{{newUsername}}",
  "password": "{{newPassword}}"
}
```

**Pre-request:** Creates a user first to ensure credentials exist

**Expected Response:** `201 Created`

```json
{
  "status": "success",
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Test Assertions:**

- Response status code should be 201
- Response should have correct properties
- `accessToken` and `refreshToken` should be strings
- Tokens are saved to environment variables for subsequent tests

---

#### 2.2 Login with Invalid Username

**Endpoint:** `POST /authentications`

**Request Body:**

```json
{
  "username": "xxxx",
  "password": "{{newPassword}}"
}
```

**Expected Response:** `400 Bad Request`

```json
{
  "status": "fail",
  "message": "string (error description)"
}
```

**Test Assertions:**

- Response status code should be 400
- Response should have `status` property with value "fail"
- Response should have a `message` property (string)

---

#### 2.3 Login with Invalid Password

**Endpoint:** `POST /authentications`

**Request Body:**

```json
{
  "username": "{{newUsername}}",
  "password": "xxx"
}
```

**Expected Response:** `401 Unauthorized`

```json
{
  "status": "fail",
  "message": "string (error description)"
}
```

**Test Assertions:**

- Response status code should be 401
- Response should have `status` property with value "fail"
- Response should have a `message` property (string)

---

### 3. Token Refresh

#### 3.1 Refresh Access Token with Valid Refresh Token

**Endpoint:** `PUT /authentications`

**Request Body:**

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Expected Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "accessToken": "string"
  }
}
```

**Test Assertions:**

- Response status code should be 200
- Response should have correct properties
- `accessToken` should be a non-empty string

---

#### 3.2 Refresh Access Token with Invalid Refresh Token

**Endpoint:** `PUT /authentications`

**Request Body:**

```json
{
  "refreshToken": "xxx"
}
```

**Expected Response:** `400 Bad Request`

```json
{
  "status": "fail",
  "message": "refresh token tidak valid"
}
```

**Test Assertions:**

- Response status code should be 400
- Response should have `status` property with value "fail"
- Response message should be "refresh token tidak valid"

---

### 4. Logout

#### 4.1 Logout with Valid Refresh Token

**Endpoint:** `DELETE /authentications`

**Request Body:**

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Expected Response:** `200 OK`

```json
{
  "status": "success"
}
```

**Test Assertions:**

- Response status code should be 200
- Response should have `status` property with value "success"
- Additional test: Attempts to refresh with the deleted token should return 400

---

#### 4.2 Logout with Invalid Refresh Token

**Endpoint:** `DELETE /authentications`

**Request Body:**

```json
{
  "refreshToken": "xxx"
}
```

**Expected Response:** `400 Bad Request`

```json
{
  "status": "fail",
  "message": "refresh token tidak ditemukan di database"
}
```

**Test Assertions:**

- Response status code should be 400
- Response should have `status` property with value "fail"
- Response message should be "refresh token tidak ditemukan di database"

---

## API Endpoints Summary

| Method | Endpoint           | Description                         |
| ------ | ------------------ | ----------------------------------- |
| POST   | `/users`           | Register a new user                 |
| POST   | `/authentications` | Login and get tokens                |
| PUT    | `/authentications` | Refresh access token                |
| DELETE | `/authentications` | Logout and invalidate refresh token |

## Running the Tests

1. Import `Auth API.postman_collection.json` into Postman
2. Import `Auth API.postman_environment.json` as environment
3. Select "Auth API" environment
4. Run the collection or individual requests
5. View test results in the Test Results tab

## Notes

- The collection uses environment variables for dynamic data
- Some tests have pre-request scripts to set up test data
- Tests are designed to run sequentially for dependent scenarios
- The "Add User with Bad Payload" test iterates through multiple invalid payloads automatically
