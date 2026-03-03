# Bloom Node API - Authentication Service

Authentication and user management API for the Bloom Plant Disease Detection platform.

## 🚀 Deployment Guide

### Option 1: Deploy to Render (Recommended - Free)

1. **Push your code to GitHub** (if not already done)

2. **Set up MongoDB Atlas** (if you don't have it):
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/bloom`)

3. **Deploy to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend/node-api` folder as root directory
   - Render will auto-detect the `render.yaml` configuration
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string (min 32 characters)
   - Click "Create Web Service"

4. **Update Frontend URLs**:
   - Once deployed, copy your Render URL (e.g., `https://bloom-node-api.onrender.com`)
   - Update your frontend config to use this URL for authentication

### Option 2: Deploy to Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo and set root directory to `backend/node-api`
4. Add environment variables in Railway dashboard
5. Railway will automatically deploy

### Option 3: Deploy to Vercel (Serverless)

```bash
cd backend/node-api
npm install -g vercel
vercel
```

## 📋 Environment Variables Required

```
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string_min_32_chars
FRONTEND_URL=https://bloom--plant-disease-detector.vercel.app
```

## 🧪 Test Locally

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your values
# Then start the server
npm start
```

## 📡 API Endpoints

- `GET /` - Health check
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/credits` - Update user credits (protected)

## 🔧 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing
