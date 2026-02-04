# Daily logger

- This is a simple app to log your daily tasks and more

## Database entities

- User
- Task
- Summary
- Sleep

## Auth endpoints

`/api/auth/signup`

- body:
  ```json
  {
    "full_name": "shivendra devadhe",
    "username": "shiv",
    "email": "shiv@gmail.com",
    "password": "1234"
  }
  ```
- response:
  ```json
  {
    "statusCode": 201,
    "message": "Registered new user successfully.",
    "data": {
      "username": "ada",
      "email": "ada@gmail.com"
    },
    "status": true
  }
  ```

`/api/auth/signin`

- body:
  ```json
  {
    "email": "shiv@gmail.com",
    "password": "1234"
  }
  ```
- response:
  ```json
  {
    "statusCode": 201,
    "message": "Logged in successfully.",
    "data": {
      "full_name": "shivendra devadhe",
      "username": "shiv",
      "email": "shiv@gmail.com"
    },
    "status": true
  }
  ```

`/api/auth/refresh`

- body:
  ```json
  {}
  ```
- response:
  ```json
  {
    "statusCode": 201,
    "message": "Tokens refreshed successfully.",
    "data": {
      "username": "shiv",
      "email": "shiv@gmail.com"
    },
    "status": true
  }
  ```

`/api/auth/logout`

- body:
  ```json
  {}
  ```
- response:
  ```json
  {
    "statusCode": 201,
    "message": "Logged out successfully.",
    "data": null,
    "status": true
  }
  ```
