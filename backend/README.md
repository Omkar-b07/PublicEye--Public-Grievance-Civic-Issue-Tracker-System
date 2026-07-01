# Public-Eye Backend

This is the Node.js / Express backend for the PublicEye Civic Grievance Tracker, using MongoDB as the database with Mongoose ODM.

## Requirements
- Node.js (v18+)
- MongoDB (running locally or via Atlas)

## Setup Local Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup Environment Variables:
   Create a `.env` file referencing `.env.example`:
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/publiceye
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. Running Local Development Server:
   ```bash
   npm run dev
   ```

4. Production Start:
   ```bash
   npm start
   ```

## Database Seeding
Upon first connection, the backend database is automatically seeded with default system accounts (Admin, Department, Senior Authority) and sample civic issues to make the system ready to use immediately.

## Deployment

### Docker Deployment
You can build and deploy the backend containerized:
```bash
docker build -t publiceye-backend .
docker run -p 8000:8000 -e MONGODB_URI=mongodb://host.docker.internal:27017/publiceye -e JWT_SECRET=secret publiceye-backend
```

### Render Deployment
This repository is configured for deployment to **Render** via `backend/render.yaml`.
- Deploy it by linking your GitHub repository to Render as a Web Service.
- Set the Root Directory to `backend`.
- Add environment variables `MONGODB_URI` and `JWT_SECRET`.
