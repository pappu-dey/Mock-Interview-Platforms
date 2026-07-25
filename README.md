# 🎤 Mock Interview Platform

A full-stack mock interview platform built with **React + Vite** (frontend) and **Spring Boot** (backend), backed by a MySQL database on Aiven.

---

## 📁 Project Structure

```
Mock-interview-platfrom/
├── frontend/          → React + Vite app
└── backend/
    └── spring/
        └── mock-interview/   → Spring Boot REST API
```

---

## 🚀 Getting Started (For Teammates)

### Prerequisites
- Java 17+
- Node.js 18+
- Maven (or use the `mvnw` wrapper)
- Git

---

## ⚙️ Backend Setup (Spring Boot)

### 1. Navigate to the backend
```bash
cd backend/spring/mock-interview
```

### 2. Create your local credentials file
Copy the example file and fill in the real credentials:

```bash
# Mac / Linux
cp src/main/resources/application.properties.example src/main/resources/application-local.properties

# Windows (PowerShell)
Copy-Item src\main\resources\application.properties.example src\main\resources\application-local.properties
```

### 3. Fill in the real credentials
Open `application-local.properties` and replace the placeholders:

```properties
spring.datasource.url=jdbc:mysql://<HOST>:<PORT>/<DB>?ssl-mode=REQUIRED
spring.datasource.username=<ASK_TEAM_LEAD>
spring.datasource.password=<ASK_TEAM_LEAD>
jwt.secret=<ASK_TEAM_LEAD>
jwt.expiration=86400000
```

> 🔑 **Get the real credentials from your team lead via Slack/WhatsApp — never share via git!**

### 4. Run the backend
```bash
# Mac / Linux
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Windows
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

The API will start at **http://localhost:8080**

---

## 🎨 Frontend Setup (React + Vite)

### 1. Navigate to the frontend
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your local env file (optional)
```bash
# Mac / Linux
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

### 4. Run the frontend
```bash
npm run dev
```

The app will start at **http://localhost:5173**

---

## 🔐 Credentials & Secrets Policy

| File | In Git? | Purpose |
|------|---------|---------|
| `application.properties` | ❌ No | Gitignored — uses `${ENV_VAR}` placeholders |
| `application-local.properties` | ❌ No | Your real local credentials (gitignored) |
| `application.properties.example` | ✅ Yes | Safe template — copy this to get started |
| `frontend/.env.local` | ❌ No | Frontend env vars (gitignored) |
| `frontend/.env.example` | ✅ Yes | Safe env template |

> ⚠️ **Never commit real passwords, API keys, or JWT secrets to git.**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS |
| Backend | Spring Boot 3, Spring Security, JPA |
| Database | MySQL (Aiven Cloud) |
| Auth | JWT (JSON Web Tokens) |

---

## 📬 Questions?

Ask in the team group or open a GitHub Issue.
