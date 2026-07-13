# MockHireAI - AI-Powered Mock Interview Platform

A full-stack AI-powered mock interview platform with user authentication, payment integration, AWS S3 file storage, and admin dashboard.

## Tech Stack

**Frontend:** React 19 + Vite, Tailwind CSS, Framer Motion
**Backend:** Node.js + Express, MongoDB, Mongoose
**Storage:** AWS S3
**Payments:** Razorpay
**Auth:** Firebase Auth
**Deployment:** Vercel (Frontend) + Render (Backend)


## Project Structure
```
MockHireAI/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── server/                 # Backend (Express + Node)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── index.js
├── .gitignore
├── .env.example
└── README.md
```


## Local Development Setup

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd MockHireAI
   ```

2. **Install dependencies:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Environment Setup:**
   - Create `.env` in root (copy from `.env.example`) and fill in your values
   - Create `client/.env.local` (copy from `client/.env.example`) and set `VITE_API_URL=http://localhost:5000`

4. **Run the apps:**
   - **Backend:** cd server && npm start
   - **Frontend:** cd client && npm run dev


## Deployment Guide

---

### Part 1: Deploy Backend to Render

1. **Prepare your code:**
   - Ensure your server's `package.json` has a start script (`"start": "node index.js"`)
   - Make sure your code uses environment variables (we already updated this!)

2. **Create a Render Account:**
   - Sign up at https://render.com/ using your GitHub account

3. **Create a New Web Service on Render:**
   - Go to Dashboard > New Web Service
   - Connect your GitHub repository
   - Select your repo, choose branch (e.g., main)

4. **Configure Render Web Service:**
   - **Name:** mockhire-backend
   - **Region:** Choose the one closest to you
   - **Root Directory:** Leave blank (if your server files are not in root, set this to `server`)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Choose Free or paid (Free works for small projects)

5. **Add Environment Variables in Render:**
   - Go to your Render service > Environment
   - Add the following:
     - `PORT` (Render sets this automatically, but you can add if needed)
     - `MONGO_URI`: Your MongoDB Atlas connection string
     - `CLIENT_URL`: (You'll fill this after deploying frontend - use Vercel app URL)
     - `RAZORPAY_KEY_ID`: Your Razorpay key
     - `RAZORPAY_KEY_SECRET`: Your Razorpay secret
     - `AWS_ACCESS_KEY_ID`: Your AWS access key
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
     - `AWS_S3_BUCKET_NAME`: Your S3 bucket name
     - `AWS_REGION`: Your AWS region (e.g., `us-east-1`)

6. **Deploy Backend:**
   - Click "Create Web Service"
   - Wait for deployment to finish! Copy the Render service URL (e.g., https://mockhire-backend.onrender.com)


---

### Part 2: Deploy Frontend to Vercel

1. **Prepare Frontend:**
   - Ensure your code uses `VITE_API_URL` (we updated this!)
   - Push your latest changes to GitHub

2. **Create a Vercel Account:**
   - Sign up at https://vercel.com/ using your GitHub account

3. **Import Project to Vercel:**
   - Go to Dashboard > Add New > Project
   - Import your GitHub repository
   - Select your repo, click Import

4. **Configure Vercel Project:**
   - **Project Name:** mockhire (or your chosen name)
   - **Root Directory:** Set to `client`
   - **Framework Preset:** Vite (should be auto-detected)
   - **Build and Output Settings:** Leave default
   - **Environment Variables:**
     - Add `VITE_API_URL` and set to your Render backend URL (from step 6 of backend deployment, e.g., https://mockhire-backend.onrender.com)

5. **Deploy:**
   - Click "Deploy"
   - Once deployed, copy your Vercel app URL (e.g., https://mockhire.vercel.app)

6. **Update Render Client URL:**
   - Go back to your Render backend > Environment > Edit `CLIENT_URL` to your new Vercel URL
   - Re-deploy the backend for changes to take effect!


---

## Environment Variables

### Server (.env)
| Variable | Description |
|----------|-------------|
| PORT | Server port number (default: 5000) |
| MONGO_URI | MongoDB connection string |
| CLIENT_URL | Frontend URL (for CORS) |
| RAZORPAY_KEY_ID | Razorpay key ID |
| RAZORPAY_KEY_SECRET | Razorpay key secret |
| AWS_ACCESS_KEY_ID | AWS IAM access key |
| AWS_SECRET_ACCESS_KEY | AWS IAM secret key |
| AWS_S3_BUCKET_NAME | AWS S3 bucket name |
| AWS_REGION | AWS region |

### Client (client/.env.local)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |


## Features
- User authentication with Firebase
- AI-powered mock interviews
- Payment integration with Razorpay for credits
- AWS S3 for private file storage
- Admin dashboard with user, inquiry, and plan management
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion


## License
MIT
