# Docker Setup & Deployment Guide

This project includes a complete multi-container Docker setup for both the **Frontend (React / Vite + Nginx)** and the **Backend (Node.js Express + MongoDB)**.

---

## 🚀 Quick Start

### 1. Make sure Docker Desktop is open and running

### 2. Start all containers
Run the following command in the project root:
```bash
docker-compose up --build -d
```

### 3. Open the application
- **Storefront & Admin**: [http://localhost:3000](http://localhost:3000)
- **Admin Direct Route**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🛠 Useful Commands

### View live logs
```bash
docker-compose logs -f
```
Or for a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Check running container status
```bash
docker-compose ps
```

### Seed or reset database inside the container
```bash
docker-compose exec backend npm run seed
```

### Stop all containers
```bash
docker-compose down
```

---

## 🏗 Architecture Overview

| Service | Port | Base Image | Role |
|---|---|---|---|
| **`frontend`** | `3000:80` | `node:20-alpine` → `nginx:alpine` | Multi-stage build. Nginx serves compiled SPA with React Router support (`try_files`) and proxies `/api/*` to backend. |
| **`backend`** | `5000:5000` | `node:20-alpine` | Express REST API connected to MongoDB Atlas. |
| **`store-network`** | - | Bridge Network | Secure internal Docker network linking frontend and backend. |

