# SRJJ AMS API

Backend API for the **SRJJ Accounting Management System (AMS)**.

This project handles authentication, account security, role management, OTP login, email verification, password recovery, refresh token rotation, and session revocation.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Zod
- Nodemailer
- dotenv
- Nodemon
- ESLint
- Prettier

---

## Requirements

Install the following before running the project:

- Node.js 22+
- npm
- Git
- MongoDB Atlas or local MongoDB
- SMTP or email provider

Check installed versions:

```bash
node --version
npm --version
git --version
```

Recommended:

```text
Node.js 22 LTS
npm 10+
```

---

## Project Structure

```text
ams-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── constants/
│   │   └── model-types.js
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── enums/
│   │   ├── account-status.enum.js
│   │   └── role.enum.js
│   │
│   ├── errors/
│   │   └── app-error.js
│   │
│   ├── middleware/
│   │   ├── authenticate.middleware.js
│   │   ├── ensure-active.middleware.js
│   │   ├── error.middleware.js
│   │   └── rate-limit.middleware.js
│   │
│   ├── models/
│   │   ├── admin.model.js
│   │   ├── admin-profile.model.js
│   │   ├── email-verification-token.model.js
│   │   ├── login-attempt.model.js
│   │   ├── login-otp.model.js
│   │   ├── refresh-token.model.js
│   │   ├── revoked-access-token.model.js
│   │   ├── user-has-role.model.js
│   │   └── user-has-status.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── index.js
│   │
│   ├── services/
│   │   ├── access-token.service.js
│   │   ├── account-status.service.js
│   │   ├── auth.service.js
│   │   ├── email-verification.service.js
│   │   ├── id-generator.service.js
│   │   ├── login-attempt.service.js
│   │   ├── login-otp.service.js
│   │   ├── mail.service.js
│   │   ├── password-reset.service.js
│   │   ├── refresh-token.service.js
│   │   └── token.service.js
│   │
│   ├── templates/
│   │   ├── login-otp.template.js
│   │   ├── password-reset.template.js
│   │   ├── verification.template.js
│   │   └── welcome.template.js
│   │
│   ├── utils/
│   │   ├── async-handler.js
│   │   ├── crypto.js
│   │   └── response.js
│   │
│   ├── validators/
│   │   └── auth.validator.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/ams-api.git
```

Open the project:

```bash
cd ams-api
```

Install dependencies:

```bash
npm install
```

---

## Environment Setup

Create a `.env` file in the project root.

Windows:

```bash
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Example configuration:

```env
NODE_ENV=development

PORT=5000

MONGODB_URI=

CLIENT_URL=http://localhost:9000
API_URL=http://localhost:5000

JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

JWT_PASSWORD_RESET_SECRET=
JWT_PASSWORD_RESET_EXPIRES_IN=15m

BCRYPT_SALT_ROUNDS=12

MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME_MINUTES=15

EMAIL_VERIFICATION_EXPIRES_HOURS=24

LOGIN_OTP_EXPIRES_MINUTES=5
LOGIN_OTP_MAX_ATTEMPTS=5
LOGIN_OTP_RESEND_COOLDOWN_SECONDS=60
LOGIN_OTP_MAX_RESENDS=3

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

SMTP_USER=
SMTP_PASS=

MAIL_FROM_NAME=SRJJ Accounting Services
MAIL_FROM_ADDRESS=
```

Never commit `.env` files.

---

## Generate JWT Secrets

Generate a strong random secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run it three times and use separate values for:

```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_PASSWORD_RESET_SECRET=
```

---

## MongoDB Setup

Example MongoDB Atlas connection:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ams_development
```

Recommended database names:

```text
ams_development
ams_staging
ams_production
```

Keep development, staging, and production data separated.

---

## SMTP Setup

Example Gmail configuration:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password

MAIL_FROM_NAME=SRJJ Accounting Services
MAIL_FROM_ADDRESS=your-email@gmail.com
```

Use a Google App Password rather than your normal account password.

---

## Recommended package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "start:dev": "cross-env NODE_ENV=development node src/server.js",
    "start:staging": "cross-env NODE_ENV=staging node src/server.js",
    "start:prod": "cross-env NODE_ENV=production node src/server.js",
    "dev:staging": "cross-env NODE_ENV=staging nodemon src/server.js",
    "dev:prod": "cross-env NODE_ENV=production nodemon src/server.js",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{js,json}\"",
    "format:check": "prettier --check \"src/**/*.{js,json}\"",
    "test": "node --test",
    "test:watch": "node --test --watch",
    "check": "npm run lint && npm run format:check && npm test"
  }
}
```

Install development dependencies if needed:

```bash
npm install -D nodemon cross-env eslint prettier
```

---

## Run Scripts

### Development

```bash
npm run dev
```

Runs the API with Nodemon and automatically restarts when files change.

### Normal Start

```bash
npm start
```

Equivalent to:

```bash
node src/server.js
```

### Development Environment

```bash
npm run start:dev
```

### Staging Environment

```bash
npm run start:staging
```

### Production Environment

```bash
npm run start:prod
```

### Staging With Nodemon

