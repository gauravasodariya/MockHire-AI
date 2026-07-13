# MockHireAI - AI-Powered Mock Interview Platform

## Overview
MockHireAI is a full-stack LLM-powered mock interview platform designed to help users practice and improve their interview skills. The platform uses OpenRouter (GPT-4o-mini) for AI-driven interview questions, resume parsing, and personalized feedback, with user authentication via Firebase, payment integration via Razorpay for purchasing interview credits, AWS S3 storage for resume files, and an admin dashboard to manage users, inquiries, and subscription plans.

## All Features
- **User Authentication**: Google sign-in powered by Firebase Auth
- **AI-Powered Interviews (LLM)**: Uses OpenRouter (GPT-4o-mini) for dynamic interview questions and AI-driven feedback
- **Resume Parsing**: Upload and parse resumes with LLM to extract skills, experience, and projects
- **Interview History**: Record and review past interview sessions
- **Credit-Based System & Rate Limiting**: Users start with free credits (100), need minimum 50 credits to start an interview; can purchase more via Razorpay
- **Resume Upload**: Securely store and manage resumes in AWS S3
- **Admin Dashboard**: 
  - User management
  - Inquiry management (view and resolve contact form submissions)
  - Plan management (create, edit, delete, and reorder subscription plans)
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Smooth Animations**: Enhanced user experience using Framer Motion
- **Secure Cookies**: Production-ready authentication with httpOnly, secure, sameSite cookies

## Tech Stack
| **Category**       | **Technologies**                                                                 |
|---------------------|----------------------------------------------------------------------------------|
| Frontend            | React 19, Vite, Tailwind CSS, Framer Motion                                      |
| Backend             | Node.js, Express.js                                                              |
| Database            | MongoDB, Mongoose ODM                                                           |
| Authentication      | Firebase Auth (Google Sign In)                                                  |
| AI/LLM              | OpenRouter API, GPT-4o-mini (for interview questions, resume parsing, feedback) |
| Payment Integration | Razorpay                                                                         |
| File Storage        | AWS S3                                                                           |
| Deployment          | Vercel (Frontend), Render (Backend)                                             |

## Project Structure

```
MockHireAI/
├── client/                              # Frontend React + Vite application
│   ├── public/                          # Static files served by Vite
│   ├── src/
│   │   ├── assets/                      # Images, videos, and other static assets
│   │   ├── components/                  # Reusable React components
│   │   │   ├── AuthModel.jsx           # Login/signup modal
│   │   │   ├── Footer.jsx              # Footer component
│   │   │   ├── InterviewResult.jsx     # Component to display interview results
│   │   │   ├── InterviewSession.jsx    # Live interview session UI
│   │   │   ├── InterviewSetup.jsx      # Interview setup form
│   │   │   ├── Navbar.jsx              # Main navigation bar
│   │   │   └── Timer.jsx               # Interview timer component
│   │   ├── context/
│   │   │   └── authContext.jsx         # React Context for authentication state
│   │   ├── pages/                      # Page components
│   │   │   ├── About.jsx               # About page
│   │   │   ├── Admin.jsx               # Admin dashboard
│   │   │   ├── Auth.jsx                # Standalone login/signup page
│   │   │   ├── Contact.jsx             # Contact form page
│   │   │   ├── Home.jsx                # Landing page
│   │   │   ├── InterviewHistory.jsx    # List of past interviews
│   │   │   ├── InterviewPage.jsx       # Main interview page
│   │   │   ├── InterviewReport.jsx     # Detailed interview report page
│   │   │   └── Pricing.jsx             # Pricing/plans page
│   │   ├── utils/
│   │   │   └── firebase.js             # Firebase configuration
│   │   ├── App.css                     # Global CSS styles
│   │   ├── App.jsx                     # Main App component with routing
│   │   ├── index.css                   # Base CSS styles
│   │   └── main.jsx                    # React entry point
│   ├── .env                            # Frontend environment variables
│   ├── .gitignore
│   ├── .oxlintrc.json                  # Oxlint config
│   ├── index.html                      # Vite HTML entry point
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js                  # Vite configuration
│   └── README.md
├── server/                              # Backend Express application
│   ├── config/
│   │   └── db.js                       # MongoDB connection configuration
│   ├── controllers/                    # Route handlers
│   │   ├── admin.js                    # Admin controller (manage users, inquiries, plans)
│   │   ├── auth.js                     # Auth controller (login, logout)
│   │   ├── contact.js                  # Contact form controller
│   │   ├── interview.js                # Interview session controller
│   │   ├── payment.js                  # Razorpay payment controller
│   │   ├── plan.js                     # Subscription plans controller
│   │   └── user.js                     # User profile controller
│   ├── middleware/
│   │   ├── isAdmin.js                  # Middleware to check admin role
│   │   ├── isAuth.js                   # Middleware to verify JWT token
│   │   └── multer.js                   # Multer for file upload handling (memory storage)
│   ├── models/                         # Mongoose models
│   │   ├── contact.js                  # Contact form submission model
│   │   ├── interview.js                # Interview session model
│   │   ├── payment.js                  # Payment transaction model
│   │   ├── plan.js                     # Subscription plan model
│   │   └── user.js                     # User account model
│   ├── routes/                         # Express routes
│   │   ├── admin.js                    # Admin routes
│   │   ├── auth.js                     # Auth routes (google login, logout)
│   │   ├── contact.js                  # Contact routes
│   │   ├── interview.js                # Interview routes
│   │   ├── payment.js                  # Payment routes
│   │   ├── plan.js                     # Plan routes
│   │   └── user.js                     # User routes
│   ├── services/                       # External service integrations
│   │   ├── openRouter.js               # OpenRouter AI API integration (LLM)
│   │   ├── razorpay.js                 # Razorpay payment gateway integration
│   │   └── s3.js                       # AWS S3 file storage integration
│   ├── utils/
│   │   └── token.js                    # JWT token generation utility
│   ├── .env                            # Backend environment variables
│   ├── index.js                        # Backend entry point (Express server)
│   ├── package-lock.json
│   └── package.json
├── .env.example                        # Template for backend environment variables
├── .gitignore
└── README.md
```

