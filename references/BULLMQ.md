# 🔴 Redis + BullMQ Integration Notes

## 📌 Why Redis and BullMQ were added

In the Smart Fridge project, many things happen simultaneously:

* Frontend API requests
* MongoDB operations
* Sensor updates
* Email notifications
* Expiry checking jobs
* Background automation tasks

If all these tasks run directly inside the backend request cycle, the server can become overloaded or slow.

To solve this, BullMQ + Redis were integrated.

---

# 🧠 What BullMQ Does

BullMQ is a job queue system for Node.js.

Instead of sending emails directly from API routes:

```js
await transporter.sendMail(...)
```

the backend now places jobs into a queue:

```js
await emailQueue.add("sendEmail", {
  from,
  to,
  subject,
  text,
});
```

BullMQ stores this job in Redis.

A separate worker process later picks the job and executes it.

This prevents:

* API blocking
* Server overload
* Frontend slowdown
* Request timeout issues

---

# 🧠 Why Redis is Needed

BullMQ itself does not store jobs permanently.

Redis acts as:

* in-memory database
* fast queue storage
* temporary job manager

BullMQ uses Redis internally to:

* store pending jobs
* retry failed jobs
* manage worker communication
* track completed jobs

Without Redis, BullMQ cannot work.

---

# 🐳 Why Docker Was Used

Redis was not installed manually on Windows.

Instead, Redis runs inside a Docker container.

Docker allows applications to run inside isolated environments called containers.

In this project:

* Docker runs Redis
* Redis runs inside a lightweight Linux container
* Node.js backend connects to Redis through port `6379`

This avoids:

* manual Redis installation
* Windows compatibility issues
* complex setup

---

# 📦 Docker Commands Used

## Pull Redis image

```powershell
docker pull redis
```

---

## Run Redis container

```powershell
docker run -d --name redis-stack-server -p 6379:6379 redis
```

### Meaning:

* `-d` → run in background
* `--name redis-stack-server` → container name
* `-p 6379:6379` → expose Redis port

---

## Start Redis again later

```powershell
docker start redis-stack-server
```

---

## Stop Redis

```powershell
docker stop redis-stack-server
```

---

## Check running containers

```powershell
docker ps
```

---

# 📁 Files Created for BullMQ Integration

## 1. Redis Connection

### File:

```bash
backend/config/redis.js
```

### Purpose:

Creates Redis connection using ioredis.

Example:

```js
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

module.exports = connection;
```

---

# ⚠️ Why `maxRetriesPerRequest: null` Was Needed

BullMQ throws this error otherwise:

```bash
BullMQ: Your redis options maxRetriesPerRequest must be null
```

BullMQ requires blocking Redis operations for workers.

So this option must be explicitly set.

---

# 2. Queue Creation

### File:

```bash
backend/queues/emailQueue.js
```

### Purpose:

Creates the BullMQ queue.

Example:

```js
const { Queue } = require("bullmq");
const connection = require("../config/redis");

const emailQueue = new Queue("emailQueue", {
  connection,
});

module.exports = emailQueue;
```

---

# 3. Worker Creation

### File:

```bash
backend/workers/emailWorker.js
```

### Purpose:

Processes queued email jobs separately from the backend server.

---

# 🧠 Why Worker Runs Separately

The worker is intentionally independent from the backend server.

This is the core idea of BullMQ.

## Backend server job:

* accept requests
* respond quickly
* add jobs to queue

## Worker job:

* process heavy background tasks
* send emails
* retry failed jobs
* avoid blocking APIs

So the worker is started manually in another terminal.

---

# ▶️ Running the Worker

```powershell
cd backend/workers
node emailWorker.js
```

When running correctly:

```bash
Email worker started...
✅ Redis Connected
```

---

# 📌 Why `.env` Had to be Loaded Again in Worker

Problem faced:

```bash
Error: Missing credentials for "PLAIN"
```

Cause:

* Worker runs independently
* Worker does NOT automatically inherit backend environment variables

So dotenv had to be loaded again manually.

---

# ✅ Fix Used

Inside `emailWorker.js`:

```js
// Load environment variables from backend/.env
// Worker runs inside /workers folder,
// so dotenv needs the correct relative path
require("dotenv").config({ path: "../.env" });
```

This allowed:

* EMAIL_USER
* EMAIL_PASS

to become accessible inside the worker.

---

# 📧 Mail Flow After BullMQ Integration

Current architecture:

```text
Frontend
   ↓
Backend API Route
   ↓
BullMQ Queue
   ↓
Redis
   ↓
Email Worker
   ↓
Nodemailer
   ↓
Gmail SMTP
   ↓
User receives email
```

---

# 🧪 How the System Was Tested

## Redis Test

Checked using:

```powershell
docker ps
```

Redis container should appear.

---

## Worker Test

Worker terminal should show:

```bash
WORKER PICKED JOB
```

---

## Email Test Route

Browser tested with:

```text
http://localhost:4000/test-mail
```

---

# ✅ Current Status

Successfully integrated:

* Redis
* Docker Redis container
* BullMQ queue
* Separate email worker
* Queue-based email sending
* Background job processing

Project now supports scalable asynchronous email processing.