```bash
npm run dev:staging
```

### Production With Nodemon

```bash
npm run dev:prod
```

### Lint

```bash
npm run lint
```

### Fix Lint Errors

```bash
npm run lint:fix
```

### Format

```bash
npm run format
```

### Check Formatting

```bash
npm run format:check
```

### Run Tests

```bash
npm test
```

### Watch Tests

```bash
npm run test:watch
```

### Run All Checks

```bash
npm run check
```

---

## Local URLs

Backend:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api/v1
```

Frontend:

```text
http://localhost:9000
```

---

## Authentication Flow

```text
Register
   ↓
Verify Email
   ↓
Administrator Approval
   ↓
Login
   ↓
OTP Verification
   ↓
Access Token + Refresh Token
   ↓
Dashboard
```

---

## Password Recovery Flow

```text
Forgot Password
      ↓
Reset email
      ↓
Reset Password
      ↓
Password changed
      ↓
token_version + 1
      ↓
Refresh tokens revoked
      ↓
Existing sessions invalidated
```

---

## Token Strategy

### Access Token

Default lifetime:

```text
15 minutes
```

Protected routes require:

```http
Authorization: Bearer ACCESS_TOKEN
```

### Refresh Token

Default lifetime:

```text
7 days
```

Refresh tokens are rotated whenever `/refresh` is called.

### JTI

Each access token has a unique `jti`.

Used to revoke the current access token during normal logout.

### token_version

Used to invalidate all access tokens previously issued to an account.

Typical uses:

- Password reset
- Change password
- Logout all devices
- Forced session invalidation

---

## API Routes

Base path:

```text
/api/v1/auth
```

### Register

```http
POST /api/v1/auth/register
```

### Login

```http
POST /api/v1/auth/login
```

### Verify OTP

```http
POST /api/v1/auth/verify-login-otp
```

### Resend OTP

```http
POST /api/v1/auth/resend-login-otp
```

### Verify Email

```http
GET /api/v1/auth/verify-email?token=TOKEN
```

### Resend Verification

```http
POST /api/v1/auth/resend-verification
```

### Forgot Password

```http
POST /api/v1/auth/forgot-password
```

### Reset Password

```http
POST /api/v1/auth/reset-password
```

### Change Password

```http
POST /api/v1/auth/change-password
```

Requires:

```http
Authorization: Bearer ACCESS_TOKEN
```

### Refresh

```http
POST /api/v1/auth/refresh
```

### Logout

```http
POST /api/v1/auth/logout
```

### Logout All

```http
POST /api/v1/auth/logout-all
```

### Current Account

```http
GET /api/v1/auth/view
```

---

## Account Status

| Value | Status |
|---:|---|
| 0 | Pending |
| 1 | Active |
| 2 | Deactivated |
| 3 | Locked |
| 4 | Deleted |

---

## Roles

| Value | Role |
|---:|---|
| 0 | Super Admin |
| 1 | Admin |
| 2 | Client |
| 3 | Employee |

---

## Login Security

Default configuration:

```env
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME_MINUTES=15
```

Flow:

```text
Wrong Password
      ↓
Attempt + 1
      ↓
Maximum Attempts
      ↓
Account Locked
      ↓
Lock Duration
      ↓
Automatic Unlock
```

---

## OTP Security

```env
LOGIN_OTP_EXPIRES_MINUTES=5
LOGIN_OTP_MAX_ATTEMPTS=5
LOGIN_OTP_RESEND_COOLDOWN_SECONDS=60
LOGIN_OTP_MAX_RESENDS=3
```

OTP codes should be:

- Cryptographically generated
- Stored as hashes
- Short-lived
- Limited by attempts
- Limited by resend cooldown

---

## Git Setup

Initialize Git:

```bash
git init
```

Add files:

```bash
git add .
```

Commit:

```bash
git commit -m "Initial SRJJ AMS API setup"
```

Set the main branch:

```bash
git branch -M main
```

Add remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ams-api.git
```

Push:

```bash
git push -u origin main
```

---

## Staging Branch

Create:

```bash
git checkout -b staging
```

Push:

```bash
git push -u origin staging
```

Recommended branch flow:

```text
feature/*
    ↓
staging
    ↓
main
```

Environment mapping:

```text
staging
→ testing/staging environment

main
→ production environment
```

---

## Daily Git Workflow

Update staging:

```bash
git checkout staging
git pull origin staging
```

Create a feature branch:

```bash
git checkout -b feature/feature-name
```

After making changes:

```bash
git status
git add .
git commit -m "Describe your changes"
git push -u origin feature/feature-name
```

Create a pull request:

```text
feature/feature-name
        ↓
staging
```

After testing:

```text
staging
   ↓
main
```

---

## Push Directly to Staging

```bash
git checkout staging
git add .
git commit -m "Update staging"
git push origin staging
```

---

## Production Merge

After staging has been tested:

```bash
git checkout main
git pull origin main
git merge staging
git push origin main
```

---

## .gitignore

Recommended:

```gitignore
# Dependencies
node_modules/

# Environment
.env
.env.*
!.env.example

# Logs
*.log
logs/

# Build
dist/
build/
coverage/

# Cache
.cache/
.npm/
.vite/
.eslintcache

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# Credentials
*service-account*.json
firebase-adminsdk*.json
credentials.json
secrets.json

# Certificates
*.pem
*.key
*.p12
*.pfx

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
desktop.ini
```

---

## Staging Environment

Example:

```env
NODE_ENV=staging

MONGODB_URI=YOUR_STAGING_MONGODB_URI

CLIENT_URL=https://staging.example.com
API_URL=https://api-staging.example.com

JWT_ACCESS_SECRET=STAGING_ACCESS_SECRET
JWT_REFRESH_SECRET=STAGING_REFRESH_SECRET
JWT_PASSWORD_RESET_SECRET=STAGING_RESET_SECRET
```

Use staging-specific secrets.

---

## Production Environment

Example:

```env
NODE_ENV=production

MONGODB_URI=YOUR_PRODUCTION_MONGODB_URI

CLIENT_URL=https://app.example.com
API_URL=https://api.example.com

JWT_ACCESS_SECRET=PRODUCTION_ACCESS_SECRET
JWT_REFRESH_SECRET=PRODUCTION_REFRESH_SECRET
JWT_PASSWORD_RESET_SECRET=PRODUCTION_RESET_SECRET
```

Never reuse staging secrets in production.

---

## Render Deployment

A simple deployment structure:

```text
GitHub
   ↓
Render
   ↓
Node.js / Express
   ↓
MongoDB Atlas
```

Create separate services for:

```text
AMS API Staging
AMS API Production
```

### Staging Service

```text
Branch:
staging

Build Command:
npm ci

Start Command:
npm start
```

### Production Service

```text
Branch:
main

Build Command:
npm ci

Start Command:
npm start
```

Enable Render Auto-Deploy.

Then:

```bash
git push origin staging
```

automatically updates staging.

And:

```bash
git push origin main
```

automatically updates production.

---

## Optional Docker Setup

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
```

Create `.dockerignore`:

```dockerignore
node_modules
npm-debug.log

.git
.github

.env
.env.*

coverage
README.md
```

### Build Docker Image

```bash
docker build -t srjj-ams-api .
```

### Run Docker

macOS/Linux:

```bash
docker run   --env-file .env   -p 5000:5000   srjj-ams-api
```

Windows PowerShell:

```powershell
docker run `
  --env-file .env `
  -p 5000:5000 `
  srjj-ams-api
```

### List Containers

```bash
docker ps
```

### Stop Container

```bash
docker stop CONTAINER_ID
```

### List Images

```bash
docker images
```

### Remove Image

```bash
docker rmi srjj-ams-api
```

---

## Useful Commands

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Start

```bash
npm start
```

### Staging

```bash
npm run start:staging
```

### Production

```bash
npm run start:prod
```

### Lint

```bash
npm run lint
```

### Lint Fix

```bash
npm run lint:fix
```

### Format

```bash
npm run format
```

### Tests

```bash
npm test
```

### Full Check

```bash
npm run check
```

---

## First-Time Setup

Windows:

```bash
git clone https://github.com/YOUR_USERNAME/ams-api.git

cd ams-api

npm install

copy .env.example .env

npm run dev
```

macOS/Linux:

```bash
git clone https://github.com/YOUR_USERNAME/ams-api.git

cd ams-api

npm install

cp .env.example .env

npm run dev
```

Configure `.env` before starting the application.

---

## Local Architecture

```text
Quasar Frontend
http://localhost:9000
        │
        │ Axios / HTTP
        ▼
SRJJ AMS API
http://localhost:5000/api/v1
        │
        ▼
MongoDB Atlas
```

---

## Staging Architecture

```text
Developer
   ↓
GitHub
   ↓
staging branch
   ↓
Render Auto Deploy
   ↓
AMS Staging API
   ↓
MongoDB Staging
```

---

## Production Architecture

```text
staging tested
      ↓
merge to main
      ↓
GitHub main
      ↓
Render Auto Deploy
      ↓
AMS Production API
      ↓
MongoDB Production
```

---

## Frontend

Recommended frontend stack:

```text
Quasar Framework
Vue 3
TypeScript
Pinia
Vue Router
Axios
Sass
```

Local frontend:

```text
http://localhost:9000
```

Local API:

```text
http://localhost:5000/api/v1
```

---

## Security

Never commit:

```text
.env
MongoDB credentials
JWT secrets
SMTP passwords
Google App Passwords
Firebase credentials
Service account files
Private keys
Production secrets
```

If credentials are accidentally pushed:

1. Rotate the exposed credentials immediately.
2. Remove them from the repository.
3. Update local/staging/production secrets.
4. Never rely only on deleting the Git commit.

---

## Setup Complete

After successful local setup:

```text
Frontend
http://localhost:9000

Backend
http://localhost:5000

API
http://localhost:5000/api/v1
```

Recommended development workflow:

```text
Local
  ↓
Feature Branch
  ↓
Staging
  ↓
Testing / QA
  ↓
Main
  ↓
Production
```

---

## License

Private project.

Copyright © SRJJ Accounting Services.

All rights reserved.
