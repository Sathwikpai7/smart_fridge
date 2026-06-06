# 🐳 Redis Local Setup & Integration Progress

## Redis Setup (Local Development)

Redis was installed and run locally using Docker Desktop for future background job scheduling and automated expiry notification support.

---

# ✅ Redis Installation Process

## Step 1: Install Docker Desktop

Docker Desktop was installed on Windows to manage Redis containers locally.

---

## Step 2: Open PowerShell

PowerShell was used to run Docker commands.

---

## Step 3: Start Redis Container

Command used:

```powershell id="n4kw4d"
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack
```

Explanation:

* `-d` → run container in background
* `--name redis-stack` → container name
* `-p 6379:6379` → expose Redis default port

---

# ✅ Redis Verification

To verify Redis container is running:

```powershell id="b9ktx8"
docker ps
```

Expected:
Redis container appears in running containers list.

---

# 🛑 Redis Stop Command

To stop Redis container:

```powershell id="3tvnbi"
docker stop redis-stack
```

---

# ▶️ Redis Restart Command

To restart Redis container:

```powershell id="c4qxwh"
docker start redis-stack
```

---

# ❌ Redis Remove Container

To completely remove Redis container:

```powershell id="9l3h7r"
docker rm -f redis-stack
```

---

# 🔌 Redis Local Connection Details

Redis currently runs locally on:

```txt id="gn4xqx"
localhost:6379
```

This is Redis default port.

---

# 🧠 Planned Redis Usage in Smart Fridge

Redis is being prepared for:

* Daily expiry scanning
* Scheduled background tasks
* Automated email notifications
* BullMQ job queue integration

---

# 📦 Current Project Status

## Completed

* Docker Desktop setup
* Redis container setup
* Redis local startup verification
* Email notification backend
* MongoDB local connection
* Nodemailer integration

## Not Yet Implemented

* BullMQ workers
* Redis queues
* Automated cron jobs
* Expiry scanning scheduler

---

# ⚙️ Local Development Setup

Current stack running locally:

```txt id="f3m6j2"
Frontend → localhost:5173
Backend  → localhost:4000
MongoDB  → localhost:27017
Redis    → localhost:6379
```

---

# 🚀 Backend Startup Commands

## Start Backend

```bash id="j6n3m5"
cd backend
npm start
```

## Start Frontend

```bash id="vxq5n4"
cd project
npm run dev
```

---