## Environment Variables

### Backend (`server/.env`)
| Variable Name           | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| PORT                    | Server port number (default: 5000)                                          |
| MONGO_URI               | MongoDB Atlas connection string                                            |
| CLIENT_URL              | Frontend application URL (for CORS configuration)                          |
| NODE_ENV                | Set to "production" in production (for secure cookies)                      |
| JWT_SECRETKEY           | Secret key for signing JWT tokens                                           |
| OPENROUTER_API_KEY      | OpenRouter API Key for LLM integration (GPT-4o-mini)                        |
| RAZORPAY_KEY_ID         | Razorpay API Key ID                                                         |
| RAZORPAY_KEY_SECRET     | Razorpay API Key Secret                                                     |
| AWS_ACCESS_KEY_ID       | AWS IAM Access Key ID for S3 bucket access                                  |
| AWS_SECRET_ACCESS_KEY   | AWS IAM Secret Access Key for S3 bucket access                              |
| AWS_S3_BUCKET_NAME      | Name of your AWS S3 bucket                                                  |
| AWS_REGION              | AWS region (e.g., `us-east-1`)                                              |

### Frontend (`client/.env` or `client/.env.local`)
| Variable Name           | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| VITE_API_URL            | Backend API URL (e.g., `http://localhost:5000` for local, your Render URL for production) |
| VITE_FIREBASE_API_KEY   | Firebase API Key (from Firebase Console)                                    |

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gauravasodariya/MockHireAI.git
   cd MockHireAI
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

## Run Locally

1. **Set up environment variables:**
   - In `server/`, create a `.env` file using `.env.example` as a template and fill in your values
   - In `client/`, create a `.env.local` file and set `VITE_API_URL=http://localhost:5000`

2. **Start MongoDB (if running locally)** or ensure your MongoDB Atlas cluster is accessible

3. **Run the backend server:**
   ```bash
   cd server
   npm start
   ```

4. **Run the frontend dev server (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```

5. Open your browser and go to `http://localhost:5173` (Vite default port)

## Author
**Gaurav Asodariya**  
MSc IT Student, DAIICT  

GitHub: [https://github.com/gauravasodariya](https://github.com/gauravasodariya)
